# 🐳 MyMedQL Docker Setup Guide

This guide will help you run MyMedQL using Docker containers.

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

Check your installation:
```bash
docker --version
docker-compose --version
```

## Architecture

MyMedQL consists of 3 services:

1. **MySQL Database** (`db`) - Port 3306
   - Stores all application data
   - Automatically initializes with schema
   - Data persists in Docker volume

2. **Backend API** (`backend`) - Port 3001
   - Node.js API server
   - Connects to MySQL database
   - Waits for database to be healthy before starting

3. **Frontend** (`frontend`) - Port 3000
   - Next.js web application
   - Communicates with backend API
   - Production-optimized build

## Quick Start

### 1. Build and Start All Services

```bash
# Navigate to project directory
cd /home/khanhngoo/Desktop/MyMedQL/MyMedQL

# Build and start all containers
docker-compose up --build
```

That's it! All services will start automatically.

### 2. Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MySQL Database**: localhost:3306

## Common Commands

### Starting & Stopping

```bash
# Start all services (foreground - shows logs)
docker-compose up

# Start all services (background - detached)
docker-compose up -d

# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ deletes database data)
docker-compose down -v
```

### Viewing Logs

```bash
# View logs from all services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Follow logs for specific service
docker-compose logs -f backend
```

### Managing Services

```bash
# Check status of all services
docker-compose ps

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend

# Rebuild and restart after code changes
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

### Database Access

```bash
# Access MySQL shell
docker-compose exec db mysql -uroot -proot mymedql

# Run SQL file
docker-compose exec -T db mysql -uroot -proot mymedql < your_script.sql

# Backup database
docker-compose exec db mysqldump -uroot -proot mymedql > backup.sql

# Restore database
docker-compose exec -T db mysql -uroot -proot mymedql < backup.sql
```

### Container Shell Access

```bash
# Access backend container shell
docker-compose exec backend sh

# Access frontend container shell
docker-compose exec frontend sh

# Access database container shell
docker-compose exec db bash
```

## Development Workflow

### Making Code Changes

1. **Edit your code** in your IDE
2. **Rebuild the service**:
   ```bash
   docker-compose up -d --build backend
   ```
3. **Check logs**:
   ```bash
   docker-compose logs -f backend
   ```

### Adding Dependencies

#### Backend:
```bash
# Add new npm package
docker-compose exec backend npm install package-name

# Or rebuild after updating package.json
docker-compose up -d --build backend
```

#### Frontend:
```bash
# Add new npm package
docker-compose exec frontend npm install package-name

# Or rebuild after updating package.json
docker-compose up -d --build frontend
```

## Troubleshooting

### Port Already in Use

If you get "port is already allocated":

```bash
# Check what's using the port
sudo lsof -i :3000  # or :3001, :3306

# Option 1: Stop the conflicting process
# Option 2: Change port in docker-compose.yml
# "3002:3000" instead of "3000:3000"
```

### Container Keeps Restarting

```bash
# Check logs for errors
docker-compose logs [service-name]

# Common issues:
# - Database not ready (wait for health check)
# - Missing dependencies (rebuild with --build)
# - Configuration errors (check environment variables)
```

### Database Connection Failed

Make sure backend uses `DB_HOST=db` (not `localhost`).
The service name `db` is the hostname inside Docker network.

### Clean Slate / Reset Everything

```bash
# Stop all containers and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Clean Docker system
docker system prune -a

# Rebuild from scratch
docker-compose up --build
```

### Frontend Build Errors

```bash
# Check Node.js version compatibility
# Build locally first to see detailed errors:
cd frontend
npm install
npm run build

# Then rebuild Docker image
docker-compose up -d --build frontend
```

## Production Deployment

### Environment Variables

1. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

2. Update with production values:
   - Change passwords
   - Update API URLs
   - Set NODE_ENV=production

### Security Considerations

- ⚠️ Change default passwords in production
- 🔒 Use Docker secrets for sensitive data
- 🛡️ Don't expose database port (3306) publicly
- 🔐 Use HTTPS/SSL certificates
- 📝 Enable Docker logging and monitoring

### Scaling Services

```bash
# Run multiple backend instances
docker-compose up -d --scale backend=3

# Add load balancer (nginx) in docker-compose.yml
```

## File Structure

```
MyMedQL/
├── docker-compose.yml          # Orchestrates all services
├── .env.example                # Environment variables template
├── docker/
│   ├── backend.Dockerfile      # Backend image definition
│   ├── frontend.Dockerfile     # Frontend image definition
│   ├── mysql.Dockerfile        # Database image definition
│   └── init/
│       └── init.sql            # Database initialization
├── backend/
│   └── .dockerignore           # Files to exclude from build
├── frontend/
│   └── .dockerignore           # Files to exclude from build
└── sql/
    ├── ddl/                    # Database schema
    └── seed/                   # Sample data
```

## Health Checks

All services have health checks:

- **Database**: Checks MySQL is responding
- **Backend**: Checks HTTP endpoint `/health`
- **Frontend**: Next.js handles its own health

Check health status:
```bash
docker-compose ps
# Look for "healthy" status
```

## Volumes and Data Persistence

Database data persists in Docker volume `mysql_data`:

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect mymedql_mysql_data

# Remove volume (⚠️ deletes all data)
docker volume rm mymedql_mysql_data
```

## Next Steps

- Add your application schema to `sql/ddl/`
- Add sample data to `sql/seed/`
- Configure backend database connection
- Implement API endpoints
- Build frontend components

## Need Help?

- Check logs: `docker-compose logs -f`
- Check service status: `docker-compose ps`
- Access container: `docker-compose exec [service] sh`
- Read Docker docs: https://docs.docker.com/

---

**Quick Reference:**
```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

