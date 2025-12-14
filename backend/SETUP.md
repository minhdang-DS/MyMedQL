# Backend Setup Guide

This guide provides detailed step-by-step instructions for setting up and running the MyMedQL backend.

## Prerequisites

- **Node.js** (version 18.0.0 or higher)
- **npm** (comes with Node.js)
- **Docker** and **Docker Compose** (for MySQL database)
- **MySQL Client** (optional, for manual database access)

Verify installations:
```bash
node --version    # Should be >= 18.0.0
npm --version
docker --version
docker-compose --version
```

---

## Step 1: Install Dependencies

### 1.1 Navigate to Backend Directory

Open your terminal and navigate to the backend directory:

```bash
# From the project root (MyMedQL/)
cd backend
```

### 1.2 Install npm Packages

Install all required dependencies listed in `package.json`:

```bash
npm install
```

**Expected Output:**
```
added 150 packages, and audited 151 packages in 10s
```

**Troubleshooting:**
- If you get permission errors, try: `sudo npm install` (Linux/Mac) or run terminal as administrator (Windows)
- If installation is slow, you can use: `npm install --verbose` to see progress
- If you encounter network issues, try: `npm install --registry https://registry.npmjs.org/`

### 1.3 Verify Installation

Check that key packages are installed:

```bash
npm list express mysql2 bcrypt jsonwebtoken ws
```

You should see version numbers for each package.

---

## Step 2: Configure Environment Variables

### 2.1 Copy Environment Template

Copy the example environment file to create your `.env` file:

```bash
# From the backend directory
cp env.example .env
```

**Note:** On Windows (Command Prompt), use:
```cmd
copy env.example .env
```

On Windows (PowerShell), use:
```powershell
Copy-Item env.example .env
```

### 2.2 Edit .env File

Open the `.env` file in your text editor:

```bash
# On Mac/Linux
nano .env
# or
code .env  # If you have VS Code

# On Windows
notepad .env
```

### 2.3 Configure Database Settings

Update the database configuration to match your Docker Compose setup:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=MyMedQL
```

**Important:** 
- Check `docker-compose.yml` in the project root for the actual MySQL password
- The default might be empty (`DB_PASSWORD=`) or a specific value

### 2.4 Generate Security Keys

#### JWT Secret
Generate a secure random string for JWT tokens:

```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Or use an online generator: https://randomkeygen.com/

Update in `.env`:
```env
JWT_SECRET=your-generated-secret-here
```

#### Encryption Key
Generate a 32-byte key for AES-256 encryption:

```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Update in `.env`:
```env
ENCRYPTION_KEY=your-32-byte-encryption-key-here
```

**Note:** The encryption key must be exactly 32 bytes. The base64 string will be longer (44 characters), which is fine.

#### Ingestion API Key
Set a secure API key for the device ingestion endpoint:

```env
INGESTION_API_KEY=your-secure-api-key-here
```

### 2.5 Final .env File Example

Your `.env` file should look something like this:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mypassword123
DB_NAME=MyMedQL

# JWT Configuration
JWT_SECRET=K8j2L9mN4pQ7rS5tU3vW6xY1zA2bC4dE8fG0hI
JWT_EXPIRES_IN=24h

# Encryption Key (must be 32 bytes for AES-256)
ENCRYPTION_KEY=aB3cD5eF7gH9iJ1kL2mN4oP6qR8sT0uV2wX4yZ6

# Ingestion API Key (for device vitals endpoint)
INGESTION_API_KEY=dev-ingestion-key-2024

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Security Note:** Never commit the `.env` file to version control. It should be in `.gitignore`.

---

## Step 3: Start Database with Docker Compose

### 3.1 Navigate to Project Root

From the backend directory, go to the project root:

```bash
cd ..
# You should now be in MyMedQL/
```

### 3.2 Check Docker Compose File

Verify that `docker-compose.yml` exists and is configured correctly:

```bash
ls docker-compose.yml
cat docker-compose.yml  # View the file
```

### 3.3 Start MySQL Container

Start the MySQL database container:

```bash
docker-compose up -d db
```

**Note:** The service is named `db` in docker-compose.yml, not `mysql`.

**Expected Output:**
```
Creating network "mymedql_mymedql-network" if not exists
Creating mymedql-db ... done
```

### 3.4 Verify Database is Running

Check that the container is running:

```bash
docker-compose ps
```

You should see the `mymedql-db` container with status "Up".

**Alternative check:**
```bash
docker ps | grep mymedql-db
```

### 3.5 Important: Database Configuration

Based on your `docker-compose.yml`:
- **Host Port:** 3307 (mapped from container port 3306)
- **Root Password:** `root`
- **Database Name:** `mymedql` (lowercase)
- **Database User:** `medql_user` (password: `medql_pass`)

**Update your `.env` file accordingly:**
```env
DB_HOST=localhost
DB_PORT=3307          # Note: 3307, not 3306!
DB_USER=root          # or medql_user
DB_PASSWORD=root       # or medql_pass
DB_NAME=mymedql        # lowercase
```

### 3.6 Test Database Connection (Optional)

You can test the connection using MySQL client:

```bash
# If you have mysql client installed
mysql -h localhost -P 3307 -u root -proot

# Or using Docker
docker-compose exec db mysql -u root -proot
```

**Note:** The SQL files in `sql/ddl/` and `sql/seed/` are automatically mounted and may run on first container start. However, you can still run them manually if needed.

**Troubleshooting:**
- If container fails to start: `docker-compose logs db`
- If port 3307 is already in use, check: `lsof -i :3307` (Mac/Linux) or `netstat -ano | findstr :3307` (Windows)
- To stop the database: `docker-compose stop db`
- To remove and recreate: `docker-compose down -v` then `docker-compose up -d db`
- Note: The container uses port 3307 on the host (not 3306) to avoid conflicts

---

## Step 4: Run Database Migrations

### 4.1 Navigate to SQL Directory

```bash
# From project root (MyMedQL/)
cd sql/ddl
```

### 4.2 Important: Check if Migrations Already Ran

The SQL files are automatically mounted to the Docker container's initialization directory. If you started the container for the first time, they may have already run automatically.

Check if tables exist:
```bash
docker-compose exec db mysql -u root -proot -e "USE mymedql; SHOW TABLES;"
```

If tables already exist, you can skip to Step 5. Otherwise, continue with manual execution.

### 4.3 Execute SQL Files in Order (Manual)

If you need to run migrations manually:

#### 4.3.1 Create Database (if needed)

```bash
docker-compose exec db mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS mymedql;"
```

#### 4.3.2 Create Schema

```bash
# Using MySQL client (note: port 3307, database name mymedql)
mysql -h localhost -P 3307 -u root -proot mymedql < schema.sql

# Or using Docker
docker-compose exec -T db mysql -u root -proot mymedql < schema.sql
```

**Alternative: Using Docker exec interactively:**
```bash
docker-compose exec mysql mysql -u root -p
# Then in MySQL prompt:
# USE MyMedQL;
# SOURCE /path/to/schema.sql;
```

#### 4.3.3 Apply Partitioning

```bash
mysql -h localhost -P 3307 -u root -proot mymedql < partitioning.sql
# Or using Docker
docker-compose exec -T db mysql -u root -proot mymedql < partitioning.sql
```

#### 4.3.4 Create Views

```bash
mysql -h localhost -P 3307 -u root -proot mymedql < views.sql
# Or using Docker
docker-compose exec -T db mysql -u root -proot mymedql < views.sql
```

#### 4.3.5 Create Stored Procedures

```bash
mysql -h localhost -P 3307 -u root -proot mymedql < stored_procedures.sql
# Or using Docker
docker-compose exec -T db mysql -u root -proot mymedql < stored_procedures.sql
```

#### 4.3.6 Create Triggers

```bash
mysql -h localhost -P 3307 -u root -proot mymedql < triggers.sql
# Or using Docker
docker-compose exec -T db mysql -u root -proot mymedql < triggers.sql
```

#### 4.3.7 Create Indexes (if any)

```bash
mysql -h localhost -P 3307 -u root -proot mymedql < indexes.sql
# Or using Docker
docker-compose exec -T db mysql -u root -proot mymedql < indexes.sql
```

### 4.4 Alternative: Execute All DDL Files at Once

If you prefer to run all files in one command:

```bash
# From sql/ddl directory
cat schema.sql partitioning.sql views.sql stored_procedures.sql triggers.sql indexes.sql | \
  mysql -h localhost -P 3307 -u root -proot mymedql

# Or using Docker
cat schema.sql partitioning.sql views.sql stored_procedures.sql triggers.sql indexes.sql | \
  docker-compose exec -T db mysql -u root -proot mymedql
```

### 4.5 Verify Database Structure

Check that tables were created:

```bash
# Using MySQL client
mysql -h localhost -P 3307 -u root -proot -e "USE mymedql; SHOW TABLES;"

# Or using Docker
docker-compose exec db mysql -u root -proot -e "USE mymedql; SHOW TABLES;"
```

You should see tables like: `patients`, `staff`, `devices`, `vitals`, `alerts`, etc.

### 4.6 (Optional) Load Seed Data

If you want sample data for testing:

```bash
# From project root
cd sql/seed

# Load thresholds
mysql -h localhost -P 3307 -u root -proot mymedql < sample_thresholds.sql
# Or using Docker
docker-compose exec -T db mysql -u root -proot mymedql < sample_thresholds.sql

# Load sample data
mysql -h localhost -P 3307 -u root -proot mymedql < sample_data.sql
# Or using Docker
docker-compose exec -T db mysql -u root -proot mymedql < sample_data.sql

# Load demo scenarios
mysql -h localhost -P 3307 -u root -proot mymedql < demo_scenarios.sql
# Or using Docker
docker-compose exec -T db mysql -u root -proot mymedql < demo_scenarios.sql
```

**Note:** Remember to replace `<bcrypt-hash>` in `sample_data.sql` with actual bcrypt hashes before running.

**Troubleshooting:**
- If you get "Unknown database" error, create it first: 
  ```bash
  docker-compose exec db mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS mymedql;"
  ```
- If you get permission errors, ensure you're using the correct password (`root` for root user)
- Check for SQL syntax errors in the output
- Remember: database name is `mymedql` (lowercase), not `MyMedQL`

---

## Step 5: Start the Server

### 5.1 Navigate to Backend Directory

```bash
# From project root
cd backend
```

### 5.2 Start in Development Mode (Recommended)

Start the server with auto-reload on file changes:

```bash
npm run dev
```

**Expected Output:**
```
✅ Database connection established
✅ WebSocket server initialized
✅ Alert polling started
🚀 MyMedQL Backend API running on port 3000
📡 WebSocket server available at ws://localhost:3000/ws
📚 API documentation: http://localhost:3000/health
```

### 5.3 Start in Production Mode

For production or without auto-reload:

```bash
npm start
```

### 5.4 Verify Server is Running

Test the health endpoint:

```bash
# In another terminal
curl http://localhost:3000/health
```

Or open in browser: http://localhost:3000/health

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "MyMedQL Backend API"
}
```

**Troubleshooting:**
- If port 3000 is in use, change `PORT` in `.env` file
- Check database connection errors in the console
- Verify `.env` file exists and has correct values
- Check logs for specific error messages

---

## Step 6: Run Tests

### 6.1 Run All Tests

Execute all unit and integration tests:

```bash
npm test
```

**Expected Output:**
```
PASS  tests/unit/authService.test.js
PASS  tests/unit/patientService.test.js
PASS  tests/unit/rbacMiddleware.test.js
PASS  tests/integration/api.test.js

Test Suites: 4 passed, 4 total
Tests:       15 passed, 15 total
```

### 6.2 Run Only Unit Tests

```bash
npm run test:unit
```

### 6.3 Run Only Integration Tests

```bash
npm run test:integration
```

**Note:** Integration tests require a running MySQL database with test data.

### 6.4 Run Tests in Watch Mode

For development, watch for file changes and re-run tests:

```bash
npm run test:watch
```

### 6.5 Generate Coverage Report

Get detailed test coverage information:

```bash
npm test -- --coverage
```

**Troubleshooting:**
- If tests fail with database connection errors, ensure MySQL is running
- Integration tests may fail if database schema is not set up
- Some tests may require seed data to be loaded
- Check test output for specific error messages

---

## Quick Start Script

For convenience, you can create a script to automate the setup:

### setup.sh (Mac/Linux)

```bash
#!/bin/bash
echo "🚀 Setting up MyMedQL Backend..."

# Install dependencies
echo "📦 Installing dependencies..."
cd backend && npm install

# Copy env file
echo "⚙️  Setting up environment..."
cp env.example .env
echo "⚠️  Please edit .env file with your configuration!"

# Start database
echo "🗄️  Starting database..."
cd .. && docker-compose up -d mysql

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 5

# Run migrations
echo "📊 Running migrations..."
cd sql/ddl
mysql -h localhost -P 3306 -u root -p MyMedQL < schema.sql
mysql -h localhost -P 3306 -u root -p MyMedQL < partitioning.sql
mysql -h localhost -P 3306 -u root -p MyMedQL < views.sql
mysql -h localhost -P 3306 -u root -p MyMedQL < stored_procedures.sql
mysql -h localhost -P 3306 -u root -p MyMedQL < triggers.sql

echo "✅ Setup complete! Navigate to backend/ and run 'npm run dev'"
```

Make it executable:
```bash
chmod +x setup.sh
./setup.sh
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] Dependencies installed (`node_modules/` exists)
- [ ] `.env` file created and configured
- [ ] MySQL container running (`docker-compose ps`)
- [ ] Database tables created (check with `SHOW TABLES`)
- [ ] Server starts without errors
- [ ] Health endpoint responds (`curl http://localhost:3000/health`)
- [ ] Tests pass (`npm test`)

---

## Common Issues and Solutions

### Issue: "Cannot find module"
**Solution:** Run `npm install` again

### Issue: "Database connection failed"
**Solution:** 
- Check MySQL is running: `docker-compose ps`
- Verify `.env` database credentials
- Check MySQL logs: `docker-compose logs mysql`

### Issue: "Port 3000 already in use"
**Solution:** Change `PORT` in `.env` or stop the process using port 3000

### Issue: "JWT_SECRET is not set"
**Solution:** Ensure `.env` file exists and has `JWT_SECRET` defined

### Issue: "ENCRYPTION_KEY is not set"
**Solution:** Generate and set `ENCRYPTION_KEY` in `.env`

### Issue: Tests fail with "Unknown database"
**Solution:** Run SQL migrations first (Step 4)

---

## Next Steps

Once the backend is running:

1. **Test the API** using tools like Postman or curl
2. **Connect the frontend** to the backend API
3. **Set up the simulator** to send test data
4. **Monitor WebSocket connections** for real-time updates

For API documentation, see `backend/README.md`.

