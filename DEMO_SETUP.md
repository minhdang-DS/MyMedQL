# 🎬 Demo Setup Guide - Patient Dashboard Live Monitoring

This guide explains how to run the live monitoring demo for the patient dashboard.

## Issue Fixed: Vitals Not Updating

### Problem
The patient dashboard was showing fixed vital signs numbers that weren't updating in real-time.

### Root Cause
1. **WebSocket Connection**: The frontend WebSocket hook needed better environment variable handling
2. **Data Availability**: Needed fresh vital signs data for the poller to detect and broadcast
3. **Debugging**: Added console logging to help diagnose connection issues

### Fixes Applied

1. **Updated WebSocket Hook** (`frontend/app/hooks/useWebSocket.js`):
   - Improved environment variable handling for WebSocket URL
   - Added console logging for debugging

2. **Updated Patient Dashboard** (`frontend/components/PatientDashboard.jsx`):
   - Added detailed console logging for WebSocket message processing
   - Improved patient_id matching logic

3. **Created Demo Data Generator** (`backend/scripts/generate_demo_vitals.py`):
   - Script to continuously generate vital signs for patient 1
   - Inserts new vitals every 1 second for 10 minutes (600 records)

## How to Run the Demo

### Step 1: Start All Services

```bash
cd "/Users/dinhieufam/DINHHIEU/VINUNI/Fall 25/COMP3030 - Databases and Database Systems/Project/MyMedQL"
docker-compose up -d
```

### Step 2: Generate Demo Data (10 minutes)

Run the continuous data generator in the background:

```bash
# Option 1: Run in background (recommended for demo)
docker-compose exec -d backend python /app/scripts/generate_demo_vitals.py

# Option 2: Run in foreground to see progress
docker-compose exec backend python /app/scripts/generate_demo_vitals.py
```

This will:
- Generate 600 vital signs records over 10 minutes
- Insert new data every 1 second
- Each record has realistic vital sign values that vary slightly

### Step 3: Access Patient Dashboard

1. Open browser: http://localhost:3000
2. Navigate to Patient Login
3. Login with:
   - **Patient ID**: `1`
   - **Password**: `password123`
4. You should see the patient dashboard with live monitoring

### Step 4: Verify Live Updates

1. **Open Browser Console** (F12 → Console tab)
2. You should see:
   - `WebSocket Connected` - Connection established
   - `WebSocket message received:` - Messages being received
   - `Processing vitals update:` - Updates being processed
   - `Updating vitals with:` - Dashboard updating

3. **Watch the Dashboard**:
   - Vital signs should update every 1 second
   - Numbers should change (heart rate, SpO2, BP, temperature, respiration)
   - Waveforms should animate smoothly

## Troubleshooting

### Vitals Still Not Updating?

1. **Check WebSocket Connection**:
   ```bash
   # Check backend logs for WebSocket connections
   docker-compose logs backend | grep -i "websocket\|connected"
   
   # Should see: "✅ WebSocket client connected"
   ```

2. **Check Poller is Broadcasting**:
   ```bash
   # Check for broadcast messages
   docker-compose logs backend | grep -i "broadcast"
   
   # Should see: "📡 Broadcasted X new vital sign(s)"
   ```

3. **Check Browser Console**:
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Look for WebSocket connection messages

4. **Verify Data is Being Generated**:
   ```bash
   # Check recent vitals count
   docker-compose exec -T db mysql -uroot -proot mymedql -e \
     "SELECT COUNT(*) FROM vitals WHERE patient_id = 1 AND ts > DATE_SUB(NOW(), INTERVAL 1 MINUTE);"
   ```

5. **Restart Data Generator**:
   ```bash
   # Stop any running generator
   docker-compose exec backend pkill -f generate_demo_vitals
   
   # Start fresh
   docker-compose exec -d backend python /app/scripts/generate_demo_vitals.py
   ```

### WebSocket Not Connecting?

1. **Check Frontend Environment Variables**:
   ```bash
   docker-compose exec frontend env | grep WS
   # Should show: NEXT_PUBLIC_WS_URL=ws://localhost:3001
   ```

2. **Rebuild Frontend** (if environment variables changed):
   ```bash
   docker-compose up -d --build frontend
   ```

3. **Check Backend WebSocket Endpoint**:
   - Backend should be running on port 3001
   - WebSocket endpoint: `ws://localhost:3001/ws/vitals`

## Data Generation Details

### Current Data Status

- **Total Records for Patient 1**: 348+ records
- **Recent Records** (last hour): 313+ records
- **Data Range**: Covers multiple hours of historical data

### Generate More Data

```bash
# Generate 10 minutes of data (600 records, 1 every 1 second)
docker-compose exec backend python /app/scripts/generate_demo_vitals.py

# Or use the simulator for custom rates
docker-compose exec backend python /app/simulator/main.py \
  --patients 1 \
  --start-id 1 \
  --rate 1.0 \
  --duration 600
```

## Expected Behavior

### Initial Load
- Dashboard fetches latest vital signs from API
- Displays current values immediately

### Real-Time Updates
- WebSocket receives new vital signs every 1 second
- Dashboard updates automatically
- Numbers change smoothly
- Waveforms animate continuously

### Demo Duration
- 10 minutes of continuous updates
- 600 new vital signs records (1 per second)
- Each update visible on dashboard within 1-2 seconds

## Technical Details

### Data Flow

```
Simulator/Generator
    ↓ (inserts every 1 second)
Database (vitals table)
    ↓ (poller checks every 1 second)
WebSocket Poller
    ↓ (broadcasts new records)
WebSocket Server
    ↓ (sends to connected clients)
Frontend (useWebSocket hook)
    ↓ (updates state)
Patient Dashboard
    ↓ (renders new values)
Screen Display
```

### WebSocket Message Format

```json
{
  "type": "vitals_update",
  "count": 1,
  "data": [
    {
      "vitals_id": 123,
      "patient_id": 1,
      "device_id": 1,
      "ts": "2025-12-19T18:30:00",
      "heart_rate": 78,
      "spo2": 99,
      "bp_systolic": 121,
      "bp_diastolic": 78,
      "temperature_c": 36.8,
      "respiration": 16
    }
  ],
  "timestamp": "2025-12-19T18:30:00.123456"
}
```

## Quick Commands

```bash
# Start demo data generator
docker-compose exec -d backend python /app/scripts/generate_demo_vitals.py

# Check if generator is running
docker-compose exec backend ps aux | grep generate_demo_vitals

# Stop generator
docker-compose exec backend pkill -f generate_demo_vitals

# View recent vitals
docker-compose exec -T db mysql -uroot -proot mymedql -e \
  "SELECT ts, heart_rate, spo2, bp_systolic, bp_diastolic FROM vitals WHERE patient_id = 1 ORDER BY ts DESC LIMIT 5;"

# Check WebSocket connections
docker-compose logs backend | grep -i "websocket"
```

---

**Note**: The demo generator runs for 10 minutes (600 records, 1 per second). For longer demos, restart the generator or use the simulator with custom duration.

