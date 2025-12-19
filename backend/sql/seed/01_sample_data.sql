-- ============================================================================
-- MyMedQL Sample Data
-- ============================================================================
-- Description: Sample data for patients, staff, devices, and admissions.
-- 
-- Run this file after schema.sql to populate sample data.
-- 
-- IMPORTANT: Password hashes must be generated using bcrypt in your application.
--            Replace <bcrypt-hash> with actual bcrypt hashes before running.
-- ============================================================================

USE `mymedql`;

-- ----------------------------------------------------------------------------
-- Example Staff Records
-- ----------------------------------------------------------------------------
-- Replace <bcrypt-hash> with actual bcrypt hashes generated in your application.
-- Example bcrypt hash format: $2b$10$... (60 characters total)
-- 
-- To generate a bcrypt hash in Node.js:
--   const bcrypt = require('bcrypt');
--   const hash = await bcrypt.hash('password', 10);
-- 
-- To generate a bcrypt hash in Python:
--   import bcrypt
--   hash = bcrypt.hashpw(b'password', bcrypt.gensalt()).decode('utf-8')

-- Staff records are created by seed_staff_auth.sql with proper password hashes
-- This section is kept for reference but passwords will be set by seed_staff_auth.sql
-- 
-- INSERT INTO staff (name, email, password_hash, role, metadata) VALUES
--     ('Admin User', 'admin@example.com', '<bcrypt-hash>', 'admin', JSON_OBJECT('department', 'Administration')),
--     ('Dr. Alice Smith', 'alice@example.com', '<bcrypt-hash>', 'doctor', JSON_OBJECT('department', 'Cardiology', 'license', 'MD12345')),
--     ('Nurse Bob Johnson', 'bob@example.com', '<bcrypt-hash>', 'nurse', JSON_OBJECT('department', 'ICU', 'certification', 'RN67890')),
--     ('Viewer User', 'viewer@example.com', '<bcrypt-hash>', 'viewer', JSON_OBJECT('department', 'Support'));

-- ----------------------------------------------------------------------------
-- Example Patient Records
-- ----------------------------------------------------------------------------
-- Note: medical_history should be encrypted at the application layer before storage.
-- This example shows plain text for demonstration; in production, encrypt before inserting.
-- 
-- IMPORTANT: password_hash is NOT set in this INSERT. Patient passwords are set
--            automatically by seed_patient_auth.sql which runs after this file.

INSERT INTO patients (first_name, last_name, dob, gender, contact_info, medical_history) VALUES
    -- ('John', 'Doe', '1980-05-15', 'male', 
    --  JSON_OBJECT('phone', '+1-555-0101', 'email', 'john.doe@example.com', 
    --              'emergency_contact', JSON_OBJECT('name', 'Jane Doe', 'phone', '+1-555-0102')), 
    --  NULL),
    ('Jane', 'Smith', '1975-08-22', 'female',
     JSON_OBJECT('phone', '+1-555-0201', 'email', 'jane.smith@example.com',
                 'emergency_contact', JSON_OBJECT('name', 'John Smith', 'phone', '+1-555-0202')),
     NULL),
    ('Robert', 'Johnson', '1990-12-03', 'male',
     JSON_OBJECT('phone', '+1-555-0301', 'email', 'robert.johnson@example.com',
                 'emergency_contact', JSON_OBJECT('name', 'Mary Johnson', 'phone', '+1-555-0302')),
     NULL);

-- ----------------------------------------------------------------------------
-- Example Device Records
-- ----------------------------------------------------------------------------
INSERT INTO devices (device_type, serial_number, metadata) VALUES
    ('Vital Signs Monitor', 'VSM-001', JSON_OBJECT('manufacturer', 'MedTech Inc', 'model', 'VSM-2024', 'firmware', '1.2.3')),
    ('Vital Signs Monitor', 'VSM-002', JSON_OBJECT('manufacturer', 'MedTech Inc', 'model', 'VSM-2024', 'firmware', '1.2.3')),
    ('Vital Signs Monitor', 'VSM-003', JSON_OBJECT('manufacturer', 'MedTech Inc', 'model', 'VSM-2024', 'firmware', '1.2.3')),
    ('Pulse Oximeter', 'POX-001', JSON_OBJECT('manufacturer', 'HealthDev', 'model', 'POX-500', 'firmware', '2.1.0')),
    ('Blood Pressure Monitor', 'BPM-001', JSON_OBJECT('manufacturer', 'HealthDev', 'model', 'BPM-300', 'firmware', '1.5.2'));

-- ----------------------------------------------------------------------------
-- Admission Records and Device Assignments
-- ----------------------------------------------------------------------------
-- Note: Admissions and device assignments are created by 04_seed_admissions.sql
--       which runs after staff is created, ensuring foreign key constraints are met.
