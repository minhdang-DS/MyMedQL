-- MyMedQL Database Initialization Script
-- This script runs automatically when the MySQL container starts for the first time

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS mymedql;
USE mymedql;

-- Set character set
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create a simple health check table
CREATE TABLE IF NOT EXISTS health_check (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(100) NOT NULL,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_checked_at (checked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('Database initialized successfully');

-- Create users table as example (you can modify this based on your needs)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log initialization
SELECT 'MyMedQL database initialized successfully!' AS message;
