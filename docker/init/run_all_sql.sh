#!/bin/bash
# This script runs all SQL files in subdirectories of /docker-entrypoint-initdb.d/
# MySQL's entrypoint only processes .sql files directly in the directory, not subdirectories
# This script ensures all SQL files in subdirectories are executed in order

set -e

echo "Running SQL files from subdirectories..."

# Wait for MySQL to be ready
until mysql -uroot -proot -e "SELECT 1" > /dev/null 2>&1; do
    echo "Waiting for MySQL to be ready..."
    sleep 1
done

# Ensure database exists
mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS mymedql CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || true

# Function to run SQL files in a directory
run_sql_directory() {
    local dir=$1
    if [ -d "$dir" ]; then
        echo "Processing directory: $dir"
        # Sort files to ensure consistent execution order
        find "$dir" -maxdepth 1 -name "*.sql" -type f | sort | while read sqlfile; do
            echo "Executing: $sqlfile"
            mysql -uroot -proot mymedql < "$sqlfile" || {
                echo "Warning: Error executing $sqlfile, continuing..."
            }
        done
    fi
}

# Run DDL files first (01_ddl)
run_sql_directory "/docker-entrypoint-initdb.d/01_ddl"

# Then run seed files (02_seed)
run_sql_directory "/docker-entrypoint-initdb.d/02_seed"

echo "All SQL files from subdirectories have been executed."

