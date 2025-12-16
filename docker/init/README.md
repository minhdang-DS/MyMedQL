# Docker Database Initialization

This folder contains initialization scripts for the MySQL Docker container.

## Execution Order

MySQL executes `.sql` and `.sh` files in `/docker-entrypoint-initdb.d/` **in alphabetical order**.

Our setup:

```
/docker-entrypoint-initdb.d/
├── 00_init/               (from ./docker/init/)
│   ├── 0_init.sql        # Creates database, sets charset
│   └── 9_complete.sql    # Final completion message
│
├── 01_ddl/                (from ./sql/ddl/)
│   ├── indexes.sql       # Additional indexes
│   ├── partitioning.sql  # Table partitioning
│   ├── schema.sql        # Core schema
│   ├── stored_procedures.sql
│   ├── triggers.sql
│   └── views.sql
│
└── 02_seed/               (from ./sql/seed/)
    ├── demo_scenarios.sql
    ├── sample_data.sql
    └── sample_thresholds.sql
```

## Files in This Directory

### `0_init.sql`
- Creates the `mymedql` database
- Sets character encoding to UTF-8
- Runs **first** (prefix `0_`)

### `9_complete.sql`
- Logs completion message
- Shows table count
- Runs **last** (prefix `9_`)

## How It Works

1. Docker Compose mounts this folder to `/docker-entrypoint-initdb.d/00_init/`
2. Docker Compose also mounts `sql/ddl/` and `sql/seed/`
3. MySQL executes all `.sql` files in alphabetical order across all subdirectories
4. Order: `00_init/` → `01_ddl/` → `02_seed/`

## Customization

To add your own initialization scripts:
- Add files with numeric prefixes to control order
- Use `.sql` for SQL scripts or `.sh` for shell scripts
- Files run only on **first container start** (when volume is empty)

## Reset Database

To re-run initialization scripts:

```bash
docker compose down -v  # Remove volume (deletes data!)
docker compose up --build
```

⚠️ **Warning**: This deletes all database data!

