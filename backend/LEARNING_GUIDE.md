# 🎯 MyMedQL Backend - Learning Guide for 2 People

## 📊 System Overview (Both Should Start Here - 15 mins)

**What the system does:**
- Medical monitoring system that ingests vital signs from IoT sensors
- Evaluates vitals against patient-specific thresholds
- Generates alerts when thresholds are breached
- Broadcasts real-time updates via WebSockets
- Stores patient data, vitals, alerts in MySQL database

**Technology Stack:**
- **FastAPI** - Modern async Python web framework
- **SQLAlchemy** - Async ORM for database operations
- **MySQL** - Relational database
- **WebSockets** - Real-time bidirectional communication
- **Pydantic** - Data validation and settings management
- **pytest** - Testing framework with async support

**Architecture Pattern:**
```
┌─────────────┐
│   Sensors   │ (IoT devices)
└──────┬──────┘
       │ HTTP POST
       ▼
┌─────────────────────────────────────────┐
│           FastAPI Backend               │
│  ┌─────────────────────────────────┐   │
│  │  1. Vitals Ingestion (Person 1) │   │
│  │     ↓                            │   │
│  │  2. Alert Evaluation (Person 2) │   │
│  │     ↓                            │   │
│  │  3. Database Persistence        │   │
│  │     ↓                            │   │
│  │  4. WebSocket Broadcast         │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
       │                    │
       ▼                    ▼
   ┌────────┐        ┌──────────┐
   │ MySQL  │        │ WebSocket│
   │   DB   │        │ Clients  │
   └────────┘        └──────────┘
```

---

## 👤 PERSON 1: Data Flow & Patient Management
**Focus: "The Write Path" - How data enters and flows through the system**

### Learning Order:

#### Phase 1: Foundation (30-45 mins)

##### 1. `app/core/config.py` ⚙️
**What to learn:**
- Configuration management using Pydantic Settings
- Database connection strings (async and sync)
- Environment variables loading
- Settings singleton pattern with `@lru_cache`

**Key concepts:**
- Pydantic `BaseSettings` for configuration validation
- Property decorators for computed values (e.g., `database_url_async`)
- Dependency injection through settings

**Questions to answer:**
- How does the app connect to MySQL?
- What environment variables are required?
- How is configuration accessed throughout the app?

---

##### 2. `app/db/session.py` 🗄️
**What to learn:**
- Async SQLAlchemy engine creation
- Session factory pattern
- `get_db()` dependency for database access

**Key concepts:**
- `create_async_engine` for async database operations
- `async_sessionmaker` for creating sessions
- Context manager pattern for automatic cleanup

**Code to understand:**
```python
engine = create_async_engine(settings.database_url_async, ...)
SessionLocal = async_sessionmaker(engine, ...)

async def get_db():
    async with SessionLocal() as session:
        yield session  # Dependency injection
```

---

##### 3. `app/db/base.py` + `app/db/base_class.py` 📚
**What to learn:**
- Base model class that all database models inherit from
- Model registration for SQLAlchemy
- How imports ensure all models are discovered

**Key concepts:**
- `DeclarativeBase` pattern
- Model metadata registration
- Import side effects for model discovery

---

#### Phase 2: Patient Domain (45-60 mins)

##### 4. `app/models/patient.py` 👥
**What to learn:**
- Patient database table structure
- SQLAlchemy model definition
- Relationships with vitals, alerts, thresholds

**Key attributes:**
- `id` - Primary key
- `patient_id` - Unique identifier string
- `name` - Patient name
- `created_at` - Timestamp with timezone
- Relationships: `vitals`, `alerts`, `thresholds`

**Key concepts:**
- `Mapped[type]` for type-safe column definitions
- `relationship()` for defining foreign key relationships
- `cascade="all, delete-orphan"` for referential integrity

---

##### 5. `app/schemas/patient.py` 📋
**What to learn:**
- Pydantic models for API request/response
- Data validation rules
- Serialization/deserialization

**Schema types:**
- `PatientCreate` - For creating new patients
- `PatientRead` - For API responses
- `PatientBase` - Shared fields

**Key concepts:**
- Pydantic automatic validation
- `Config` class for ORM mode
- Type hints for automatic documentation

---

##### 6. `app/api/routers/patients.py` 🛣️
**What to learn:**
- REST API endpoints for patient management
- FastAPI routing and path parameters
- Dependency injection with `Depends()`

**Endpoints:**
- `GET /patients/{patient_id}` - Get single patient
- `GET /patients/{patient_id}/history` - Get vital history
- `POST /patients` - Create new patient

**Key concepts:**
- `APIRouter()` for modular routing
- `response_model` for automatic serialization
- `HTTPException` for error handling
- Async route handlers

**Flow to trace:**
```python
Client Request
  → Router endpoint
  → Get DB session (dependency)
  → Query database
  → Return Pydantic model
  → FastAPI serializes to JSON
```

---

#### Phase 3: Vitals Ingestion Flow (60-90 mins)

##### 7. `app/models/vital.py` 💓
**What to learn:**
- Vital signs data model
- Time-series data structure
- Foreign key to patients table

**Key attributes:**
- `id` - Primary key
- `patient_id` - Foreign key to patients
- `sensor_id` - Which sensor sent the data
- `timestamp` - When the reading was taken
- `heart_rate`, `spo2`, `systolic_bp`, `diastolic_bp`, `body_temp` - Vital measurements
- `ingested_at` - When the backend received it

**Key concepts:**
- Time-series data modeling
- Composite indexes for performance
- Foreign key relationships with `ForeignKey()`

---

##### 8. `app/schemas/vital.py` 📊
**What to learn:**
- Vital data validation schemas
- Input validation rules
- Output serialization format

**Schemas:**
- `VitalCreate` - For ingesting new vitals
- `VitalRead` - For API responses

**Validation examples:**
- Heart rate must be positive
- SpO2 must be between 0-100
- Timestamps must be valid datetime

---

##### 9. `app/services/vital_service.py` ⚡ **[CRITICAL - MOST IMPORTANT FILE FOR PERSON 1]**

**What to learn:**
This is the **heart of the data ingestion pipeline**. Understand every line!

**Key class: `VitalService`**

**Main method: `ingest_batch()`**
```python
async def ingest_batch(
    session: AsyncSession,
    payloads: Sequence[VitalCreate],
    connection_manager: ConnectionManager
) -> List[Vital]:
```

**Step-by-step flow:**
1. **Validation**: Validate all incoming vital payloads
2. **Patient lookup**: Fetch all referenced patients from database
3. **Threshold lookup**: Fetch thresholds for each patient
4. **Alert evaluation**: For each vital, check if thresholds are breached
   - Calls `AlertEvaluator.evaluate()` (Person 2's domain)
5. **Database persistence**: Save vitals and alerts in a transaction
6. **WebSocket broadcast**: Notify all connected clients
   - Broadcasts both vital updates AND alert updates

**Key concepts:**
- Batch processing for efficiency
- Transaction management with `session.commit()`
- Separation of concerns (service layer)
- Error handling and rollback
- Async/await throughout

**Critical interactions:**
- Works with `AlertEvaluator` to check thresholds
- Uses `ConnectionManager` to broadcast updates
- Manages database transactions

**Questions to answer:**
- What happens if one vital in a batch is invalid?
- How are alerts created during ingestion?
- When does the WebSocket broadcast happen?
- What's the database transaction boundary?

---

##### 10. `app/api/routers/vitals.py` 📥
**What to learn:**
- Vitals ingestion API endpoint
- How external systems POST data
- Integration with `VitalService`

**Main endpoint:**
```python
POST /api/v1/vitals
Body: List[VitalCreate]
Response: 202 Accepted, List[VitalRead]
```

**Flow:**
1. FastAPI receives POST request
2. Pydantic validates payload against `VitalCreate` schema
3. `get_db()` provides database session
4. `get_connection_manager()` provides WebSocket manager
5. Calls `VitalService.ingest_batch()`
6. Returns list of saved vitals

**Key concepts:**
- `status.HTTP_202_ACCEPTED` - Async processing accepted
- Batch processing (accepts array of vitals)
- Dependency injection for session and WebSocket manager

---

#### Phase 4: Testing & Integration (30 mins)

##### 11. `tests/test_vitals_ingest.py` 🧪
**What to learn:**
- How to test async FastAPI endpoints
- Test fixtures and mocking
- Database testing with in-memory SQLite

**Test structure:**
```python
@pytest.mark.asyncio
async def test_vitals_ingest_creates_record(session, seeded_patient):
    # Arrange: Create test data
    # Act: Call the service
    # Assert: Verify results
```

**Key concepts:**
- `pytest-asyncio` for async test support
- `conftest.py` fixtures for test setup
- In-memory database for fast testing
- Mocking dependencies

---

##### 12. `app/main.py` (Focus on lines 1-30, 49-51) 🚀
**What to learn:**
- FastAPI app initialization
- Middleware configuration (CORS)
- Router registration
- Health check endpoint

**Key parts:**
```python
# App creation
app = FastAPI(title="MyMedQL Backend", version="1.0")

# CORS middleware
app.add_middleware(CORSMiddleware, ...)

# Router registration
app.include_router(api_router)

# Health endpoint
@app.get("/health")
async def health():
    return {"status": "ok"}
```

---

### Person 1 Checkpoint Questions:

After completing all phases, you should be able to answer:

1. **Data Flow**: Trace the complete path of a vital reading from sensor to database
2. **Validation**: Where and how is data validated?
3. **Persistence**: How are database transactions handled?
4. **Relationships**: How are patients, vitals, and thresholds related?
5. **Async**: Why is async/await used throughout?
6. **Services**: What's the purpose of the service layer?
7. **Testing**: How is the ingestion flow tested?

---

## 👤 PERSON 2: Alert System & Real-time Communication
**Focus: "The Alert & Notification Path" - How the system monitors and alerts**

### Learning Order:

#### Phase 1: Foundation (30-45 mins)

##### 1. `app/core/config.py` ⚙️
**What to learn:**
- Same as Person 1, but focus on:
  - `secret_key` for JWT authentication
  - `algorithm` for token signing
  - `access_token_expire_minutes`

---

##### 2. `app/core/security.py` 🔐
**What to learn:**
- JWT token creation and verification
- Password hashing with bcrypt
- Authentication helpers

**Key functions:**
- `create_access_token()` - Generate JWT tokens
- `verify_token()` - Validate and decode JWT
- `get_password_hash()` - Hash passwords
- `verify_password()` - Check passwords

**Key concepts:**
- JWT (JSON Web Tokens) for stateless auth
- `python-jose` library for JWT operations
- `passlib` for password hashing
- Security best practices

**Flow:**
```python
User login
  → verify_password(plain, hashed)
  → create_access_token({"sub": user_id})
  → Return JWT to client

Authenticated request
  → Extract token from header
  → verify_token(token)
  → Get user info from payload
```

---

##### 3. `app/api/dependencies.py` 🔗
**What to learn:**
- Shared dependencies used across the app
- Dependency injection pattern
- Singleton pattern for managers

**Key dependencies:**
- `get_db()` - Database session provider
- `get_current_user()` - Authentication dependency
- `get_connection_manager()` - WebSocket manager singleton
- `connection_manager` - Singleton instance

**Key concepts:**
- FastAPI dependency injection with `Depends()`
- Singleton pattern for stateful objects
- OAuth2 password bearer scheme
- Generator functions for cleanup

---

#### Phase 2: Threshold & Alert Domain (60-90 mins)

##### 4. `app/models/threshold.py` 🎯
**What to learn:**
- Patient-specific threshold configuration
- Acceptable ranges for vital signs
- Unique constraint per patient

**Key attributes:**
- `id` - Primary key
- `patient_id` - Foreign key (unique per patient)
- `hr_max` - Maximum heart rate
- `hr_min` - Minimum heart rate
- `spo2_min` - Minimum oxygen saturation
- `spo2_max` - Maximum oxygen saturation
- Similar for BP and temperature

**Key concepts:**
- Configuration data vs operational data
- `UniqueConstraint` for one threshold per patient
- Nullable fields for optional thresholds

---

##### 5. `app/schemas/threshold.py` 📐
**What to learn:**
- Threshold validation schemas
- Min/max value validation
- Business rules in Pydantic validators

**Validation rules:**
- Maximums must be greater than minimums
- Values must be in realistic ranges
- Optional fields for flexibility

---

##### 6. `app/models/alert.py` 🚨
**What to learn:**
- Alert event data model
- Alert lifecycle (created → acknowledged → resolved)
- Severity levels

**Key attributes:**
- `id` - Primary key
- `patient_id` - Which patient triggered the alert
- `severity` - "critical", "warning", "info"
- `message` - Human-readable description
- `vital_type` - Which vital breached (e.g., "heart_rate")
- `vital_value` - The actual value that triggered
- `threshold_breached` - What threshold was breached
- `created_at` - When alert was created
- `acknowledged_at` - When staff acknowledged
- `resolved_at` - When alert was resolved

**Key concepts:**
- Event sourcing pattern
- State tracking with nullable timestamps
- Foreign key to patients

**Alert states:**
```
Created (created_at set)
  ↓
Acknowledged (acknowledged_at set) [optional]
  ↓
Resolved (resolved_at set)
```

---

##### 7. `app/schemas/alert.py` 📢
**What to learn:**
- Alert data transfer objects
- Response models for API

**Schemas:**
- `AlertRead` - Full alert details
- `AlertAckResponse` - Acknowledgment confirmation
- `AlertCreate` - For creating new alerts (internal)

**Key fields:**
- All database fields serialized
- Additional computed fields
- Nested patient information

---

##### 8. `app/services/alert_evaluator.py` 🧠 **[CRITICAL - MOST IMPORTANT FILE FOR PERSON 2]**

**What to learn:**
This is the **brain of the alert system**. Understand the complete evaluation logic!

**Key class: `AlertEvaluator`**

**Main method: `evaluate()`**
```python
@staticmethod
async def evaluate(
    session: AsyncSession,
    vital: Vital,
    threshold: Optional[Threshold]
) -> Optional[Alert]:
```

**Step-by-step flow:**

1. **Check if thresholds exist**
   - If no threshold configured, return None (no alert)

2. **Evaluate each vital parameter**
   - Heart rate: Check if > max or < min
   - SpO2: Check if < min or > max
   - Blood pressure: Check systolic and diastolic
   - Body temperature: Check bounds

3. **Determine severity**
   - Critical: Multiple breaches or severe single breach
   - Warning: Single breach
   - Info: Near threshold

4. **Check deduplication**
   - Query for recent alerts (last 5 minutes)
   - If similar alert exists recently, suppress (no new alert)
   - Prevents alert spam

5. **Create alert if needed**
   - Build alert message
   - Set severity
   - Save to database
   - Return alert object

**Key concepts:**
- Business rules and thresholds
- Deduplication logic (cooldown period)
- Severity calculation
- Time-based queries
- Optional return (may or may not create alert)

**Critical logic:**
```python
# Deduplication - check for recent similar alerts
cooldown_time = datetime.now(timezone.utc) - timedelta(minutes=5)
recent_alert = await session.execute(
    select(Alert)
    .where(
        Alert.patient_id == vital.patient_id,
        Alert.vital_type == "heart_rate",  # example
        Alert.created_at >= cooldown_time
    )
)
if recent_alert.scalars().first():
    return None  # Suppress duplicate alert
```

**Questions to answer:**
- When is an alert NOT created even if threshold is breached?
- How is severity determined?
- What prevents alert spam?
- How long is the deduplication window?
- What happens to the alert object after creation?

---

##### 9. `app/api/routers/alerts.py` 📡
**What to learn:**
- Alert retrieval and management endpoints
- Filtering and querying alerts
- Alert acknowledgment flow

**Key endpoints:**

```python
GET /api/v1/alerts
  - List all unresolved alerts
  - Query parameters: severity, patient_id, limit

GET /api/v1/alerts/{alert_id}
  - Get single alert details

POST /api/v1/alerts/{alert_id}/acknowledge
  - Mark alert as acknowledged
  - Sets acknowledged_at timestamp

POST /api/v1/alerts/{alert_id}/resolve
  - Mark alert as resolved
  - Sets resolved_at timestamp

GET /api/v1/alerts/patient/{patient_id}
  - Get all alerts for a specific patient
```

**Key concepts:**
- RESTful API design
- Query parameters for filtering
- PATCH/POST for state changes
- Idempotent operations

**Flow example (acknowledgment):**
```python
POST /api/v1/alerts/123/acknowledge
  ↓
Get alert from database
  ↓
Check if already acknowledged
  ↓
Set acknowledged_at = now()
  ↓
Save to database
  ↓
Return updated alert
```

---

#### Phase 3: Real-time Communication (45-60 mins)

##### 10. `app/websockets/manager.py` 📲 **[CRITICAL - KEY INFRASTRUCTURE]**

**What to learn:**
This manages all real-time communication with clients!

**Key class: `ConnectionManager`**

**Key methods:**

```python
async def connect(websocket: WebSocket):
    """Accept new WebSocket connection"""
    await websocket.accept()
    active_connections.append(websocket)

def disconnect(websocket: WebSocket):
    """Remove disconnected client"""
    active_connections.remove(websocket)

async def broadcast(message: dict):
    """Send message to all connected clients"""
    for connection in active_connections:
        await connection.send_json(message)
```

**Message formats:**

```json
// Vital update
{
  "type": "VITAL_NEW",
  "data": {
    "patient_id": "patient-123",
    "heart_rate": 120,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}

// Alert notification
{
  "type": "ALERT_NEW",
  "data": {
    "alert_id": 456,
    "patient_id": "patient-123",
    "severity": "critical",
    "message": "Heart rate exceeded threshold"
  }
}
```

**Key concepts:**
- WebSocket protocol (persistent connections)
- Pub-sub pattern
- Broadcast vs unicast
- Connection lifecycle management
- Error handling for disconnected clients

**Integration points:**
- Called by `VitalService` after saving vitals
- Broadcasts both vitals and alerts
- Singleton pattern (one manager for entire app)

---

##### 11. `app/main.py` (Focus on lines 32-46, 54-63) 🌐

**What to learn:**

**Database initialization (startup event):**
```python
@app.on_event("startup")
async def on_startup():
    await create_tables(engine)
```
- Creates all tables on app startup
- Uses SQLAlchemy metadata
- Can be skipped with `SKIP_DB_INIT=1` for testing

**WebSocket endpoint:**
```python
@app.websocket("/ws")
async def websocket_endpoint(websocket, manager=Depends(get_connection_manager)):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)
```

**Key concepts:**
- Application lifecycle events
- WebSocket endpoint definition
- Keep-alive loop
- Graceful disconnect handling
- Dependency injection for manager

**Client usage:**
```javascript
// JavaScript client example
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'ALERT_NEW') {
        showAlert(message.data);
    }
};
```

---

#### Phase 4: Testing & Integration (30 mins)

##### 12. `tests/test_alert_evaluator.py` 🧪

**What to learn:**
- Testing business logic in isolation
- Test fixtures for test data
- Async test patterns

**Key tests:**

```python
test_alert_evaluator_returns_critical()
  - Tests that critical threshold breach creates alert
  - Verifies severity is set correctly

test_alert_evaluator_no_alert_when_normal()
  - Tests that normal vitals don't create alerts
  - Verifies None is returned
```

**Test structure:**
```python
@pytest.mark.asyncio
async def test_alert_evaluator_returns_critical(session):
    # Arrange
    threshold = Threshold(patient_id="p1", hr_max=120)
    vital = Vital(patient_id="p1", heart_rate=150)  # Exceeds threshold
    
    # Act
    alert = await AlertEvaluator.evaluate(session, vital, threshold)
    
    # Assert
    assert alert is not None
    assert alert.severity == "critical"
```

**Key concepts:**
- Arrange-Act-Assert pattern
- Unit testing business logic
- Mocking database with SQLite
- Async test execution

---

##### 13. `tests/test_websocket_broadcast.py` 📡

**What to learn:**
- Testing WebSocket communication
- End-to-end integration testing
- Client/server interaction

**Test flow:**
```python
test_websocket_receives_alert()
  1. Connect WebSocket client
  2. POST vital that will trigger alert
  3. Listen for WebSocket message
  4. Verify alert was broadcast
  5. Verify message format
```

**Key concepts:**
- FastAPI test client WebSocket support
- Context managers for connections
- Message queue/reception
- Integration testing

---

### Person 2 Checkpoint Questions:

After completing all phases, you should be able to answer:

1. **Alert Logic**: When is an alert created vs suppressed?
2. **Severity**: How is alert severity determined?
3. **Deduplication**: How does the system prevent alert spam?
4. **WebSockets**: How do clients receive real-time updates?
5. **Broadcasting**: What happens when an alert is created?
6. **Security**: How is authentication handled?
7. **Testing**: How is the alert system tested?

---

## 🤝 Joint Session: Integration Understanding (30-45 mins)

**After both people complete their paths, meet to discuss:**

### 1. End-to-End Flow Trace

Walk through the complete flow step by step:

```
┌─────────────────────────────────────────────────────────────────┐
│                     COMPLETE DATA FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. IoT Sensor sends vital reading
   ↓
2. POST /api/v1/vitals (Person 1 territory)
   ↓
3. FastAPI validates with VitalCreate schema
   ↓
4. VitalService.ingest_batch() starts
   ├── Load patients from database
   ├── Load thresholds from database
   │   ↓
   ├── For each vital:
   │   ├── AlertEvaluator.evaluate() (Person 2 territory)
   │   │   ├── Check threshold breach
   │   │   ├── Calculate severity
   │   │   ├── Check deduplication
   │   │   └── Create alert if needed
   │   └── Collect vital + optional alert
   │   ↓
   ├── Save all vitals to database
   ├── Save all alerts to database
   ├── Commit transaction
   │   ↓
   └── Broadcast to WebSocket clients (Person 2 territory)
       ├── Broadcast vitals (type: VITAL_NEW)
       └── Broadcast alerts (type: ALERT_NEW)
           ↓
5. All connected WebSocket clients receive updates
   ↓
6. Frontend displays real-time data
```

### 2. Review `app/main.py` Together

Understand how all pieces are wired together:

```python
# Person 1's components
from app.api.routers import api_router  # Includes vitals, patients
from app.models import Patient, Vital   # Database models

# Person 2's components  
from app.services.alert_evaluator import AlertEvaluator
from app.websockets.manager import ConnectionManager

# How they connect
app.include_router(api_router)  # Registers all routes
@app.websocket("/ws")            # WebSocket endpoint
```

### 3. Database Schema Integration

Review `tests/conftest.py` to see how tables relate:

```python
# Patient (Person 1)
Patient
  ├── has many Vitals
  ├── has many Alerts
  └── has one Threshold

# Vital (Person 1)
Vital
  └── belongs to Patient

# Threshold (Person 2)
Threshold
  └── belongs to Patient

# Alert (Person 2)
Alert
  └── belongs to Patient
  └── created during Vital ingestion
```

### 4. Dependency Flow

Trace how dependencies flow through the system:

```python
# Database session (used by everyone)
get_db() 
  → Provides AsyncSession
  → Used in all routers
  → Auto-cleanup after request

# WebSocket manager (Person 2, used by Person 1)
get_connection_manager()
  → Singleton instance
  → Used by VitalService to broadcast
  → Manages all client connections

# Authentication (Person 2)
get_current_user()
  → Validates JWT token
  → Returns user info
  → Used to protect endpoints
```

### 5. Async/Await Pattern

Discuss why async is used throughout:

```python
# Database operations
async def get_patient(session: AsyncSession, patient_id: int):
    stmt = select(Patient).where(Patient.id == patient_id)
    result = await session.execute(stmt)  # Non-blocking
    return result.scalars().first()

# WebSocket broadcasting
async def broadcast(self, message: dict):
    for connection in self.active_connections:
        await connection.send_json(message)  # Non-blocking

# Route handlers
@router.post("/vitals")
async def ingest_vitals(payload: List[VitalCreate], ...):
    vitals = await VitalService.ingest_batch(...)  # Non-blocking
    return vitals
```

**Benefits:**
- Handles many concurrent connections
- Non-blocking I/O operations
- Better resource utilization
- Scalable for high traffic

### 6. Transaction Boundaries

Discuss where database transactions start and end:

```python
# VitalService.ingest_batch()
async with session.begin():  # Transaction starts
    # Save vitals
    session.add_all(vitals)
    
    # Save alerts
    session.add_all(alerts)
    
    # Commit happens here automatically
    # If exception occurs, rollback happens

# After transaction
await connection_manager.broadcast(...)  # Outside transaction
```

**Key insight:** WebSocket broadcast happens AFTER database commit to ensure data consistency.

### 7. Error Handling Strategy

Discuss error handling at each layer:

```python
# API Layer
try:
    result = await service.do_something()
    return result
except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))

# Service Layer
try:
    await session.commit()
except IntegrityError as e:
    await session.rollback()
    raise ValueError("Duplicate entry")

# Database Layer
# Handled by SQLAlchemy context managers
```

### 8. Testing Strategy

Discuss how tests cover the integration:

```python
# Unit tests
test_alert_evaluator.py  # Person 2's logic in isolation
test_vitals_ingest.py    # Person 1's logic

# Integration tests  
test_websocket_broadcast.py  # End-to-end flow

# Test fixtures
conftest.py  # Shared test infrastructure
  ├── prepare_database()  # Creates tables
  ├── session()           # Provides test DB session
  └── seeded_patient()    # Creates test data
```

---

## 📚 Complete File Reference

### Person 1's Core Files (Data Ingestion Path):
```
Priority 1 (Must understand deeply):
├── app/services/vital_service.py     ⭐⭐⭐ Main business logic
├── app/models/vital.py                ⭐⭐⭐ Data structure
├── app/api/routers/vitals.py          ⭐⭐⭐ API endpoint

Priority 2 (Important):
├── app/models/patient.py              ⭐⭐ Related model
├── app/schemas/vital.py               ⭐⭐ Validation
├── app/schemas/patient.py             ⭐⭐ Validation
├── app/api/routers/patients.py        ⭐⭐ Related API

Priority 3 (Foundation):
├── app/core/config.py                 ⭐ Configuration
├── app/db/session.py                  ⭐ Database setup
├── app/db/base.py                     ⭐ Base model
├── tests/test_vitals_ingest.py        ⭐ Testing
```

### Person 2's Core Files (Alert & Real-time Path):
```
Priority 1 (Must understand deeply):
├── app/services/alert_evaluator.py   ⭐⭐⭐ Alert logic
├── app/websockets/manager.py         ⭐⭐⭐ Broadcasting
├── app/models/alert.py               ⭐⭐⭐ Alert model

Priority 2 (Important):
├── app/models/threshold.py           ⭐⭐ Threshold model
├── app/api/routers/alerts.py         ⭐⭐ Alert API
├── app/schemas/alert.py              ⭐⭐ Validation
├── app/schemas/threshold.py          ⭐⭐ Validation

Priority 3 (Foundation):
├── app/core/security.py              ⭐ Authentication
├── app/api/dependencies.py           ⭐ Shared dependencies
├── tests/test_alert_evaluator.py     ⭐ Testing
├── tests/test_websocket_broadcast.py ⭐ Integration test
```

### Shared Files (Both Should Review):
```
├── app/main.py                       ⭐⭐⭐ App initialization
├── app/api/routers/__init__.py       ⭐⭐ Router wiring
├── tests/conftest.py                 ⭐⭐ Test fixtures
├── README.md                          ⭐ Overview
├── STRUCTURE.md                       ⭐ Architecture docs
```

---

## 🎓 Learning Tips

### General Tips:
1. **Start with models** - Data structure is foundation
2. **Then schemas** - Understand validation
3. **Then services** - Business logic
4. **Finally APIs** - How it's exposed
5. **Use tests as examples** - They show usage
6. **Draw diagrams** - Visual understanding helps
7. **Run the code** - See it in action
8. **Ask questions** - Compare notes frequently

### Reading Code:
- Start from the function signature
- Identify inputs and outputs
- Trace the data flow
- Note the error cases
- Check the tests for examples

### Debugging Mindset:
- Where does data come from?
- Where does data go?
- What transforms happen in between?
- What could go wrong?
- How is it handled?

### Taking Notes:
- Draw data flow diagrams
- Note key concepts
- Write questions as you go
- Document "aha!" moments
- Prepare to explain to others

---

## ✅ Success Criteria

### Person 1 (Data Ingestion) Success Checklist:

- [ ] Can explain the complete vitals ingestion flow
- [ ] Understands when `AlertEvaluator` is called
- [ ] Knows how database transactions work
- [ ] Can trace data from API to database
- [ ] Understands async/await usage
- [ ] Knows how Pydantic validation works
- [ ] Can explain the service layer pattern
- [ ] Understands SQLAlchemy relationships
- [ ] Can explain batch processing benefits
- [ ] Knows when WebSocket broadcast happens

**Challenge:** Explain to Person 2 how a vital reading gets from a sensor into the database, including all validation, transformation, and persistence steps.

---

### Person 2 (Alerts & Real-time) Success Checklist:

- [ ] Can explain threshold evaluation logic
- [ ] Understands alert deduplication mechanism
- [ ] Knows how severity is calculated
- [ ] Can explain WebSocket broadcasting
- [ ] Understands connection management
- [ ] Knows how authentication works
- [ ] Can trace an alert from creation to broadcast
- [ ] Understands the cooldown period logic
- [ ] Knows what messages are sent to clients
- [ ] Can explain the pub-sub pattern

**Challenge:** Explain to Person 1 how an alert is created, deduplicated, and broadcast to all connected clients in real-time.

---

### Joint Understanding Checklist:

- [ ] Can trace the complete end-to-end flow together
- [ ] Understand how Person 1's code calls Person 2's code
- [ ] Know where transaction boundaries are
- [ ] Understand the dependency injection pattern
- [ ] Can explain the async/await pattern
- [ ] Know how all database models relate
- [ ] Understand the testing strategy
- [ ] Can explain error handling at each layer
- [ ] Know why WebSocket broadcast happens after DB commit
- [ ] Can explain the system to someone else

**Challenge:** Together, whiteboard the complete system architecture and data flow without looking at code.

---

## 🚀 Next Steps After Learning

### 1. Run the Application
```bash
cd /home/khanhngoo/Desktop/MyMedQL/MyMedQL/backend
source ../venv/bin/activate
python -m uvicorn app.main:app --reload --port 3001
```

### 2. Test the API
```bash
# Health check
curl http://localhost:3001/health

# Create a patient
curl -X POST http://localhost:3001/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{"first_name": "John", "last_name": "Doe", "age": 45}'

# Ingest vitals
curl -X POST http://localhost:3001/api/v1/vitals \
  -H "Content-Type: application/json" \
  -d '[{
    "patient_id": 1,
    "heart_rate": 75,
    "spo2": 98,
    "respiratory_rate": 16,
    "systolic_bp": 120,
    "diastolic_bp": 80
  }]'
```

### 3. Connect WebSocket Client
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onmessage = (e) => console.log('Received:', JSON.parse(e.data));
```

### 4. Run Tests
```bash
python -m pytest -v
```

### 5. Explore API Documentation
Visit: http://localhost:3001/docs

---

## 📖 Additional Resources

### FastAPI Documentation:
- https://fastapi.tiangolo.com/
- Focus on: Async, Dependency Injection, WebSockets

### SQLAlchemy Documentation:
- https://docs.sqlalchemy.org/en/20/
- Focus on: Async ORM, Relationships, Sessions

### Python Async:
- https://docs.python.org/3/library/asyncio.html
- Understand: async/await, event loops, concurrency

### WebSocket Protocol:
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- Understand: Connection lifecycle, message formats

---

## 🎯 Final Challenge

**After both people complete the learning:**

Work together to add a new feature:

**Feature: Blood Pressure Alert**
- Add threshold for systolic and diastolic BP
- Create alert when BP is too high or too low
- Broadcast BP alert to WebSocket clients
- Add tests

**This will require:**
- Person 1: Modify vital ingestion to include BP check
- Person 2: Add BP evaluation to AlertEvaluator
- Both: Update schemas, tests, and integration

This exercise will cement your understanding of the entire system!

---

## 📝 Notes Section

Use this space to jot down questions, insights, or things to discuss:

### Person 1 Notes:
```
Questions:
-

Key Insights:
-

Things to discuss with Person 2:
-
```

### Person 2 Notes:
```
Questions:
-

Key Insights:
-

Things to discuss with Person 1:
-
```

### Joint Notes:
```
Integration questions:
-

Architecture insights:
-

Improvement ideas:
-
```

---

**Good luck with your learning journey! 🚀**

Remember: The goal is not just to read the code, but to **understand the system**. Take your time, draw diagrams, ask questions, and most importantly, discuss with each other. The best learning happens through collaboration!

