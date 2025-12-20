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
-- Example Admission Records
-- ----------------------------------------------------------------------------
-- Note: admitted_by references staff_id. 
-- Staff are created by seed_staff_auth.sql, so we need to find the doctor's staff_id
-- We'll use a subquery to get the first doctor's staff_id

INSERT INTO admissions (patient_id, admitted_at, status, admitted_by, discharge_notes) 
SELECT 
    p.patient_id,
    NOW() - INTERVAL (3 - p.patient_id) DAY,
    'admitted',
    (SELECT staff_id FROM staff WHERE role = 'doctor' LIMIT 1),
    NULL
FROM patients p
WHERE p.patient_id IN (1, 2);

-- ----------------------------------------------------------------------------
-- Example Device Assignments
-- ----------------------------------------------------------------------------
-- Assign devices to patients. The trigger will automatically close previous assignments.

-- Device assignments - use subquery to get nurse's staff_id
INSERT INTO device_assignments (device_id, patient_id, assigned_from, assigned_by, notes) 
SELECT 
    d.device_id,
    p.patient_id,
    NOW() - INTERVAL (3 - p.patient_id) DAY,
    (SELECT staff_id FROM staff WHERE role = 'nurse' LIMIT 1),
    CASE 
        WHEN p.patient_id = 1 THEN 'Initial device assignment for patient monitoring'
        WHEN p.patient_id = 2 THEN 'Device assigned for continuous monitoring'
        ELSE 'Long-term monitoring setup'
    END
FROM devices d
CROSS JOIN patients p
WHERE d.device_id IN (1, 2) AND p.patient_id IN (1, 2)
ORDER BY d.device_id, p.patient_id
LIMIT 2;
