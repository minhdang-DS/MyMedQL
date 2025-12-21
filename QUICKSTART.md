# 🚀 MyMedQL Quick Start Guide

This guide will help you get MyMedQL up and running quickly.

## Prerequisites

- **Docker** and **Docker Compose** installed
  - Check: `docker --version` and `docker-compose --version`
  - [Install Docker](https://docs.docker.com/get-docker/)
- **Python 3.10+** (for running the demo vitals script)

## Quick Start (3 Steps)

### Step 1: Create `.env` File

Navigate to the project root and create a `.env` file:

```bash
cd "MyMedQL"
```

Generate encryption key:

```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Create `.env` file in the project root:

```env
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENCRYPTION_KEY=your-encryption-key-from-above-command
```

**Note:** Replace `your-secret-key-here-change-in-production` and `your-encryption-key-from-above-command` with actual values.

### Step 2: Run Docker

Build and start all services:

```bash
docker-compose up --build
```

This will:
- Build MySQL database container
- Build backend API container (FastAPI)
- Build frontend container (Next.js)
- Start all services automatically
- Initialize database with schema and sample data

Wait for all containers to be healthy (check with `docker-compose ps`).

### Step 3: Run Demo Vitals Generator

In a new terminal, run the demo vitals script:

```bash
# Access backend container
docker-compose exec backend python backend/scripts/generate_demo_vitals.py
```

Or if running locally (with Python environment set up):

```bash
cd backend
python scripts/generate_demo_vitals.py
```

This script will:
- Acknowledge all existing alerts
- Record simulation start time
- Generate phased demo vital signs:
  - **Phase 1 (0-5s)**: All patients stable
  - **Phase 2 (5-10s)**: Some patients transition to warning
  - **Phase 3 (10s-10min)**: Some patients critical, some warning, rest stable
- Run for 10 minutes (600 seconds), generating data every second

## Access the Application

Once everything is running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/docs
- **Health Check**: http://localhost:3001/health
- **MySQL Database**: localhost:3307 (user: `root`, password: `root`)

## Default Login Credentials

### Staff Login
- **Admin**: 
  - Email: `admin@example.com`
  - Password: `password123`
- **Doctor**: 
  - Email: `doctor@example.com`
  - Password: `password123`
- **Nurse**: 
  - Email: `nurse@example.com`
  - Password: `password123`

### Patient Login
- Check the database `patients` table for patient email addresses
- Default password: `password123`

## Common Commands

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ deletes database data)
docker-compose down -v

# Restart a specific service
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build backend
```

## Troubleshooting 🔧

### Port Already in Use

If you get "port is already allocated":

```bash
# Check what's using the port
lsof -i :3000  # or :3001, :3307

# Stop conflicting process or change port in docker-compose.yml
```

### Database Connection Failed

- Ensure database is healthy: `docker-compose ps`
- View database logs: `docker-compose logs db`
- Wait for health check to pass before running the demo script

### Container Keeps Restarting

```bash
# Check logs for errors
docker-compose logs [service-name]

# Common issues:
# - Missing environment variables (ENCRYPTION_KEY, SECRET_KEY)
# - Database not ready (wait for health check)
# - Missing dependencies (rebuild with --build)
```

### Frontend Can't Connect to Backend

- Ensure backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Verify API is accessible: `curl http://localhost:3001/health`

### Demo Script Not Running

- Ensure Docker containers are running: `docker-compose ps`
- Check backend container is healthy
- Verify database connection: `docker-compose exec db mysql -uroot -proot mymedql -e "SELECT COUNT(*) FROM patients;"`

### Reset Everything

```bash
# Stop all containers and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Rebuild from scratch
docker-compose up --build
```

## Next Steps 📚

1. **Login**: Use the default credentials above to login as staff or patient
2. **View Dashboard**: Check the frontend at http://localhost:3000
3. **Explore the API**: Visit http://localhost:3001/docs for interactive API documentation
4. **Monitor Patients**: Watch the real-time vital signs and alerts on the staff dashboard

---

**Need Help?** Check the logs: `docker-compose logs -f`
