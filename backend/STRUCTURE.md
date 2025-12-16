# Backend Structure - FastAPI

This document explains the structure of the FastAPI backend.

## Directory Structure

```
backend/
├── src/                           # Source code
│   ├── __init__.py               # Package initializer
│   ├── main.py                   # Application entry point
│   ├── config.py                 # Configuration management
│   │
│   ├── api/                      # API layer
│   │   ├── __init__.py          # API router aggregation
│   │   ├── deps.py              # Reusable dependencies
│   │   └── routes/              # Route handlers
│   │       ├── __init__.py
│   │       ├── health.py        # Health check endpoints
│   │       └── api_info.py      # API info endpoints
│   │
│   ├── db/                       # Database layer
│   │   ├── __init__.py          # Database exports
│   │   ├── database.py          # Connection pool management
│   │   ├── queries/             # SQL queries (for future use)
│   │   └── rbac/                # Role-based access control
│   │
│   ├── schemas/                  # Pydantic models
│   │   ├── __init__.py
│   │   └── health.py            # Health check schemas
│   │
│   ├── services/                 # Business logic
│   │   ├── __init__.py
│   │   └── health_service.py    # Health check service
│   │
│   ├── utils/                    # Utilities
│   │   └── __init__.py
│   │
│   └── websocket/                # WebSocket handlers (future)
│       └── .gitkeep
│
├── tests/                        # Tests (future)
├── requirements.txt              # Python dependencies
├── .dockerignore                # Docker ignore rules
├── README.md                     # Backend documentation
└── STRUCTURE.md                  # This file

```

## Layer Responsibilities

### 1. **main.py** - Application Entry Point
- Creates FastAPI app instance
- Configures middleware (CORS, etc.)
- Registers routers
- Manages lifecycle (startup/shutdown)
- Serves as the ASGI entry point

### 2. **config.py** - Configuration
- Centralizes all configuration
- Uses Pydantic Settings for validation
- Loads from environment variables
- Provides settings singleton via `get_settings()`

### 3. **api/** - API Layer
- **`__init__.py`**: Aggregates all route routers
- **`routes/`**: Individual route modules by feature
- **`deps.py`**: Reusable dependencies (auth, db, etc.)

**Example Route:**
```python
from fastapi import APIRouter, Depends
from ..deps import get_database

router = APIRouter()

@router.get("/items")
async def get_items(db = Depends(get_database)):
    # Handle request
    pass
```

### 4. **db/** - Database Layer
- **`database.py`**: Connection pool management
- **`queries/`**: Complex SQL queries
- **`rbac/`**: Role-based access control

**Usage:**
```python
from ..db.database import get_db

conn = get_db()
cursor = conn.cursor()
# Execute query
```

### 5. **schemas/** - Data Models
- Pydantic models for request/response validation
- Type safety and automatic documentation
- Input validation

**Example:**
```python
from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
```

### 6. **services/** - Business Logic
- Separates business logic from route handlers
- Reusable across different endpoints
- Easier to test

**Example:**
```python
class UserService:
    @staticmethod
    def create_user(data):
        # Business logic here
        pass
```

### 7. **utils/** - Utilities
- Helper functions
- Common utilities used across the app

## Adding New Features

### Example: Adding User Management

1. **Create Schema** (`src/schemas/user.py`):
```python
from pydantic import BaseModel

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: str
```

2. **Create Service** (`src/services/user_service.py`):
```python
class UserService:
    @staticmethod
    def create_user(conn, user_data):
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, email) VALUES (%s, %s)",
            (user_data.username, user_data.email)
        )
        conn.commit()
        return cursor.lastrowid
```

3. **Create Routes** (`src/api/routes/users.py`):
```python
from fastapi import APIRouter, Depends
from ...schemas.user import UserCreate, UserResponse
from ...services.user_service import UserService
from ...db.database import get_db

router = APIRouter()

@router.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, db = Depends(get_db)):
    user_id = UserService.create_user(db, user)
    return {...}
```

4. **Register Router** (`src/api/__init__.py`):
```python
from .routes import users

api_router.include_router(users.router, prefix="/api", tags=["users"])
```

## Best Practices

1. **Separation of Concerns**
   - Routes: Handle HTTP requests/responses
   - Services: Business logic
   - DB: Data access
   - Schemas: Data validation

2. **Dependency Injection**
   - Use `Depends()` for reusable logic
   - Database connections
   - Authentication
   - Common validations

3. **Type Hints**
   - Use type hints everywhere
   - Enables IDE autocomplete
   - Automatic API documentation

4. **Error Handling**
   - Use `HTTPException` for API errors
   - Centralize error handling
   - Return meaningful error messages

5. **Configuration**
   - Never hardcode values
   - Use environment variables
   - Validate configuration on startup

## Running the Application

### Development
```bash
uvicorn src.main:app --reload --port 3001
```

### Production (Docker)
```bash
docker compose up --build backend
```

### Testing
```bash
pytest
```

## Environment Variables

See `config.py` for all available settings:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `PORT`, `NODE_ENV`
- See `.env.example` for complete list

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:3001/docs
- **ReDoc**: http://localhost:3001/redoc

