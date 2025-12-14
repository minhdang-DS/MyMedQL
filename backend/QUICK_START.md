# Quick Start Guide

This is a condensed version of the setup guide. For detailed instructions, see `SETUP.md`.

## Prerequisites Check

```bash
node --version    # >= 18.0.0
npm --version
docker --version
docker-compose --version
```

## 1. Install Dependencies

```bash
cd backend
npm install
```

## 2. Configure Environment

```bash
cp env.example .env
# Edit .env with your database password and generate security keys
```

**Required in .env:**
- `DB_PASSWORD` - Your MySQL password (check docker-compose.yml)
- `JWT_SECRET` - Generate: `openssl rand -base64 32`
- `ENCRYPTION_KEY` - Generate: `openssl rand -base64 32`
- `INGESTION_API_KEY` - Set a secure value

## 3. Start Database

```bash
cd ..  # Back to project root
docker-compose up -d db
```

**Note:** Service is named `db`, not `mysql`. Port is 3307 on host.

Verify it's running:
```bash
docker-compose ps
```

## 4. Configure .env for Database

Update `.env` with correct database settings:
```env
DB_HOST=localhost
DB_PORT=3307          # Port 3307 (not 3306!)
DB_USER=root
DB_PASSWORD=root
DB_NAME=mymedql       # lowercase
```

## 5. Run Migrations

**Note:** SQL files may auto-run on first container start. Check if tables exist:
```bash
docker-compose exec db mysql -u root -proot -e "USE mymedql; SHOW TABLES;"
```

If tables don't exist, run manually:

```bash
cd sql/ddl

# Create database first (if needed)
docker-compose exec db mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS mymedql;"

# Run all DDL files (using Docker)
docker-compose exec -T db mysql -u root -proot mymedql < schema.sql
docker-compose exec -T db mysql -u root -proot mymedql < partitioning.sql
docker-compose exec -T db mysql -u root -proot mymedql < views.sql
docker-compose exec -T db mysql -u root -proot mymedql < stored_procedures.sql
docker-compose exec -T db mysql -u root -proot mymedql < triggers.sql
docker-compose exec -T db mysql -u root -proot mymedql < indexes.sql
```

**Or using MySQL client (if installed):**
```bash
mysql -h localhost -P 3307 -u root -proot mymedql < schema.sql
# Repeat for other files
```

## 6. Start Server

```bash
cd ../../backend
npm run dev
```

You should see:
```
✅ Database connection established
🚀 MyMedQL Backend API running on port 3000
```

Test it:
```bash
curl http://localhost:3000/health
```

## 7. Run Tests

```bash
npm test
```

## Troubleshooting

- **Database connection failed?** 
  - Check MySQL is running: `docker-compose ps`
  - Verify `.env` has `DB_PORT=3307` (not 3306!)
  - Check password is `root` (as in docker-compose.yml)
- **Port in use?** Change `PORT` in `.env`
- **Module not found?** Run `npm install` again
- **SQL errors?** Check database name is `mymedql` (lowercase) in `.env`

For detailed help, see `SETUP.md`.

