# Testing Guide for MyMedQL Backend

This guide walks you through testing the entire backend system step by step.

## Prerequisites

1. **Python 3.10+** installed
2. **MySQL 8.0+** running (or Docker)
3. **Virtual environment** activated

## Step 1: Setup Environment

### Option A: Using Docker (Recommended)

```bash
# From project root
cd /home/khanhngoo/Desktop/MyMedQL/MyMedQL

# Start MySQL database
docker-compose up db -d

# Wait for database to be ready (check logs)
docker-compose logs db
```

### Option B: Local MySQL

Ensure MySQL is running on port 3307 (or update `.env`):
```bash
mysql -h 127.0.0.1 -P 3307 -u root -proot -e "SELECT 1"
```

**Note:** We use `127.0.0.1` instead of `localhost` because on Linux, `localhost` may try to use a Unix socket instead of TCP/IP, which fails when connecting to Docker containers.

### Create Environment File

Create `backend/.env`:
```bash
cd backend
cat > .env << EOF
DB_HOST=localhost
DB_PORT=3307
DB_NAME=mymedql
DB_USER=root
DB_PASSWORD=root
SECRET_KEY=test-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
EOF
```

### Install Dependencies

```bash
# Activate virtual environment
source ../venv/bin/activate  # or: source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

## Step 2: Initialize Database

Ensure database schema is created. If using Docker, it's automatic. For local MySQL:

```bash
# Connect to MySQL
mysql -h 127.0.0.1 -P 3307 -u root -proot

# In MySQL prompt:
CREATE DATABASE IF NOT EXISTS mymedql;
USE mymedql;

# Run schema files (from backend/sql/ddl/)
SOURCE sql/ddl/schema.sql;
SOURCE sql/ddl/triggers.sql;
SOURCE sql/ddl/stored_procedures.sql;
SOURCE sql/ddl/views.sql;
SOURCE sql/ddl/indexes.sql;
```

Or use the SQL files directly:
```bash
mysql -h 127.0.0.1 -P 3307 -u root -proot mymedql < sql/ddl/schema.sql
mysql -h 127.0.0.1 -P 3307 -u root -proot mymedql < sql/ddl/triggers.sql
# ... etc
```

## Step 3: Start the API Server

```bash
# From backend/ directory
uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload
```

You should see:
```
🚀 Starting MyMedQL API...
🚀 Vitals poller started
✅ MyMedQL API started
INFO:     Uvicorn running on http://0.0.0.0:3001
```

**Verify API is running:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"healthy"}
```

## Step 4: Test Basic Endpoints

### Test Health Check

```bash
curl http://localhost:3001/health
```

Expected: `{"status":"healthy"}`

### Test Root Endpoint

```bash
curl http://localhost:3001/
```

Expected: `{"message":"MyMedQL API","version":"1.0.0"}`

### View API Documentation

Open in browser:
- Swagger UI: http://localhost:3001/docs
- ReDoc: http://localhost:3001/redoc

## Step 5: Seed Test Data

Before testing endpoints, you need some data. Create a test patient and staff user:

```bash
# Connect to MySQL
mysql -h 127.0.0.1 -P 3307 -u root -proot mymedql
```

```sql
-- Insert a test patient
INSERT INTO patients (first_name, last_name, dob, gender) 
VALUES ('John', 'Doe', '1980-01-01', 'male');

-- Insert a test staff user (password: 'testpass123')
-- Password hash for 'testpass123' using bcrypt
INSERT INTO staff (name, email, password_hash, role)
VALUES ('Test Doctor', 'doctor@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJN5qKZ2O', 'doctor');

-- Note: To generate password hash, use Python:
-- python3 -c "from app.core.security import get_password_hash; print(get_password_hash('testpass123'))"
```

Or use the seed files if available:
```bash
mysql -h 127.0.0.1 -P 3307 -u root -proot mymedql < sql/seed/sample_data.sql
```

## Step 6: Test Patient Endpoints

### List Patients

```bash
curl http://localhost:3001/api/patients
```

### Get Patient Details

```bash
curl http://localhost:3001/api/patients/1
```

### Get Patient History (should be empty initially)

```bash
curl http://localhost:3001/api/patients/1/history
```

Expected: `[]` (empty array)

## Step 7: Run the Simulator

In a **new terminal**, start the simulator to generate vital signs data:

```bash
cd backend
source ../venv/bin/activate  # if not already activated

# Basic run (5 patients, 5 inserts/sec)
python simulator/main.py

# Or with custom rate
python simulator/main.py --rate 10 --patients 5
```

You should see output like:
```
🚀 Starting simulator...
   Patients: 5 (IDs: 1 to 5)
   Target rate: 10.0 inserts/sec
   Duration: indefinite (Ctrl+C to stop)
✅ Successfully inserted 5 vital record(s)
📊 Progress: 10 records inserted | Rate: 10.00 inserts/sec (target: 10.00)
```

**Let it run for 10-20 seconds, then stop with Ctrl+C.**

## Step 8: Verify Data Insertion

### Check Database Directly

```bash
mysql -h 127.0.0.1 -P 3307 -u root -proot mymedql
```

```sql
SELECT COUNT(*) FROM vitals;
SELECT * FROM vitals ORDER BY ts DESC LIMIT 5;
```

### Check via API

```bash
# Get patient history (should now have data)
curl http://localhost:3001/api/patients/1/history?limit=10
```

You should see JSON with vital signs records.

## Step 9: Test Authentication

### Login (Get Token)

```bash
curl -X POST http://localhost:3001/api/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=doctor@test.com&password=testpass123"
```

Expected response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

**Save the token** for next steps:
```bash
TOKEN="your-token-here"
```

### Test Protected Endpoint

```bash
# Without token (should fail)
curl http://localhost:3001/api/patients

# With token (should work)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/patients
```

### Create Patient (Protected)

```bash
curl -X POST http://localhost:3001/api/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "dob": "1990-05-15",
    "gender": "female",
    "medical_history": "Patient has history of hypertension"
  }'
```

## Step 10: Test WebSocket (Real-Time Updates)

### Using Python Script

Create `test_websocket.py`:

```python
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:3001/ws/vitals"
    async with websockets.connect(uri) as websocket:
        print("✅ Connected to WebSocket")
        print("Waiting for updates...")
        
        # Wait for messages
        for i in range(5):
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                data = json.loads(message)
                print(f"📡 Received: {data['type']} - {data['count']} new vitals")
            except asyncio.TimeoutError:
                print("⏱️  No updates received (timeout)")
                break

asyncio.run(test_websocket())
```

Run it:
```bash
# In one terminal: Keep WebSocket connected
python test_websocket.py

# In another terminal: Run simulator to generate data
python simulator/main.py --rate 5
```

You should see WebSocket messages when new vitals are inserted.

### Using Browser Console

Open browser console on http://localhost:3001/docs and run:

```javascript
const ws = new WebSocket('ws://localhost:3001/ws/vitals');
ws.onmessage = (event) => {
    console.log('Received:', JSON.parse(event.data));
};
ws.onopen = () => console.log('Connected');
```

Then run the simulator in another terminal to see messages appear.

## Step 11: Test Analytics Endpoints

### Patient Summary (if stored procedure exists)

```bash
curl http://localhost:3001/api/analytics/patients/1/summary
```

**Note:** This requires BE2 to create `sp_get_patient_summary` stored procedure. If not created, you'll get a 501 error.

### Hourly Stats (if stored procedure exists)

```bash
curl http://localhost:3001/api/analytics/hourly-stats
```

## Step 12: Load Testing

### Test API Performance

```bash
# Test patient history endpoint with 100 requests, 10 concurrent
python tests/load_test.py \
  --url http://localhost:3001 \
  --endpoint /api/patients/1/history \
  --requests 100 \
  --concurrency 10
```

Expected output:
```
🚀 Starting load test...
   URL: http://localhost:3001/api/patients/1/history
   Requests: 100
   Concurrency: 10
   Method: GET

============================================================
LOAD TEST RESULTS
============================================================
URL: http://localhost:3001/api/patients/1/history
Total Requests: 100
Successful: 100
Failed: 0
Total Time: 2.34 seconds
Requests/Second: 42.74

Response Times (seconds):
  Min:    0.0123
  Max:    0.0456
  Mean:   0.0234
  Median: 0.0210
  P95:    0.0389
  P99:    0.0421
...
```

### High-Rate Simulator Test

```bash
# Generate 50 inserts/second for 1 minute
python simulator/main.py --rate 50 --patients 10 --duration 60
```

Monitor the output to verify it maintains the target rate.

## Step 13: Integration Test Script

Create `test_integration.py` for automated testing:

```python
import requests
import time
import json

BASE_URL = "http://localhost:3001"

def test_health():
    """Test health endpoint"""
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"
    print("✅ Health check passed")

def test_patients():
    """Test patient endpoints"""
    # List patients
    r = requests.get(f"{BASE_URL}/api/patients")
    assert r.status_code == 200
    patients = r.json()
    print(f"✅ Found {len(patients)} patients")
    
    if patients:
        # Get first patient
        patient_id = patients[0]["patient_id"]
        r = requests.get(f"{BASE_URL}/api/patients/{patient_id}")
        assert r.status_code == 200
        print(f"✅ Patient {patient_id} details retrieved")
        
        # Get history
        r = requests.get(f"{BASE_URL}/api/patients/{patient_id}/history")
        assert r.status_code == 200
        vitals = r.json()
        print(f"✅ Patient {patient_id} has {len(vitals)} vital records")

def test_auth():
    """Test authentication"""
    # Login
    r = requests.post(
        f"{BASE_URL}/api/token",
        data={"username": "doctor@test.com", "password": "testpass123"}
    )
    if r.status_code == 200:
        token = r.json()["access_token"]
        print("✅ Authentication successful")
        
        # Test protected endpoint
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{BASE_URL}/api/patients", headers=headers)
        assert r.status_code == 200
        print("✅ Protected endpoint accessible")
    else:
        print("⚠️  Authentication test skipped (no test user)")

if __name__ == "__main__":
    print("🧪 Running integration tests...\n")
    try:
        test_health()
        test_patients()
        test_auth()
        print("\n✅ All tests passed!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        exit(1)
```

Run it:
```bash
pip install requests  # if not already installed
python test_integration.py
```

## Troubleshooting

### Database Connection Errors

```bash
# Check if MySQL is running
docker ps | grep mymedql-db
# or
mysql -h 127.0.0.1 -P 3307 -u root -proot -e "SELECT 1"

# Check database exists
mysql -h 127.0.0.1 -P 3307 -u root -proot -e "SHOW DATABASES LIKE 'mymedql'"
```

**Note:** If you get "Can't connect to local MySQL server through socket" error, use `127.0.0.1` instead of `localhost` to force TCP/IP connection.

### API Not Starting

```bash
# Check if port 3001 is in use
lsof -i :3001

# Check Python path
python3 -c "import sys; print(sys.path)"

# Check imports
python3 -c "from app.db.database import get_engine; print('OK')"
```

### Simulator Not Inserting Data

```bash
# Check database connection from simulator
python3 -c "from app.db.database import test_connection; test_connection()"

# Check if patients exist
mysql -h 127.0.0.1 -P 3307 -u root -proot mymedql -e "SELECT patient_id FROM patients LIMIT 5"
```

### WebSocket Not Receiving Updates

1. Check poller started: Look for "🚀 Vitals poller started" in API logs
2. Verify data exists: `SELECT COUNT(*) FROM vitals WHERE ts > DATE_SUB(NOW(), INTERVAL 1 MINUTE)`
3. Check WebSocket connection: Look for "✅ WebSocket client connected" in API logs

## Quick Test Checklist

- [ ] API server starts without errors
- [ ] Health endpoint returns 200
- [ ] Can list patients (may be empty)
- [ ] Simulator inserts data successfully
- [ ] Patient history endpoint returns data after simulator runs
- [ ] Authentication works (login returns token)
- [ ] Protected endpoints require authentication
- [ ] WebSocket connects and receives updates
- [ ] Load test completes successfully

## Next Steps

After basic testing:
1. Coordinate with BE2 to test stored procedures
2. Test with real generator (when BE2 creates it)
3. Test encryption/decryption of medical history
4. Performance testing with indexing (coordinate with BE2)
5. Full end-to-end test with frontend

