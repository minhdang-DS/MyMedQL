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

INSERT INTO patients (first_name, last_name, dob, gender, contact_info, room_id, medical_history) VALUES
    ('John', 'Doe', '1980-05-15', 'male', 
     JSON_OBJECT('phone', '+1-555-0101', 'email', 'john.doe@example.com', 
                 'emergency_contact', JSON_OBJECT('name', 'Jane Doe', 'phone', '+1-555-0102', 'relationship', 'spouse')), 
     '201-A', NULL),
    ('Jane', 'Smith', '1975-08-22', 'female',
     JSON_OBJECT('phone', '+1-555-0201', 'email', 'jane.smith@example.com',
                 'emergency_contact', JSON_OBJECT('name', 'John Smith', 'phone', '+1-555-0202', 'relationship', 'husband')),
     '201-B', NULL),
    ('Robert', 'Johnson', '1990-12-03', 'male',
     JSON_OBJECT('phone', '+1-555-0301', 'email', 'robert.johnson@example.com',
                 'emergency_contact', JSON_OBJECT('name', 'Mary Johnson', 'phone', '+1-555-0302', 'relationship', 'mother')),
     '305-ICU', NULL),
    ('Emily', 'Williams', '1985-03-18', 'female',
     JSON_OBJECT('phone', '+1-555-0401', 'email', 'emily.williams@example.com',
                 'emergency_contact', JSON_OBJECT('name', 'David Williams', 'phone', '+1-555-0402', 'relationship', 'brother')),
     '202-A', NULL),
    ('Michael', 'Brown', '1978-07-25', 'male',
     JSON_OBJECT('phone', '+1-555-0501', 'email', 'michael.brown@example.com',
                 'emergency_contact', JSON_OBJECT('name', 'Sarah Brown', 'phone', '+1-555-0502', 'relationship', 'wife')),
     '202-B', NULL),
    ('Sarah', 'Davis', '1992-11-08', 'female',
     JSON_OBJECT('phone', '+1-555-0601', 'email', 'sarah.davis@example.com',
                 'emergency_contact', JSON_OBJECT('name', 'James Davis', 'phone', '+1-555-0602', 'relationship', 'father')),
     '306-ICU', NULL),
    ('David', 'Miller', '1983-09-14', 'male',
     JSON_OBJECT('phone', '+1-555-0701', 'email', 'david.miller@example.com',
                 'emergency_contact', JSON_OBJECT('name', 'Lisa Miller', 'phone', '+1-555-0702', 'relationship', 'sister')),
     '203-A', NULL),
    ('Lisa', 'Wilson', '1987-04-30', 'female',
     JSON_OBJECT('phone', '+1-555-0801', 'email', 'lisa.wilson@example.com',
                 'emergency_contact', JSON_OBJECT('name', 'Tom Wilson', 'phone', '+1-555-0802', 'relationship', 'husband')),
     '203-B', NULL),
    ('Jane', 'Smith', '1975-08-22', 'female',
     JSON_OBJECT('phone', '+1-555-0901', 'email', 'jane.smith2@example.com',
                 'emergency_contact', JSON_OBJECT('name', 'John Smith', 'phone', '+1-555-0902', 'relationship', 'husband')),
     '204-A', NULL),
    ('Robert', 'Johnson', '1990-12-03', 'male',
     JSON_OBJECT('phone', '+1-555-1001', 'email', 'robert.johnson2@example.com',
                 'emergency_contact', JSON_OBJECT('name', 'Mary Johnson', 'phone', '+1-555-1002', 'relationship', 'mother')),
     '204-B', NULL);

-- ----------------------------------------------------------------------------
-- Example Device Records
-- ----------------------------------------------------------------------------
INSERT INTO devices (device_type, serial_number, metadata) VALUES
    ('Vital Signs Monitor', 'VSM-001', JSON_OBJECT('manufacturer', 'MedTech Inc', 'model', 'VSM-2024', 'firmware', '1.2.3', 'calibration_date', '2024-01-15', 'last_maintenance', '2024-11-01')),
    ('Vital Signs Monitor', 'VSM-002', JSON_OBJECT('manufacturer', 'MedTech Inc', 'model', 'VSM-2024', 'firmware', '1.2.3', 'calibration_date', '2024-02-20', 'last_maintenance', '2024-11-05')),
    ('Vital Signs Monitor', 'VSM-003', JSON_OBJECT('manufacturer', 'MedTech Inc', 'model', 'VSM-2024', 'firmware', '1.2.3', 'calibration_date', '2024-03-10', 'last_maintenance', '2024-11-10')),
    ('Pulse Oximeter', 'POX-001', JSON_OBJECT('manufacturer', 'HealthDev', 'model', 'POX-500', 'firmware', '2.1.0', 'calibration_date', '2024-01-05', 'last_maintenance', '2024-10-28')),
    ('Blood Pressure Monitor', 'BPM-001', JSON_OBJECT('manufacturer', 'HealthDev', 'model', 'BPM-300', 'firmware', '1.5.2', 'calibration_date', '2024-02-12', 'last_maintenance', '2024-11-08')),
    ('Vital Signs Monitor', 'VSM-004', JSON_OBJECT('manufacturer', 'MedTech Inc', 'model', 'VSM-2024', 'firmware', '1.2.3', 'calibration_date', '2024-04-18', 'last_maintenance', '2024-11-12')),
    ('Pulse Oximeter', 'POX-002', JSON_OBJECT('manufacturer', 'HealthDev', 'model', 'POX-500', 'firmware', '2.1.0', 'calibration_date', '2024-05-22', 'last_maintenance', '2024-11-15')),
    ('Blood Pressure Monitor', 'BPM-002', JSON_OBJECT('manufacturer', 'HealthDev', 'model', 'BPM-300', 'firmware', '1.5.2', 'calibration_date', '2024-06-30', 'last_maintenance', '2024-11-18'));

-- ----------------------------------------------------------------------------
-- Admission Records and Device Assignments
-- ----------------------------------------------------------------------------
-- Note: Admissions and device assignments are created by 04_seed_admissions.sql
--       which runs after staff is created, ensuring foreign key constraints are met.
