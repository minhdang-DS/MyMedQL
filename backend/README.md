MyMedQL Backend (FastAPI)
=========================

This backend implements the ingestion, alert evaluation, persistence, and websocket broadcasting flow described in the specification.

Key entrypoints
---------------
- `app/main.py` – FastAPI application factory and router wiring.
- `app/api/routers` – HTTP endpoints for vitals ingestion, patients, and alerts.
- `app/services/alert_evaluator.py` – Core alert business logic with deduplication.
- `app/websockets/manager.py` – Connection manager that broadcasts JSON updates.

Local development
-----------------
1. Create a virtualenv with Python 3.11+ and install dependencies:
   ```bash
   cd MyMedQL/backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Run the API:
   ```bash
   uvicorn app.main:app --reload --port 3001
   ```
3. Set database env vars (defaults point to the docker-compose MySQL service):
   - `DB_HOST=db`
   - `DB_PORT=3306`
   - `DB_NAME=mymedql`
   - `DB_USER=medql_user`
   - `DB_PASSWORD=medql_pass`

Testing
-------
Pytest is configured to run against an in-memory SQLite database for speed.
# MyMedQL Backend API

Node.js/Express backend API for the MyMedQL real-time patient vital monitoring system.

## Features

- **RESTful API** with Express.js
- **JWT Authentication** and Role-Based Access Control (RBAC)
- **Database Integration** with MySQL using stored procedures and triggers
- **Real-time Updates** via WebSocket server
- **Data Encryption** for sensitive medical history
- **High-frequency Data Ingestion** endpoint for device vitals
- **Comprehensive Testing** with Jest (unit and integration tests)

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, RBAC, encryption, error handling
│   │   └── routes/          # API route definitions
│   ├── db/
│   │   ├── connection.js    # Database connection pool
│   │   ├── queries/         # Parameterized SQL queries
│   │   └── rbac/            # Permission definitions
│   ├── services/            # Business logic layer
│   ├── utils/               # Utility functions (encryption, etc.)
│   ├── websocket/           # WebSocket server for real-time updates
│   └── app.js               # Express app setup
├── tests/
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
└── package.json
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your configuration:

```bash
cp .env.example .env
```

Required environment variables:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` - Secret key for JWT tokens
- `ENCRYPTION_KEY` - 32-byte key for AES-256 encryption
- `INGESTION_API_KEY` - API key for device ingestion endpoint

### 3. Start Database

Make sure MySQL is running (via Docker Compose):

```bash
cd ..
docker-compose up -d mysql
```

### 4. Run Database Migrations

Execute the SQL files in `../sql/ddl/` in order (see SQL README).

### 5. Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`
WebSocket server at `ws://localhost:3000/ws`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Staff login
- `GET /api/v1/staff/me` - Get current user profile

### Patients
- `POST /api/v1/patients` - Create patient (admin, doctor, nurse)
- `GET /api/v1/patients/:id` - Get patient details (authenticated)
- `GET /api/v1/patients/:id/vitals` - Get patient vitals (uses stored procedure)
- `PUT /api/v1/patients/:id` - Update patient (admin, doctor)

### Vitals Ingestion
- `POST /api/v1/devices/ingest` - Ingest vital signs (API key required)

### Devices
- `POST /api/v1/devices/:id/assign` - Assign device to patient (admin, doctor, nurse)

### Alerts
- `GET /api/v1/alerts/unresolved` - Get unresolved alerts (authenticated)
- `POST /api/v1/alerts/:id/acknowledge` - Acknowledge alert (admin, doctor, nurse)

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access Control

Roles: `admin`, `doctor`, `nurse`, `viewer`

- **Admin**: Full access
- **Doctor**: Patient management, alerts, device assignment
- **Nurse**: Patient creation, device assignment, alerts
- **Viewer**: Read-only access

## WebSocket API

Connect to `ws://localhost:3000/ws` for real-time updates.

### Message Types

**Subscribe to patient updates:**
```json
{
  "type": "subscribe",
  "patient_id": 1
}
```

**Unsubscribe:**
```json
{
  "type": "unsubscribe",
  "patient_id": 1
}
```

**Received Messages:**
- `vitals_update` - New vital signs reading
- `alert` - New alert created
- `connection` - Connection confirmation

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

**Note:** Integration tests require a running MySQL database.

## Security Features

1. **SQL Injection Prevention**: All queries use parameterized statements
2. **Password Hashing**: bcrypt with salt rounds
3. **JWT Tokens**: Secure token-based authentication
4. **Data Encryption**: AES-256-GCM for medical history
5. **API Key Protection**: Device ingestion endpoint secured by API key
6. **RBAC**: Role-based permission system

## Database Integration

The backend integrates with MySQL stored procedures and triggers:

- **Stored Procedures**: `get_last_n_readings`, `aggregate_daily_stats`
- **Triggers**: Automatic alert creation on threshold breaches, admission validation

## Development

### Adding New Routes

1. Create controller in `src/api/controllers/`
2. Create route file in `src/api/routes/`
3. Register route in `src/app.js`

### Adding New Services

1. Create service file in `src/services/`
2. Add database queries in `src/db/queries/`
3. Use service in controllers

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong, unique values for `JWT_SECRET` and `ENCRYPTION_KEY`
3. Configure proper database connection pooling
4. Enable HTTPS for production
5. Set up proper logging and monitoring
6. Configure rate limiting for high-frequency endpoints

## License

Private project for COMP3030 course.

