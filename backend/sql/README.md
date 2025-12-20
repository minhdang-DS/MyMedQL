# SQL Scripts Documentation

This directory contains SQL scripts that automatically run during database initialization when you run `docker-compose up`.

## Directory Structure

```
sql/
├── ddl/          # Data Definition Language (schema, tables, etc.)
│   ├── schema.sql
│   ├── indexes.sql
│   ├── partitioning.sql
│   ├── stored_procedures.sql
│   ├── triggers.sql
│   ├── views.sql
│   └── migrate_patient_password.sql  # Migration for password_hash column
│
└── seed/         # Seed data (sample data, authentication, etc.)
    ├── sample_data.sql           # Base sample data (patients, staff, devices)
    ├── sample_thresholds.sql     # Alert thresholds
    ├── demo_scenarios.sql         # Demo scenarios with vitals
    ├── seed_staff_auth.sql        # Staff passwords (replaces seed_staff_auth.py)
    ├── seed_patient_auth.sql      # Patient passwords (replaces seed_patient_auth.py)
    └── seed_demo_vitals.sql       # Demo vitals data (replaces generate_demo_vitals.py)
```

## Execution Order

Files are executed in alphabetical order within each directory:

1. **DDL Files** (`01_ddl/`):
   - `indexes.sql`
   - `migrate_patient_password.sql`
   - `partitioning.sql`
   - `schema.sql` ⭐ (creates tables)
   - `stored_procedures.sql`
   - `triggers.sql`
   - `views.sql`

2. **Seed Files** (`02_seed/`):
   - `demo_scenarios.sql`
   - `sample_data.sql` ⭐ (creates base data)
   - `sample_thresholds.sql`
   - `seed_demo_vitals.sql`
   - `seed_patient_auth.sql` ⭐ (sets patient passwords)
   - `seed_staff_auth.sql` ⭐ (sets staff passwords)

## Python Scripts → SQL Conversion

The following Python scripts have been converted to SQL and run automatically:

| Python Script | SQL Equivalent | Purpose |
|--------------|----------------|---------|
| `scripts/update_schema_patient_auth.py` | `ddl/migrate_patient_password.sql` | Adds `password_hash` column to patients table |
| `scripts/seed_staff_auth.py` | `seed/seed_staff_auth.sql` | Creates/updates staff users with bcrypt passwords |
| `scripts/seed_patient_auth.py` | `seed/seed_patient_auth.sql` | Sets bcrypt passwords for patients 1-5 |
| `scripts/generate_demo_vitals.py` | `seed/seed_demo_vitals.sql` | Generates 10 minutes of demo vitals data (600 records) |

## Default Credentials

All authentication scripts use the same password for demo purposes:

- **Password**: `password123`
- **Bcrypt Hash**: `$2b$12$S2prsHz08j7VxIVvtdm78ubBYjL5rxb6VY0fviCoH1rodB3XJtkG.`

### Staff Users

- **Admin**: `admin@example.com` / `password123`
- **Doctor**: `doctor@example.com` / `password123`
- **Nurse**: `nurse@example.com` / `password123`

### Patient Users

- **Patient 1-5**: Patient ID `1-5` / `password123`

## Usage

### Automatic Execution

When you run `docker-compose up`, all SQL scripts are automatically executed in order during database initialization.

### Manual Execution (if needed)

If you need to run scripts manually:

```bash
# Run a specific SQL file
docker-compose exec db mysql -uroot -proot mymedql < backend/sql/seed/seed_staff_auth.sql

# Or execute directly
docker-compose exec db mysql -uroot -proot mymedql -e "source /docker-entrypoint-initdb.d/02_seed/seed_staff_auth.sql"
```

### Re-initializing Database

To re-run all initialization scripts:

```bash
# Stop and remove database volume
docker-compose down -v

# Start database (will re-run all scripts)
docker-compose up -d db
```

## Notes

1. **Password Hashes**: All password hashes are pre-generated bcrypt hashes. The same hash is used for all users (password: `password123`). In production, each user should have a unique hash.

2. **Idempotency**: Most scripts are idempotent (safe to run multiple times):
   - `migrate_patient_password.sql` - Checks if column exists before adding
   - `seed_staff_auth.sql` - Uses `ON DUPLICATE KEY UPDATE`
   - `seed_patient_auth.sql` - Uses `UPDATE` (safe to re-run)

3. **Demo Vitals**: `seed_demo_vitals.sql` generates 600 records (10 minutes of data). For continuous real-time updates during demo, still use:
   ```bash
   docker-compose exec -d backend python /app/scripts/generate_demo_vitals.py
   ```

4. **File Naming**: Files are named with prefixes to ensure correct execution order:
   - DDL files: No prefix needed (alphabetical order works)
   - Seed files: `seed_*` ensures auth scripts run after `sample_data.sql`

## Troubleshooting

### Scripts Not Running

If scripts don't execute during initialization:

1. Check file permissions: `ls -la backend/sql/ddl/ backend/sql/seed/`
2. Check docker-compose.yml volume mounts
3. Check database logs: `docker-compose logs db | grep -i error`

### Password Not Working

If login fails after initialization:

1. Verify hash was set: 
   ```sql
   SELECT email, password_hash FROM staff WHERE email = 'admin@example.com';
   ```
2. Regenerate password hash and update SQL file
3. Re-run the seed script manually

### Missing Data

If data is missing:

1. Check execution order in logs: `docker-compose logs db | grep "running"`
2. Verify dependencies (e.g., `seed_patient_auth.sql` requires patients from `sample_data.sql`)
3. Check for SQL errors in logs
