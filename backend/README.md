# MyMedQL Backend - FastAPI

Python FastAPI backend for MyMedQL application.

## Technology Stack

- **Python 3.11**
- **FastAPI** - Modern, fast web framework
- **Uvicorn** - ASGI server
- **MySQL** - Database via mysql-connector-python

## Development

### Local Development (without Docker)

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=mymedql
export DB_USER=medql_user
export DB_PASSWORD=medql_pass

# Run the server
uvicorn src.main:app --reload --port 3001
```

### With Docker

```bash
# From project root
docker compose up --build backend
```

## API Endpoints

### Health & Info
- `GET /` - Root endpoint with API info
- `GET /health` - Health check (used by Docker)
- `GET /api` - API information

### Health Check Data
- `GET /api/health-check` - Get health check records
- `POST /api/health-check` - Create health check record

### Documentation
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation (ReDoc)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | localhost | MySQL host |
| DB_PORT | 3306 | MySQL port |
| DB_NAME | mymedql | Database name |
| DB_USER | root | Database user |
| DB_PASSWORD | root | Database password |
| PORT | 3001 | Server port |
| NODE_ENV | development | Environment |

## Project Structure

```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py           # Main FastAPI application
│   ├── api/              # API routes (to be added)
│   ├── db/               # Database models and queries
│   ├── services/         # Business logic
│   └── utils/            # Utilities
├── requirements.txt      # Python dependencies
├── Dockerfile           # Docker configuration
└── README.md
```

## Adding New Endpoints

```python
# In src/main.py or create new route files

@app.get("/api/users")
async def get_users():
    """Get all users"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return {"success": True, "data": users}
```

## Testing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test API info
curl http://localhost:3001/api

# Test database query
curl http://localhost:3001/api/health-check

# Create health check record
curl -X POST "http://localhost:3001/api/health-check?status=Test"
```

## FastAPI Features

- ✅ Automatic interactive API documentation
- ✅ Data validation with Pydantic
- ✅ Async support
- ✅ Type hints
- ✅ Dependency injection
- ✅ Built-in security utilities
