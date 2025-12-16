# MyMedQL Backend API

FastAPI-based backend for real-time patient vital monitoring and anomaly detection system.

## Features

- **Real-time Data Ingestion**: Simulator for generating and inserting vital signs data
- **RESTful API**: FastAPI endpoints for patient data, vital signs history, and analytics
- **Authentication**: OAuth2 password flow with JWT tokens
- **Data Encryption**: Medical history encrypted at rest using Fernet symmetric encryption
- **WebSocket Support**: Real-time updates via WebSocket for live dashboard
- **Stored Procedures**: Integration with MySQL stored procedures for analytics
- **Load Testing**: Tools for performance testing and verification

## Project Structure

```
backend/
├── app/                    # FastAPI application
│   ├── api/               # API endpoints
│   │   ├── endpoints/     # Route handlers
│   │   └── dependencies.py # FastAPI dependencies (auth, etc.)
│   ├── core/              # Core utilities
│   │   ├── security.py    # JWT and password hashing
│   │   └── encryption.py  # Medical history encryption
│   ├── db/                # Database connection
│   │   └── database.py    # SQLAlchemy Core engine
│   ├── websocket/         # WebSocket support
│   │   ├── connection_manager.py
│   │   └── poller.py      # Background poller for DB updates
│   └── main.py            # FastAPI app entry point
├── simulator/             # Data simulator
│   ├── sql_templates/     # SQL templates for inserts
│   ├── db_writer.py       # Batch insert functions
│   └── main.py            # Simulator main script
├── sql/                   # SQL scripts
│   ├── ddl/               # Data Definition Language (schema, triggers, etc.)
│   └── seed/              # Seed data
├── tests/                 # Test files
│   └── load_test.py       # Load testing script
└── requirements.txt       # Python dependencies
```

## Quick Start

### Prerequisites

- Python 3.10+
- MySQL 8.0+ (or Docker)
- Virtual environment (recommended)

### Local Development Setup

1. **Create and activate virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment variables:**
Create a `.env` file in the `backend/` directory:
```env
# Database Configuration (for local development)
DB_HOST=localhost
DB_PORT=3307
DB_NAME=mymedql
DB_USER=root
DB_PASSWORD=root

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Encryption Key (generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
ENCRYPTION_KEY=your-encryption-key-here
```

4. **Start the API server:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload
```

The API will be available at `http://localhost:3001`

### Docker Setup

1. **Start all services:**
```bash
docker-compose up --build
```

**Note:** The `docker-compose.yml` references `./sql/ddl` but SQL files are in `backend/sql/ddl/`. You may need to:
- Create a symlink: `ln -s backend/sql sql` (from project root), or
- Update `docker-compose.yml` to use `./backend/sql/ddl`

2. **Access the API:**
- API: `http://localhost:3001`
- API Docs: `http://localhost:3001/docs`
- Health Check: `http://localhost:3001/health`

## Running the Simulator

The simulator generates and inserts vital signs data into the database.

### Basic Usage

```bash
# Default: 5 patients, 5 inserts/sec
python simulator/main.py

# Custom rate (50 inserts/sec for load testing)
python simulator/main.py --rate 50 --patients 10

# Run for specific duration (10 minutes = 600 seconds)
python simulator/main.py --rate 50 --duration 600
```

### Simulator Options

- `--rate`: Target insert rate (inserts per second). Default: 5.0
- `--patients`: Number of patients to simulate. Default: 5
- `--start-id`: Starting patient ID. Default: 1
- `--duration`: Duration in seconds (0 = run indefinitely). Default: 0

### Example: Load Testing

```bash
# Generate 50 inserts/second for 10 minutes
python simulator/main.py --rate 50 --patients 10 --duration 600
```

## API Endpoints

### Authentication

- `POST /api/token` - Login (OAuth2 password flow)
  - Form data: `username` (email), `password`
  - Returns: `{"access_token": "...", "token_type": "bearer"}`

### Patients (Protected)

- `GET /api/patients` - List all patients
- `GET /api/patients/{id}` - Get patient details
- `GET /api/patients/{id}/history` - Get vital signs history
  - Query params: `limit` (default: 100, max: 1000)
- `POST /api/patients` - Create new patient (requires authentication)
  - Body: Patient data including `medical_history` (plain text, will be encrypted)

### Analytics

- `GET /api/analytics/patients/{id}/summary` - Get patient summary (stored procedure)
- `GET /api/analytics/hourly-stats` - Get hourly aggregated statistics

### WebSocket

- `WS /ws/vitals` - Real-time vital signs updates
  - Connects and receives JSON messages when new vitals are inserted

### Health

- `GET /health` - Health check endpoint
- `GET /` - API information

## Load Testing

Use the load testing script to measure API performance:

```bash
# Test patient history endpoint
python tests/load_test.py --url http://localhost:3001 --endpoint /api/patients/1/history --requests 100 --concurrency 10
```

### Load Test Options

- `--url`: Base API URL (default: http://localhost:3001)
- `--endpoint`: Endpoint to test (default: /api/patients/1/history)
- `--requests`: Number of requests (default: 100)
- `--concurrency`: Concurrent requests (default: 10)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3307` |
| `DB_NAME` | Database name | `mymedql` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | `root` |
| `SECRET_KEY` | JWT secret key | `change-me-in-production` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | `1440` (24 hours) |
| `ENCRYPTION_KEY` | Fernet encryption key | (required) |

## Database Connection

The backend uses **SQLAlchemy Core** (not ORM) for database operations. All queries use raw SQL with parameterized queries to prevent SQL injection.

Connection pooling is configured with:
- Pool size: 10
- Max overflow: 20
- Connection pre-ping: Enabled (verifies connections before use)

## Security

### Authentication

- Passwords are hashed using bcrypt
- JWT tokens are used for API authentication
- Tokens expire after 24 hours (configurable)

### Encryption

- Medical history is encrypted using Fernet (symmetric encryption)
- Encryption key must be set in `ENCRYPTION_KEY` environment variable
- Generate a key: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`

## Troubleshooting

### Database Connection Issues

- Verify MySQL is running: `docker ps` or `mysql -h localhost -P 3307 -u root -proot`
- Check environment variables in `.env`
- For Docker: Ensure backend service can reach `db` service on port 3306

### Import Errors

- Ensure virtual environment is activated
- Install dependencies: `pip install -r requirements.txt`
- Check Python path: `python -c "import sys; print(sys.path)"`

### WebSocket Not Working

- Verify poller is started (check startup logs)
- Check database connection
- Ensure vitals table has data with recent timestamps

### Stored Procedure Errors

- Verify BE2 has created stored procedures in `sql/ddl/stored_procedures.sql`
- Check MySQL logs for procedure creation errors
- Ensure procedures are created before calling endpoints

## Development Notes

- The simulator uses a mock `PatientVitalState` until BE2 creates `simulator/generator.py`
- WebSocket poller checks for new vitals every 1 second
- All SQL queries use parameterized queries for security
- Database uses port 3307 on host (3306 in Docker network)

## API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:3001/docs`
- ReDoc: `http://localhost:3001/redoc`

## License

[Your License Here]

