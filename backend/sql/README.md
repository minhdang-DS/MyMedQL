# MyMedQL SQL Assets

This directory contains the complete database schema, DDL, and seed data for the MyMedQL system.

## Directory Structure

- **ddl/**: Data Definition Language files (schema, views, procedures, triggers, etc.)
- **seed/**: Sample data and demo scenarios

## File Execution Order

To set up the database from scratch, run the files in this order:

### 1. DDL Files (in order)

1. **schema.sql** - Creates the database and all table definitions
2. **partitioning.sql** - Applies partitioning to the vitals table (must run after schema.sql)
3. **views.sql** - Creates convenience views for common queries
4. **stored_procedures.sql** - Creates stored procedures for common operations
5. **triggers.sql** - Creates database triggers for automatic validation and processing
6. **indexes.sql** - Additional indexes (currently empty, reserved for future use)

### 2. Seed Files (optional, for demo/testing)

1. **sample_thresholds.sql** - Inserts global thresholds for vital signs monitoring
2. **sample_data.sql** - Inserts sample patients, staff, devices, and admissions
3. **demo_scenarios.sql** - Creates demo scenarios with vital sign readings

## Quick Start

```bash
# Run all DDL files in order
mysql -u root -p < ddl/schema.sql
mysql -u root -p < ddl/partitioning.sql
mysql -u root -p < ddl/views.sql
mysql -u root -p < ddl/stored_procedures.sql
mysql -u root -p < ddl/triggers.sql

# Optionally run seed files for demo data
mysql -u root -p < seed/sample_thresholds.sql
mysql -u root -p < seed/sample_data.sql
mysql -u root -p < seed/demo_scenarios.sql
```

## Important Notes

- **Password Hashes**: The `sample_data.sql` file contains placeholder `<bcrypt-hash>` values. Replace these with actual bcrypt hashes generated in your application before running.
- **Partitioning**: The `partitioning.sql` file must be run after `schema.sql` because it modifies the vitals table structure.
- **Dependencies**: Seed files depend on the DDL files being run first. They also depend on each other (sample_data.sql should run before demo_scenarios.sql).

## File Descriptions

### DDL Files

- **schema.sql**: Core database schema with all table definitions, indexes, and foreign keys
- **partitioning.sql**: Applies monthly partitioning to the vitals table for performance
- **views.sql**: Convenience views for aggregated queries (hourly averages, patient summaries)
- **stored_procedures.sql**: Reusable procedures for common operations (get last N readings, daily stats)
- **triggers.sql**: Automatic validation and processing (admission validation, threshold alerts, notifications)
- **indexes.sql**: Reserved for additional indexes beyond those in table definitions

### Seed Files

- **sample_thresholds.sql**: Global thresholds for vital signs (heart rate, SpO2, temperature, BP, respiration)
- **sample_data.sql**: Sample staff, patients, devices, admissions, and device assignments
- **demo_scenarios.sql**: Demo scenarios with various vital sign patterns (normal, threshold breaches, high-frequency)
