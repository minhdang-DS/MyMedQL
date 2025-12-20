# 🚀 MyMedQL Quick Start Guide

This guide will help you get MyMedQL up and running quickly.

## Prerequisites

- **Docker** and **Docker Compose** installed
  - Check: `docker --version` and `docker-compose --version`
  - [Install Docker](https://docs.docker.com/get-docker/)

## Option 1: Run with Docker (Recommended) 🐳

This is the easiest way to run the entire application.

### Step 1: Navigate to Project Directory

```bash
cd "/Users/dinhieufam/DINHHIEU/VINUNI/Fall 25/COMP3030 - Databases and Database Systems/Project/MyMedQL"
```

### Step 2: Set Environment Variables (Optional)

Create a `.env` file in the project root for custom configuration:

```bash
# Generate encryption key (run this command)
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Create `.env` file:
```env
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENCRYPTION_KEY=your-encryption-key-from-above-command
```

**Note:** If you don't create a `.env` file, Docker Compose will use default values (not recommended for production).

### Step 3: Build and Start All Services

```bash
docker-compose up --build
```

This will:
- Build MySQL database container
- Build backend API container (FastAPI)
- Build frontend container (Next.js)
- Start all services automatically
- Initialize database with schema and sample data

### Step 4: Access the Application

Once all containers are running (wait for "healthy" status):

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/docs
- **Health Check**: http://localhost:3001/health
- **MySQL Database**: localhost:3307 (user: `root`, password: `root`)

### Step 5: Verify Everything is Running

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Common Docker Commands

```bash
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

---

## Option 2: Local Development Setup 💻

If you prefer to run services locally without Docker.

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- MySQL 8.0+ (or use Docker just for MySQL)

### Step 1: Start MySQL Database

**Option A: Use Docker for MySQL only**

```bash
docker-compose up db -d
```

**Option B: Use Local MySQL**

Ensure MySQL is running on port 3307 (or update configuration).

### Step 2: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=3307
DB_NAME=mymedql
DB_USER=root
DB_PASSWORD=root
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
EOF

# Initialize database (if not using Docker)
# The database should be initialized automatically if using Docker
# Otherwise, run SQL files from backend/sql/ddl/ manually

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload
```

Backend will be available at: http://localhost:3001

### Step 3: Setup Frontend

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Create .env.local file (optional, for local backend URL)
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

---

## Running the Simulator 📊

The simulator generates and inserts patient vital signs data into the database.

### With Docker

```bash
# Access backend container
docker-compose exec backend bash

# Run simulator
python simulator/main.py

# Or with custom options
python simulator/main.py --rate 50 --patients 10 --duration 600
```

### Local Development

```bash
# Activate virtual environment
cd backend
source venv/bin/activate

# Run simulator
python simulator/main.py

# Custom options
python simulator/main.py --rate 50 --patients 10
```

### Simulator Options

- `--rate`: Target insert rate (inserts per second). Default: 5.0
- `--patients`: Number of patients to simulate. Default: 5
- `--start-id`: Starting patient ID. Default: 1
- `--duration`: Duration in seconds (0 = run indefinitely). Default: 0

---

## Troubleshooting 🔧

### Port Already in Use

If you get "port is already allocated":

```bash
# Check what's using the port
lsof -i :3000  # or :3001, :3307

# Stop conflicting process or change port in docker-compose.yml
```

### Database Connection Failed

**Docker:**
- Ensure backend uses `DB_HOST=db` (service name, not `localhost`)
- Check database is healthy: `docker-compose ps`
- View database logs: `docker-compose logs db`

**Local:**
- Verify MySQL is running: `mysql -h localhost -P 3307 -u root -proot`
- Check `.env` file has correct credentials
- For Docker MySQL: use `127.0.0.1` instead of `localhost` on some systems

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

**Docker:**
- Backend URL should be: `http://backend:3001` (internal network)
- Frontend is configured automatically

**Local:**
- Create `frontend/.env.local` with: `NEXT_PUBLIC_API_URL=http://localhost:3001`
- Ensure backend is running on port 3001

### Reset Everything

```bash
# Stop all containers and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Clean Docker system
docker system prune -a

# Rebuild from scratch
docker-compose up --build
```

---

## Next Steps 📚

1. **Explore the API**: Visit http://localhost:3001/docs for interactive API documentation
2. **Run Simulator**: Generate patient vital signs data
3. **View Dashboard**: Check the frontend at http://localhost:3000
4. **Read Documentation**: 
   - `README.md` - Project overview
   - `DOCKER.md` - Detailed Docker guide
   - `backend/README.md` - Backend API documentation
   - `docs/` - Additional documentation

---

## Quick Reference

```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Access MySQL
docker-compose exec db mysql -uroot -proot mymedql

# Access backend container
docker-compose exec backend bash
```

---

**Need Help?** Check the logs: `docker-compose logs -f`

