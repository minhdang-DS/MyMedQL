-- ============================================================================
-- Sample Data for MyMedQL Database
-- ============================================================================
-- Description: Realistic sample data for the patients table
--              This file contains INSERT statements for testing and development
-- ============================================================================

USE `MyMedQL`;

-- ============================================================================
-- Delete Existing Sample Data (if exists)
-- ============================================================================
-- Delete data in reverse order of foreign key dependencies
-- This ensures the script can be run multiple times safely
-- Note: Temporarily disable safe update mode to allow DELETE without WHERE clause
-- ============================================================================

-- Disable safe update mode for bulk deletes
SET SQL_SAFE_UPDATES = 0;

-- Delete notifications first (depends on alerts)
DELETE FROM notifications;

-- Delete alerts (depends on patients, staff, vitals)
DELETE FROM alerts;

-- Delete vitals (depends on patients, devices, admissions - but no FK due to partitioning)
DELETE FROM vitals;

-- Delete device assignments (depends on devices, patients, staff)
DELETE FROM device_assignments;

-- Delete thresholds (depends on patients, staff)
DELETE FROM thresholds;

-- Delete admissions (depends on patients, staff)
DELETE FROM admissions;

-- Delete devices (no dependencies)
DELETE FROM devices;

-- Delete staff (no dependencies)
DELETE FROM staff;

-- Delete patients (no dependencies)
DELETE FROM patients;

-- ============================================================================
-- Patients Table Sample Data
-- ============================================================================
-- Inserting 100 realistic patient records with diverse demographics,
-- contact information, and medical history (encrypted VARBINARY format)
-- Note: In production, medical_history should be encrypted at application layer
-- ============================================================================

INSERT INTO patients (patient_id, first_name, last_name, dob, gender, contact_info, medical_history, created_at) VALUES
-- Adult patients (ages 1018-65)
(1001, 'James', 'Anderson', '1985-03-15', 'male', 
 JSON_OBJECT('phone', '+1-555-0123', 'email', 'james.anderson@email.com', 'emergency_contact', JSON_OBJECT('name', 'Sarah Anderson', 'phone', '+1-555-0124', 'relationship', 'spouse')), 
 UNHEX('4D65646963616C20486973746F72793A20487970657274656E73696F6E2C20446961626574657320547970652032'), 
 '2024-01-15 08:30:00.000000'),

(1002, 'Maria', 'Garcia', '1990-07-22', 'female', 
 JSON_OBJECT('phone', '+1-555-0125', 'email', 'maria.garcia@email.com', 'emergency_contact', JSON_OBJECT('name', 'Carlos Garcia', 'phone', '+1-555-0126', 'relationship', 'brother')), 
 UNHEX('4D65646963616C20486973746F72793A20417374686D612C20416C6C657267696573'), 
 '2024-01-16 09:15:00.000000'),

(1003, 'Robert', 'Johnson', '1978-11-08', 'male', 
 JSON_OBJECT('phone', '+1-555-0127', 'email', 'robert.johnson@email.com', 'emergency_contact', JSON_OBJECT('name', 'Emily Johnson', 'phone', '+1-555-0128', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20486561727420446973656173652C20486967682043686F6C65737465726F6C'), 
 '2024-01-17 10:00:00.000000'),

(1004, 'Jennifer', 'Williams', '1992-04-30', 'female', 
 JSON_OBJECT('phone', '+1-555-0129', 'email', 'jennifer.williams@email.com', 'emergency_contact', JSON_OBJECT('name', 'Michael Williams', 'phone', '+1-555-0130', 'relationship', 'father')), 
 NULL, 
 '2024-01-18 11:20:00.000000'),

(1005, 'Michael', 'Brown', '1982-09-12', 'male', 
 JSON_OBJECT('phone', '+1-555-0131', 'email', 'michael.brown@email.com', 'emergency_contact', JSON_OBJECT('name', 'Lisa Brown', 'phone', '+1-555-0132', 'relationship', 'sister')), 
 UNHEX('4D65646963616C20486973746F72793A204F6265736974792C20536C6565702041706E6561'), 
 '2024-01-19 12:45:00.000000'),

(1006, 'Sarah', 'Davis', '1988-12-25', 'female', 
 JSON_OBJECT('phone', '+1-555-0133', 'email', 'sarah.davis@email.com', 'emergency_contact', JSON_OBJECT('name', 'David Davis', 'phone', '+1-555-0134', 'relationship', 'husband')), 
 UNHEX('4D65646963616C20486973746F72793A204D69677261696E65732C2044657072657373696F6E'), 
 '2024-01-20 13:30:00.000000'),

(1007, 'David', 'Miller', '1975-06-18', 'male', 
 JSON_OBJECT('phone', '+1-555-0135', 'email', 'david.miller@email.com', 'emergency_contact', JSON_OBJECT('name', 'Patricia Miller', 'phone', '+1-555-0136', 'relationship', 'mother')), 
 UNHEX('4D65646963616C20486973746F72793A204469616265746573205479706520312C204B69646E65792044697365617365'), 
 '2024-01-21 14:15:00.000000'),

(1008, 'Emily', 'Wilson', '1995-02-14', 'female', 
 JSON_OBJECT('phone', '+1-555-0137', 'email', 'emily.wilson@email.com', 'emergency_contact', JSON_OBJECT('name', 'John Wilson', 'phone', '+1-555-0138', 'relationship', 'father')), 
 NULL, 
 '2024-01-22 15:00:00.000000'),

(1009, 'Christopher', 'Moore', '1987-08-03', 'male', 
 JSON_OBJECT('phone', '+1-555-0139', 'email', 'christopher.moore@email.com', 'emergency_contact', JSON_OBJECT('name', 'Jessica Moore', 'phone', '+1-555-0140', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20487970657274656E73696F6E'), 
 '2024-01-23 16:20:00.000000'),

(1010, 'Jessica', 'Taylor', '1991-05-19', 'female', 
 JSON_OBJECT('phone', '+1-555-0141', 'email', 'jessica.taylor@email.com', 'emergency_contact', JSON_OBJECT('name', 'Robert Taylor', 'phone', '+1-555-0142', 'relationship', 'brother')), 
 UNHEX('4D65646963616C20486973746F72793A20416E656D69612C2049526F6E20446566696369656E6379'), 
 '2024-01-24 17:10:00.000000'),

(1011, 'Daniel', 'Martinez', '1983-10-27', 'male', 
 JSON_OBJECT('phone', '+1-555-0143', 'email', 'daniel.martinez@email.com', 'emergency_contact', JSON_OBJECT('name', 'Maria Martinez', 'phone', '+1-555-0144', 'relationship', 'mother')), 
 NULL, 
 '2024-01-25 18:00:00.000000'),

(1012, 'Amanda', 'Anderson', '1989-01-09', 'female', 
 JSON_OBJECT('phone', '+1-555-0145', 'email', 'amanda.anderson@email.com', 'emergency_contact', JSON_OBJECT('name', 'James Anderson', 'phone', '+1-555-0146', 'relationship', 'husband')), 
 UNHEX('4D65646963616C20486973746F72793A20546879726F6964204469736F72646572'), 
 '2024-01-26 19:30:00.000000'),

(1013, 'Matthew', 'Thomas', '1980-07-04', 'male', 
 JSON_OBJECT('phone', '+1-555-0147', 'email', 'matthew.thomas@email.com', 'emergency_contact', JSON_OBJECT('name', 'Susan Thomas', 'phone', '+1-555-0148', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20436F50442C204C756E672044697365617365'), 
 '2024-01-27 20:15:00.000000'),

(1014, 'Ashley', 'Jackson', '1993-11-20', 'female', 
 JSON_OBJECT('phone', '+1-555-0149', 'email', 'ashley.jackson@email.com', 'emergency_contact', JSON_OBJECT('name', 'Thomas Jackson', 'phone', '+1-555-0150', 'relationship', 'father')), 
 NULL, 
 '2024-01-28 21:00:00.000000'),

(1015, 'Joshua', 'White', '1986-03-31', 'male', 
 JSON_OBJECT('phone', '+1-555-0151', 'email', 'joshua.white@email.com', 'emergency_contact', JSON_OBJECT('name', 'Karen White', 'phone', '+1-555-0152', 'relationship', 'sister')), 
 UNHEX('4D65646963616C20486973746F72793A204869676820426C6F6F64205072657373757265'), 
 '2024-01-29 22:20:00.000000'),

(1016, 'Melissa', 'Harris', '1994-08-16', 'female', 
 JSON_OBJECT('phone', '+1-555-0153', 'email', 'melissa.harris@email.com', 'emergency_contact', JSON_OBJECT('name', 'Richard Harris', 'phone', '+1-555-0154', 'relationship', 'brother')), 
 UNHEX('4D65646963616C20486973746F72793A20417374686D612C20416C6C657267696573'), 
 '2024-01-30 23:10:00.000000'),

(1017, 'Andrew', 'Martin', '1979-12-07', 'male', 
 JSON_OBJECT('phone', '+1-555-0155', 'email', 'andrew.martin@email.com', 'emergency_contact', JSON_OBJECT('name', 'Nancy Martin', 'phone', '+1-555-0156', 'relationship', 'wife')), 
 NULL, 
 '2024-02-01 08:00:00.000000'),

(1018, 'Michelle', 'Thompson', '1990-04-23', 'female', 
 JSON_OBJECT('phone', '+1-555-0157', 'email', 'michelle.thompson@email.com', 'emergency_contact', JSON_OBJECT('name', 'Kevin Thompson', 'phone', '+1-555-0158', 'relationship', 'husband')), 
 UNHEX('4D65646963616C20486973746F72793A204469616265746573205479706520322C20487970657274656E73696F6E'), 
 '2024-02-02 09:15:00.000000'),

(1019, 'Joseph', 'Garcia', '1984-09-11', 'male', 
 JSON_OBJECT('phone', '+1-555-0159', 'email', 'joseph.garcia@email.com', 'emergency_contact', JSON_OBJECT('name', 'Carmen Garcia', 'phone', '+1-555-0160', 'relationship', 'mother')), 
 UNHEX('4D65646963616C20486973746F72793A2048656172742044697365617365'), 
 '2024-02-03 10:30:00.000000'),

(1020, 'Kimberly', 'Martinez', '1992-01-28', 'female', 
 JSON_OBJECT('phone', '+1-555-0161', 'email', 'kimberly.martinez@email.com', 'emergency_contact', JSON_OBJECT('name', 'Jose Martinez', 'phone', '+1-555-0162', 'relationship', 'father')), 
 NULL, 
 '2024-02-04 11:45:00.000000'),

-- Elderly patients (ages 65+)
(1021, 'William', 'Robinson', '1955-06-12', 'male', 
 JSON_OBJECT('phone', '+1-555-0163', 'email', 'william.robinson@email.com', 'emergency_contact', JSON_OBJECT('name', 'Betty Robinson', 'phone', '+1-555-0164', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20486561727420446973656173652C20487970657274656E73696F6E2C204469616265746573205479706520322C20417274687269746973'), 
 '2024-02-05 12:00:00.000000'),

(1022, 'Patricia', 'Clark', '1958-11-19', 'female', 
 JSON_OBJECT('phone', '+1-555-0165', 'email', 'patricia.clark@email.com', 'emergency_contact', JSON_OBJECT('name', 'Richard Clark', 'phone', '+1-555-0166', 'relationship', 'husband')), 
 UNHEX('4D65646963616C20486973746F72793A204F7374656F706F726F7369732C20487970657274656E73696F6E'), 
 '2024-02-06 13:15:00.000000'),

(1023, 'Richard', 'Rodriguez', '1952-03-25', 'male', 
 JSON_OBJECT('phone', '+1-555-0167', 'email', 'richard.rodriguez@email.com', 'emergency_contact', JSON_OBJECT('name', 'Maria Rodriguez', 'phone', '+1-555-0168', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20436F50442C204C756E672043616E6365722C2048656172742044697365617365'), 
 '2024-02-07 14:30:00.000000'),

(1024, 'Linda', 'Lewis', '1956-08-08', 'female', 
 JSON_OBJECT('phone', '+1-555-0169', 'email', 'linda.lewis@email.com', 'emergency_contact', JSON_OBJECT('name', 'John Lewis', 'phone', '+1-555-0170', 'relationship', 'son')), 
 UNHEX('4D65646963616C20486973746F72793A204469616265746573205479706520322C20487970657274656E73696F6E2C204B69646E65792044697365617365'), 
 '2024-02-08 15:45:00.000000'),

(1025, 'Thomas', 'Lee', '1950-12-14', 'male', 
 JSON_OBJECT('phone', '+1-555-0171', 'email', 'thomas.lee@email.com', 'emergency_contact', JSON_OBJECT('name', 'Susan Lee', 'phone', '+1-555-0172', 'relationship', 'daughter')), 
 UNHEX('4D65646963616C20486973746F72793A205374726F6B6520486973746F72792C2048656172742044697365617365'), 
 '2024-02-09 16:00:00.000000'),

(1026, 'Barbara', 'Walker', '1954-05-30', 'female', 
 JSON_OBJECT('phone', '+1-555-0173', 'email', 'barbara.walker@email.com', 'emergency_contact', JSON_OBJECT('name', 'Michael Walker', 'phone', '+1-555-0174', 'relationship', 'son')), 
 UNHEX('4D65646963616C20486973746F72793A204F7374656F706F726F7369732C20487970657274656E73696F6E'), 
 '2024-02-10 17:15:00.000000'),

(1027, 'Charles', 'Hall', '1951-09-17', 'male', 
 JSON_OBJECT('phone', '+1-555-0175', 'email', 'charles.hall@email.com', 'emergency_contact', JSON_OBJECT('name', 'Patricia Hall', 'phone', '+1-555-0176', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20436F50442C2048656172742044697365617365'), 
 '2024-02-11 18:30:00.000000'),

(1028, 'Elizabeth', 'Allen', '1957-02-22', 'female', 
 JSON_OBJECT('phone', '+1-555-0177', 'email', 'elizabeth.allen@email.com', 'emergency_contact', JSON_OBJECT('name', 'Robert Allen', 'phone', '+1-555-0178', 'relationship', 'husband')), 
 UNHEX('4D65646963616C20486973746F72793A204469616265746573205479706520322C20487970657274656E73696F6E'), 
 '2024-02-12 19:45:00.000000'),

(1029, 'Donald', 'Young', '1953-07-05', 'male', 
 JSON_OBJECT('phone', '+1-555-0179', 'email', 'donald.young@email.com', 'emergency_contact', JSON_OBJECT('name', 'Mary Young', 'phone', '+1-555-0180', 'relationship', 'wife')), 
 NULL, 
 '2024-02-13 20:00:00.000000'),

(1030, 'Sandra', 'King', '1959-10-28', 'female', 
 JSON_OBJECT('phone', '+1-555-0181', 'email', 'sandra.king@email.com', 'emergency_contact', JSON_OBJECT('name', 'James King', 'phone', '+1-555-0182', 'relationship', 'husband')), 
 UNHEX('4D65646963616C20486973746F72793A204F7374656F706F726F7369732C20487970657274656E73696F6E'), 
 '2024-02-14 21:15:00.000000'),

-- Young adults (ages 1018-1030)
(1031, 'Ryan', 'Wright', '2000-03-18', 'male', 
 JSON_OBJECT('phone', '+1-555-0183', 'email', 'ryan.wright@email.com', 'emergency_contact', JSON_OBJECT('name', 'Lisa Wright', 'phone', '+1-555-0184', 'relationship', 'mother')), 
 UNHEX('4D65646963616C20486973746F72793A20417374686D612C20416C6C657267696573'), 
 '2024-02-15 22:30:00.000000'),

(1032, 'Nicole', 'Lopez', '2001-08-24', 'female', 
 JSON_OBJECT('phone', '+1-555-0185', 'email', 'nicole.lopez@email.com', 'emergency_contact', JSON_OBJECT('name', 'Carlos Lopez', 'phone', '+1-555-0186', 'relationship', 'father')), 
 NULL, 
 '2024-02-16 23:45:00.000000'),

(1033, 'Brandon', 'Hill', '1999-12-10', 'male', 
 JSON_OBJECT('phone', '+1-555-0187', 'email', 'brandon.hill@email.com', 'emergency_contact', JSON_OBJECT('name', 'Jennifer Hill', 'phone', '+1-555-0188', 'relationship', 'sister')), 
 UNHEX('4D65646963616C20486973746F72793A20446961626574657320547970652031'), 
 '2024-02-17 08:00:00.000000'),

(1034, 'Stephanie', 'Scott', '2002-05-26', 'female', 
 JSON_OBJECT('phone', '+1-555-0189', 'email', 'stephanie.scott@email.com', 'emergency_contact', JSON_OBJECT('name', 'Robert Scott', 'phone', '+1-555-0190', 'relationship', 'father')), 
 NULL, 
 '2024-02-18 09:15:00.000000'),

(1035, 'Justin', 'Green', '1998-01-13', 'male', 
 JSON_OBJECT('phone', '+1-555-0191', 'email', 'justin.green@email.com', 'emergency_contact', JSON_OBJECT('name', 'Amanda Green', 'phone', '+1-555-0192', 'relationship', 'mother')), 
 UNHEX('4D65646963616C20486973746F72793A20487970657274656E73696F6E'), 
 '2024-02-19 10:30:00.000000'),

(1036, 'Lauren', 'Adams', '2003-07-29', 'female', 
 JSON_OBJECT('phone', '+1-555-0193', 'email', 'lauren.adams@email.com', 'emergency_contact', JSON_OBJECT('name', 'Michael Adams', 'phone', '+1-555-0194', 'relationship', 'father')), 
 NULL, 
 '2024-02-20 11:45:00.000000'),

(1037, 'Tyler', 'Baker', '1997-11-15', 'male', 
 JSON_OBJECT('phone', '+1-555-0195', 'email', 'tyler.baker@email.com', 'emergency_contact', JSON_OBJECT('name', 'Sarah Baker', 'phone', '+1-555-0196', 'relationship', 'sister')), 
 UNHEX('4D65646963616C20486973746F72793A20417374686D612C20416C6C657267696573'), 
 '2024-02-21 12:00:00.000000'),

(1038, 'Megan', 'Gonzalez', '2004-04-01', 'female', 
 JSON_OBJECT('phone', '+1-555-0197', 'email', 'megan.gonzalez@email.com', 'emergency_contact', JSON_OBJECT('name', 'Jose Gonzalez', 'phone', '+1-555-0198', 'relationship', 'father')), 
 NULL, 
 '2024-02-22 13:15:00.000000'),

(1039, 'Kevin', 'Nelson', '1996-09-20', 'male', 
 JSON_OBJECT('phone', '+1-555-0199', 'email', 'kevin.nelson@email.com', 'emergency_contact', JSON_OBJECT('name', 'Patricia Nelson', 'phone', '+1-555-0200', 'relationship', 'mother')), 
 UNHEX('4D65646963616C20486973746F72793A20446961626574657320547970652031'), 
 '2024-02-23 14:30:00.000000'),

(1040, 'Rachel', 'Carter', '2005-02-06', 'female', 
 JSON_OBJECT('phone', '+1-555-0201', 'email', 'rachel.carter@email.com', 'emergency_contact', JSON_OBJECT('name', 'David Carter', 'phone', '+1-555-0202', 'relationship', 'father')), 
 NULL, 
 '2024-02-24 15:45:00.000000'),

-- Middle-aged patients (ages 1040-60)
(1041, 'Brian', 'Mitchell', '1970-06-22', 'male', 
 JSON_OBJECT('phone', '+1-555-0203', 'email', 'brian.mitchell@email.com', 'emergency_contact', JSON_OBJECT('name', 'Karen Mitchell', 'phone', '+1-555-0204', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20487970657274656E73696F6E2C20486967682043686F6C65737465726F6C'), 
 '2024-02-25 16:00:00.000000'),

(1042, 'Angela', 'Perez', '1972-11-08', 'female', 
 JSON_OBJECT('phone', '+1-555-0205', 'email', 'angela.perez@email.com', 'emergency_contact', JSON_OBJECT('name', 'Juan Perez', 'phone', '+1-555-0206', 'relationship', 'husband')), 
 UNHEX('4D65646963616C20486973746F72793A204469616265746573205479706520322C20487970657274656E73696F6E'), 
 '2024-02-26 17:15:00.000000'),

(1043, 'Eric', 'Roberts', '1968-04-25', 'male', 
 JSON_OBJECT('phone', '+1-555-0207', 'email', 'eric.roberts@email.com', 'emergency_contact', JSON_OBJECT('name', 'Nancy Roberts', 'phone', '+1-555-0208', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20486561727420446973656173652C20487970657274656E73696F6E'), 
 '2024-02-27 18:30:00.000000'),

(1044, 'Rebecca', 'Turner', '1974-09-11', 'female', 
 JSON_OBJECT('phone', '+1-555-0209', 'email', 'rebecca.turner@email.com', 'emergency_contact', JSON_OBJECT('name', 'Mark Turner', 'phone', '+1-555-0210', 'relationship', 'husband')), 
 NULL, 
 '2024-02-28 19:45:00.000000'),

(1045, 'Steven', 'Phillips', '1969-01-28', 'male', 
 JSON_OBJECT('phone', '+1-555-0211', 'email', 'steven.phillips@email.com', 'emergency_contact', JSON_OBJECT('name', 'Linda Phillips', 'phone', '+1-555-0212', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20436F50442C204C756E672044697365617365'), 
 '2024-03-01 20:00:00.000000'),

(1046, 'Sharon', 'Campbell', '1973-07-14', 'female', 
 JSON_OBJECT('phone', '+1-555-0213', 'email', 'sharon.campbell@email.com', 'emergency_contact', JSON_OBJECT('name', 'Paul Campbell', 'phone', '+1-555-0214', 'relationship', 'husband')), 
 UNHEX('4D65646963616C20486973746F72793A20487970657274656E73696F6E2C204F7374656F706F726F736973'), 
 '2024-03-02 21:15:00.000000'),

(1047, 'Kenneth', 'Parker', '1971-12-30', 'male', 
 JSON_OBJECT('phone', '+1-555-0215', 'email', 'kenneth.parker@email.com', 'emergency_contact', JSON_OBJECT('name', 'Betty Parker', 'phone', '+1-555-0216', 'relationship', 'wife')), 
 NULL, 
 '2024-03-03 22:30:00.000000'),

(1048, 'Carol', 'Evans', '1975-05-17', 'female', 
 JSON_OBJECT('phone', '+1-555-0217', 'email', 'carol.evans@email.com', 'emergency_contact', JSON_OBJECT('name', 'Thomas Evans', 'phone', '+1-555-0218', 'relationship', 'husband')), 
 UNHEX('4D65646963616C20486973746F72793A204469616265746573205479706520322C20487970657274656E73696F6E'), 
 '2024-03-04 23:45:00.000000'),

(1049, 'Paul', 'Edwards', '1967-10-03', 'male', 
 JSON_OBJECT('phone', '+1-555-0219', 'email', 'paul.edwards@email.com', 'emergency_contact', JSON_OBJECT('name', 'Helen Edwards', 'phone', '+1-555-0220', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20486561727420446973656173652C20487970657274656E73696F6E'), 
 '2024-03-05 08:00:00.000000'),

(1050, 'Nancy', 'Collins', '1976-03-20', 'female', 
 JSON_OBJECT('phone', '+1-555-0221', 'email', 'nancy.collins@email.com', 'emergency_contact', JSON_OBJECT('name', 'Charles Collins', 'phone', '+1-555-0222', 'relationship', 'husband')), 
 NULL, 
 '2024-03-06 09:15:00.000000'),

-- Pediatric patients (ages 0-1017)
(1051, 'Ethan', 'Stewart', '2015-08-05', 'male', 
 JSON_OBJECT('phone', '+1-555-0223', 'email', 'ethan.stewart@email.com', 'emergency_contact', JSON_OBJECT('name', 'Jennifer Stewart', 'phone', '+1-555-0224', 'relationship', 'mother')), 
 UNHEX('4D65646963616C20486973746F72793A20417374686D612C20416C6C6572676965732C2041757469736D20537065637472756D204469736F72646572'), 
 '2024-03-07 10:30:00.000000'),

(1052, 'Sophia', 'Sanchez', '2016-01-21', 'female', 
 JSON_OBJECT('phone', '+1-555-0225', 'email', 'sophia.sanchez@email.com', 'emergency_contact', JSON_OBJECT('name', 'Carlos Sanchez', 'phone', '+1-555-0226', 'relationship', 'father')), 
 NULL, 
 '2024-03-08 11:45:00.000000'),

(1053, 'Mason', 'Morris', '2014-07-07', 'male', 
 JSON_OBJECT('phone', '+1-555-0227', 'email', 'mason.morris@email.com', 'emergency_contact', JSON_OBJECT('name', 'Amanda Morris', 'phone', '+1-555-0228', 'relationship', 'mother')), 
 UNHEX('4D65646963616C20486973746F72793A204469616265746573205479706520312C20416C6C657267696573'), 
 '2024-03-09 12:00:00.000000'),

(1054, 'Isabella', 'Rogers', '2017-02-23', 'female', 
 JSON_OBJECT('phone', '+1-555-0229', 'email', 'isabella.rogers@email.com', 'emergency_contact', JSON_OBJECT('name', 'Michael Rogers', 'phone', '+1-555-0230', 'relationship', 'father')), 
 NULL, 
 '2024-03-10 13:15:00.000000'),

(1055, 'Noah', 'Reed', '2013-09-09', 'male', 
 JSON_OBJECT('phone', '+1-555-0231', 'email', 'noah.reed@email.com', 'emergency_contact', JSON_OBJECT('name', 'Sarah Reed', 'phone', '+1-555-0232', 'relationship', 'mother')), 
 UNHEX('4D65646963616C20486973746F72793A20417374686D612C20416C6C657267696573'), 
 '2024-03-11 14:30:00.000000'),

(1056, 'Emma', 'Cook', '2018-04-25', 'female', 
 JSON_OBJECT('phone', '+1-555-0233', 'email', 'emma.cook@email.com', 'emergency_contact', JSON_OBJECT('name', 'David Cook', 'phone', '+1-555-0234', 'relationship', 'father')), 
 NULL, 
 '2024-03-12 15:45:00.000000'),

(1057, 'Liam', 'Morgan', '2012-10-11', 'male', 
 JSON_OBJECT('phone', '+1-555-0235', 'email', 'liam.morgan@email.com', 'emergency_contact', JSON_OBJECT('name', 'Jessica Morgan', 'phone', '+1-555-0236', 'relationship', 'mother')), 
 UNHEX('4D65646963616C20486973746F72793A204469616265746573205479706520312C20416C6C657267696573'), 
 '2024-03-13 16:00:00.000000'),

(1058, 'Olivia', 'Bell', '2019-05-27', 'female', 
 JSON_OBJECT('phone', '+1-555-0237', 'email', 'olivia.bell@email.com', 'emergency_contact', JSON_OBJECT('name', 'Robert Bell', 'phone', '+1-555-0238', 'relationship', 'father')), 
 NULL, 
 '2024-03-14 17:15:00.000000'),

(1059, 'Aiden', 'Murphy', '2011-11-13', 'male', 
 JSON_OBJECT('phone', '+1-555-0239', 'email', 'aiden.murphy@email.com', 'emergency_contact', JSON_OBJECT('name', 'Patricia Murphy', 'phone', '+1-555-0240', 'relationship', 'mother')), 
 UNHEX('4D65646963616C20486973746F72793A20417374686D612C20416C6C657267696573'), 
 '2024-03-15 18:30:00.000000'),

(1060, 'Ava', 'Bailey', '2020-06-29', 'female', 
 JSON_OBJECT('phone', '+1-555-0241', 'email', 'ava.bailey@email.com', 'emergency_contact', JSON_OBJECT('name', 'John Bailey', 'phone', '+1-555-0242', 'relationship', 'father')), 
 NULL, 
 '2024-03-16 19:45:00.000000'),

-- Additional diverse patients
(1061, 'Alexander', 'Rivera', '1981-12-15', 'male', 
 JSON_OBJECT('phone', '+1-555-0243', 'email', 'alexander.rivera@email.com', 'emergency_contact', JSON_OBJECT('name', 'Maria Rivera', 'phone', '+1-555-0244', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20487970657274656E73696F6E2C20486967682043686F6C65737465726F6C'), 
 '2024-03-17 20:00:00.000000'),

(1062, 'Samantha', 'Cooper', '1991-07-01', 'female', 
 JSON_OBJECT('phone', '+1-555-0245', 'email', 'samantha.cooper@email.com', 'emergency_contact', JSON_OBJECT('name', 'Daniel Cooper', 'phone', '+1-555-0246', 'relationship', 'husband')), 
 NULL, 
 '2024-03-18 21:15:00.000000'),

(1063, 'Benjamin', 'Richardson', '1985-01-17', 'male', 
 JSON_OBJECT('phone', '+1-555-0247', 'email', 'benjamin.richardson@email.com', 'emergency_contact', JSON_OBJECT('name', 'Emily Richardson', 'phone', '+1-555-0248', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A204469616265746573205479706520322C20487970657274656E73696F6E'), 
 '2024-03-19 22:30:00.000000'),

(1064, 'Victoria', 'Cox', '1993-08-03', 'female', 
 JSON_OBJECT('phone', '+1-555-0249', 'email', 'victoria.cox@email.com', 'emergency_contact', JSON_OBJECT('name', 'Matthew Cox', 'phone', '+1-555-0250', 'relationship', 'brother')), 
 NULL, 
 '2024-03-20 23:45:00.000000'),

(1065, 'Nathan', 'Howard', '1987-02-19', 'male', 
 JSON_OBJECT('phone', '+1-555-0251', 'email', 'nathan.howard@email.com', 'emergency_contact', JSON_OBJECT('name', 'Ashley Howard', 'phone', '+1-555-0252', 'relationship', 'sister')), 
 UNHEX('4D65646963616C20486973746F72793A20417374686D612C20416C6C657267696573'), 
 '2024-03-21 08:00:00.000000'),

(1066, 'Grace', 'Ward', '1995-09-05', 'female', 
 JSON_OBJECT('phone', '+1-555-0253', 'email', 'grace.ward@email.com', 'emergency_contact', JSON_OBJECT('name', 'Joshua Ward', 'phone', '+1-555-0254', 'relationship', 'brother')), 
 NULL, 
 '2024-03-22 09:15:00.000000'),

(1067, 'Samuel', 'Torres', '1983-03-22', 'male', 
 JSON_OBJECT('phone', '+1-555-0255', 'email', 'samuel.torres@email.com', 'emergency_contact', JSON_OBJECT('name', 'Melissa Torres', 'phone', '+1-555-0256', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20487970657274656E73696F6E'), 
 '2024-03-23 10:30:00.000000'),

(1068, 'Chloe', 'Peterson', '1994-10-08', 'female', 
 JSON_OBJECT('phone', '+1-555-0257', 'email', 'chloe.peterson@email.com', 'emergency_contact', JSON_OBJECT('name', 'Andrew Peterson', 'phone', '+1-555-0258', 'relationship', 'husband')), 
 NULL, 
 '2024-03-24 11:45:00.000000'),

(1069, 'Jacob', 'Gray', '1989-04-24', 'male', 
 JSON_OBJECT('phone', '+1-555-0259', 'email', 'jacob.gray@email.com', 'emergency_contact', JSON_OBJECT('name', 'Michelle Gray', 'phone', '+1-555-0260', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A204469616265746573205479706520312C20487970657274656E73696F6E'), 
 '2024-03-25 12:00:00.000000'),

(1070, 'Lily', 'Ramirez', '1996-11-10', 'female', 
 JSON_OBJECT('phone', '+1-555-0261', 'email', 'lily.ramirez@email.com', 'emergency_contact', JSON_OBJECT('name', 'Joseph Ramirez', 'phone', '+1-555-0262', 'relationship', 'father')), 
 NULL, 
 '2024-03-26 13:15:00.000000'),

-- More patients with various conditions
(1071, 'Jonathan', 'James', '1977-05-26', 'male', 
 JSON_OBJECT('phone', '+1-555-0263', 'email', 'jonathan.james@email.com', 'emergency_contact', JSON_OBJECT('name', 'Kimberly James', 'phone', '+1-555-0264', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20486561727420446973656173652C20487970657274656E73696F6E2C204469616265746573205479706520322'), 
 '2024-03-27 14:30:00.000000'),

(1072, 'Madison', 'Watson', '1992-12-12', 'female', 
 JSON_OBJECT('phone', '+1-555-0265', 'email', 'madison.watson@email.com', 'emergency_contact', JSON_OBJECT('name', 'Christopher Watson', 'phone', '+1-555-0266', 'relationship', 'husband')), 
 NULL, 
 '2024-03-28 15:45:00.000000'),

(1073, 'Zachary', 'Brooks', '1986-06-28', 'male', 
 JSON_OBJECT('phone', '+1-555-0267', 'email', 'zachary.brooks@email.com', 'emergency_contact', JSON_OBJECT('name', 'Jessica Brooks', 'phone', '+1-555-0268', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20417374686D612C20416C6C657267696573'), 
 '2024-03-29 16:00:00.000000'),

(1074, 'Hannah', 'Kelly', '1993-01-14', 'female', 
 JSON_OBJECT('phone', '+1-555-0269', 'email', 'hannah.kelly@email.com', 'emergency_contact', JSON_OBJECT('name', 'Daniel Kelly', 'phone', '+1-555-0270', 'relationship', 'brother')), 
 NULL, 
 '2024-03-30 17:15:00.000000'),

(1075, 'Anthony', 'Sanders', '1984-08-01', 'male', 
 JSON_OBJECT('phone', '+1-555-0271', 'email', 'anthony.sanders@email.com', 'emergency_contact', JSON_OBJECT('name', 'Amanda Sanders', 'phone', '+1-555-0272', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20487970657274656E73696F6E2C20486967682043686F6C65737465726F6C'), 
 '2024-03-31 18:30:00.000000'),

(1076, 'Abigail', 'Price', '1990-02-17', 'female', 
 JSON_OBJECT('phone', '+1-555-0273', 'email', 'abigail.price@email.com', 'emergency_contact', JSON_OBJECT('name', 'Matthew Price', 'phone', '+1-555-0274', 'relationship', 'husband')), 
 NULL, 
 '2024-04-01 19:45:00.000000'),

(1077, 'Nicholas', 'Bennett', '1988-09-03', 'male', 
 JSON_OBJECT('phone', '+1-555-0275', 'email', 'nicholas.bennett@email.com', 'emergency_contact', JSON_OBJECT('name', 'Sarah Bennett', 'phone', '+1-555-0276', 'relationship', 'sister')), 
 UNHEX('4D65646963616C20486973746F72793A204469616265746573205479706520322C20487970657274656E73696F6E'), 
 '2024-04-02 20:00:00.000000'),

(1078, 'Ella', 'Wood', '1997-03-20', 'female', 
 JSON_OBJECT('phone', '+1-555-0277', 'email', 'ella.wood@email.com', 'emergency_contact', JSON_OBJECT('name', 'David Wood', 'phone', '+1-555-0278', 'relationship', 'father')), 
 NULL, 
 '2024-04-03 21:15:00.000000'),

(1079, 'Christian', 'Barnes', '1982-10-06', 'male', 
 JSON_OBJECT('phone', '+1-555-0279', 'email', 'christian.barnes@email.com', 'emergency_contact', JSON_OBJECT('name', 'Emily Barnes', 'phone', '+1-555-0280', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20436F50442C204C756E672044697365617365'), 
 '2024-04-04 22:30:00.000000'),

(1080, 'Avery', 'Ross', '1994-04-22', 'female', 
 JSON_OBJECT('phone', '+1-555-0281', 'email', 'avery.ross@email.com', 'emergency_contact', JSON_OBJECT('name', 'Michael Ross', 'phone', '+1-555-0282', 'relationship', 'husband')), 
 NULL, 
 '2024-04-05 23:45:00.000000'),

-- Final batch of patients
(1081, 'Logan', 'Henderson', '1987-11-08', 'male', 
 JSON_OBJECT('phone', '+1-555-0283', 'email', 'logan.henderson@email.com', 'emergency_contact', JSON_OBJECT('name', 'Jessica Henderson', 'phone', '+1-555-0284', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20487970657274656E73696F6E'), 
 '2024-04-06 08:00:00.000000'),

(1082, 'Sofia', 'Coleman', '1991-05-25', 'female', 
 JSON_OBJECT('phone', '+1-555-0285', 'email', 'sofia.coleman@email.com', 'emergency_contact', JSON_OBJECT('name', 'Robert Coleman', 'phone', '+1-555-0286', 'relationship', 'father')), 
 NULL, 
 '2024-04-07 09:15:00.000000'),

(1083, 'Jack', 'Jenkins', '1985-12-11', 'male', 
 JSON_OBJECT('phone', '+1-555-0287', 'email', 'jack.jenkins@email.com', 'emergency_contact', JSON_OBJECT('name', 'Patricia Jenkins', 'phone', '+1-555-0288', 'relationship', 'mother')), 
 UNHEX('4D65646963616C20486973746F72793A20486561727420446973656173652C20487970657274656E73696F6E'), 
 '2024-04-08 10:30:00.000000'),

(1084, 'Mia', 'Perry', '1993-06-27', 'female', 
 JSON_OBJECT('phone', '+1-555-0289', 'email', 'mia.perry@email.com', 'emergency_contact', JSON_OBJECT('name', 'John Perry', 'phone', '+1-555-0290', 'relationship', 'father')), 
 NULL, 
 '2024-04-09 11:45:00.000000'),

(1085, 'Owen', 'Powell', '1989-01-13', 'male', 
 JSON_OBJECT('phone', '+1-555-0291', 'email', 'owen.powell@email.com', 'emergency_contact', JSON_OBJECT('name', 'Lisa Powell', 'phone', '+1-555-0292', 'relationship', 'sister')), 
 UNHEX('4D65646963616C20486973746F72793A204469616265746573205479706520312C20416C6C657267696573'), 
 '2024-04-10 12:00:00.000000'),

(1086, 'Charlotte', 'Long', '1996-08-29', 'female', 
 JSON_OBJECT('phone', '+1-555-0293', 'email', 'charlotte.long@email.com', 'emergency_contact', JSON_OBJECT('name', 'Kevin Long', 'phone', '+1-555-0294', 'relationship', 'brother')), 
 NULL, 
 '2024-04-11 13:15:00.000000'),

(1087, 'Wyatt', 'Patterson', '1983-03-16', 'male', 
 JSON_OBJECT('phone', '+1-555-0295', 'email', 'wyatt.patterson@email.com', 'emergency_contact', JSON_OBJECT('name', 'Amanda Patterson', 'phone', '+1-555-0296', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20487970657274656E73696F6E2C20486967682043686F6C65737465726F6C'), 
 '2024-04-12 14:30:00.000000'),

(1088, 'Harper', 'Hughes', '1995-10-02', 'female', 
 JSON_OBJECT('phone', '+1-555-0297', 'email', 'harper.hughes@email.com', 'emergency_contact', JSON_OBJECT('name', 'Matthew Hughes', 'phone', '+1-555-0298', 'relationship', 'husband')), 
 NULL, 
 '2024-04-13 15:45:00.000000'),

(1089, 'Grayson', 'Flores', '1988-04-18', 'male', 
 JSON_OBJECT('phone', '+1-555-0299', 'email', 'grayson.flores@email.com', 'emergency_contact', JSON_OBJECT('name', 'Maria Flores', 'phone', '+1-555-0300', 'relationship', 'wife')), 
 UNHEX('4D65646963616C20486973746F72793A20417374686D612C20416C6C657267696573'), 
 '2024-04-14 16:00:00.000000'),

(1090, 'Scarlett', 'Washington', '1992-11-04', 'female', 
 JSON_OBJECT('phone', '+1-555-0301', 'email', 'scarlett.washington@email.com', 'emergency_contact', JSON_OBJECT('name', 'David Washington', 'phone', '+1-555-0302', 'relationship', 'father')), 
 NULL, 
 '2024-04-15 17:15:00.000000');

-- ============================================================================
-- Staff Table Sample Data
-- ============================================================================
-- Inserting realistic healthcare staff records with various roles
-- Note: Password hashes are placeholder bcrypt hashes (60 chars).
--       In production, generate actual bcrypt hashes in the application layer.
--
-- Staff ID Mapping (auto-increment depends on existing records):
--   - Admins: IDs vary (1003 records) - Check with: SELECT MIN(staff_id), MAX(staff_id) FROM staff WHERE role = 'admin';
--   - Doctors: IDs vary (1015 records) - Check with: SELECT MIN(staff_id), MAX(staff_id) FROM staff WHERE role = 'doctor';
--   - Nurses: IDs vary (1025 records) - Check with: SELECT MIN(staff_id), MAX(staff_id) FROM staff WHERE role = 'nurse';
--            Note: Device assignments use the first 1015 nurses for assigned_by field
--            If your nurses start at 2019, use IDs 2019-2033 (first 1015 nurses)
--   - Viewers: IDs vary (1008 records) - Check with: SELECT MIN(staff_id), MAX(staff_id) FROM staff WHERE role = 'viewer';
-- Total: 51 staff records
-- IMPORTANT: Run debug_staff_ids.sql to find actual staff IDs, then update device_assignments.assigned_by accordingly
--            Current database shows: Nurses 2019-451, so first 1015 nurses are 2019-2033
-- ============================================================================

INSERT INTO staff (staff_id, name, email, password_hash, role, metadata, created_at) VALUES
-- Administrators (1003 records)
(2001, 'Dr. Sarah Mitchell', 'sarah.mitchell@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin',
 JSON_OBJECT('department', 'Administration', 'employee_id', 'ADM001', 'phone', '+1-555-1001', 'title', 'Chief Medical Officer'),
 '2023-01-15 08:00:00.000000'),

(2002, 'Michael Chen', 'michael.chen@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin',
 JSON_OBJECT('department', 'IT Administration', 'employee_id', 'ADM002', 'phone', '+1-555-1002', 'title', 'IT Director'),
 '2023-01-20 09:00:00.000000'),

(2003, 'Jennifer Thompson', 'jennifer.thompson@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin',
 JSON_OBJECT('department', 'Administration', 'employee_id', 'ADM003', 'phone', '+1-555-1003', 'title', 'Hospital Administrator'),
 '2023-02-01 10:00:00.000000'),

-- Doctors (1015 records) - Various specializations
(2004, 'Dr. Robert Anderson', 'robert.anderson@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Cardiology', 'employee_id', 'DOC001', 'phone', '+1-555-2001', 'title', 'Cardiologist', 'specialization', 'Cardiac Surgery', 'license_number', 'MD-CARD-12345'),
 '2023-01-10 08:30:00.000000'),

(2005, 'Dr. Maria Rodriguez', 'maria.rodriguez@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Emergency Medicine', 'employee_id', 'DOC002', 'phone', '+1-555-2002', 'title', 'Emergency Physician', 'specialization', 'Emergency Medicine', 'license_number', 'MD-EMER-12346'),
 '2023-01-12 09:15:00.000000'),

(2006, 'Dr. James Wilson', 'james.wilson@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Internal Medicine', 'employee_id', 'DOC003', 'phone', '+1-555-2003', 'title', 'Internist', 'specialization', 'Internal Medicine', 'license_number', 'MD-INT-12347'),
 '2023-01-15 10:00:00.000000'),

(2007, 'Dr. Emily Davis', 'emily.davis@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Pediatrics', 'employee_id', 'DOC004', 'phone', '+1-555-2004', 'title', 'Pediatrician', 'specialization', 'Pediatric Care', 'license_number', 'MD-PED-12348'),
 '2023-01-18 11:00:00.000000'),

(2008, 'Dr. David Martinez', 'david.martinez@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Orthopedics', 'employee_id', 'DOC005', 'phone', '+1-555-2005', 'title', 'Orthopedic Surgeon', 'specialization', 'Orthopedic Surgery', 'license_number', 'MD-ORTH-12349'),
 '2023-01-20 12:00:00.000000'),

(2009, 'Dr. Lisa Johnson', 'lisa.johnson@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Neurology', 'employee_id', 'DOC006', 'phone', '+1-555-2006', 'title', 'Neurologist', 'specialization', 'Neurology', 'license_number', 'MD-NEUR-12350'),
 '2023-01-22 13:00:00.000000'),

(2010, 'Dr. Christopher Brown', 'christopher.brown@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Pulmonology', 'employee_id', 'DOC007', 'phone', '+1-555-2007', 'title', 'Pulmonologist', 'specialization', 'Pulmonary Medicine', 'license_number', 'MD-PULM-12351'),
 '2023-01-25 14:00:00.000000'),

(2011, 'Dr. Amanda White', 'amanda.white@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Oncology', 'employee_id', 'DOC008', 'phone', '+1-555-2008', 'title', 'Oncologist', 'specialization', 'Medical Oncology', 'license_number', 'MD-ONCO-12352'),
 '2023-01-28 15:00:00.000000'),

(2012, 'Dr. Matthew Taylor', 'matthew.taylor@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Surgery', 'employee_id', 'DOC009', 'phone', '+1-555-2009', 'title', 'General Surgeon', 'specialization', 'General Surgery', 'license_number', 'MD-SURG-12353'),
 '2023-02-01 16:00:00.000000'),

(2013, 'Dr. Jessica Lee', 'jessica.lee@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Anesthesiology', 'employee_id', 'DOC010', 'phone', '+1-555-2010', 'title', 'Anesthesiologist', 'specialization', 'Anesthesiology', 'license_number', 'MD-ANES-12354'),
 '2023-02-05 17:00:00.000000'),

(2014, 'Dr. Daniel Garcia', 'daniel.garcia@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Radiology', 'employee_id', 'DOC011', 'phone', '+1-555-2011', 'title', 'Radiologist', 'specialization', 'Diagnostic Radiology', 'license_number', 'MD-RAD-12355'),
 '2023-02-10 18:00:00.000000'),

(2015, 'Dr. Ashley Moore', 'ashley.moore@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Psychiatry', 'employee_id', 'DOC012', 'phone', '+1-555-2012', 'title', 'Psychiatrist', 'specialization', 'Psychiatry', 'license_number', 'MD-PSY-12356'),
 '2023-02-15 19:00:00.000000'),

(2016, 'Dr. Ryan Thompson', 'ryan.thompson@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Intensive Care', 'employee_id', 'DOC013', 'phone', '+1-555-2013', 'title', 'Intensivist', 'specialization', 'Critical Care Medicine', 'license_number', 'MD-ICU-12357'),
 '2023-02-20 20:00:00.000000'),

(2017, 'Dr. Nicole Harris', 'nicole.harris@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Endocrinology', 'employee_id', 'DOC014', 'phone', '+1-555-2014', 'title', 'Endocrinologist', 'specialization', 'Endocrinology', 'license_number', 'MD-ENDO-12358'),
 '2023-02-25 21:00:00.000000'),

(2018, 'Dr. Kevin Martinez', 'kevin.martinez@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor',
 JSON_OBJECT('department', 'Gastroenterology', 'employee_id', 'DOC015', 'phone', '+1-555-2015', 'title', 'Gastroenterologist', 'specialization', 'Gastroenterology', 'license_number', 'MD-GAST-12359'),
 '2023-03-01 22:00:00.000000'),

-- Nurses (1025 records) - Various departments and experience levels
(2019, 'Patricia Williams', 'patricia.williams@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Emergency', 'employee_id', 'NUR001', 'phone', '+1-555-1001', 'title', 'Registered Nurse', 'certification', 'RN, BSN', 'years_experience', 1015),
 '2023-01-05 08:00:00.000000'),

(2020, 'John Smith', 'john.smith@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Intensive Care Unit', 'employee_id', 'NUR002', 'phone', '+1-555-1002', 'title', 'Critical Care Nurse', 'certification', 'RN, CCRN', 'years_experience', 1012),
 '2023-01-08 09:00:00.000000'),

(2021, 'Mary Johnson', 'mary.johnson@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Cardiology', 'employee_id', 'NUR003', 'phone', '+1-555-1003', 'title', 'Cardiac Nurse', 'certification', 'RN, BSN', 'years_experience', 1010),
 '2023-01-10 10:00:00.000000'),

(2022, 'Robert Jones', 'robert.jones@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Pediatrics', 'employee_id', 'NUR004', 'phone', '+1-555-1004', 'title', 'Pediatric Nurse', 'certification', 'RN, CPN', 'years_experience', 1008),
 '2023-01-12 11:00:00.000000'),

(2023, 'Jennifer Davis', 'jennifer.davis@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Surgery', 'employee_id', 'NUR005', 'phone', '+1-555-1005', 'title', 'Operating Room Nurse', 'certification', 'RN, CNOR', 'years_experience', 1014),
 '2023-01-15 12:00:00.000000'),

(2024, 'Michael Miller', 'michael.miller@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Oncology', 'employee_id', 'NUR006', 'phone', '+1-555-1006', 'title', 'Oncology Nurse', 'certification', 'RN, OCN', 'years_experience', 1011),
 '2023-01-18 13:00:00.000000'),

(2025, 'Linda Wilson', 'linda.wilson@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Emergency', 'employee_id', 'NUR007', 'phone', '+1-555-1007', 'title', 'Emergency Nurse', 'certification', 'RN, CEN', 'years_experience', 1009),
 '2023-01-20 14:00:00.000000'),

(2026, 'William Brown', 'william.brown@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Intensive Care Unit', 'employee_id', 'NUR008', 'phone', '+1-555-1008', 'title', 'Critical Care Nurse', 'certification', 'RN, CCRN', 'years_experience', 1013),
 '2023-01-22 15:00:00.000000'),

(2027, 'Barbara Moore', 'barbara.moore@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Medical-Surgical', 'employee_id', 'NUR009', 'phone', '+1-555-1009', 'title', 'Medical-Surgical Nurse', 'certification', 'RN, BSN', 'years_experience', 1007),
 '2023-01-25 16:00:00.000000'),

(2028, 'Richard Taylor', 'richard.taylor@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Neurology', 'employee_id', 'NUR010', 'phone', '+1-555-1010', 'title', 'Neurology Nurse', 'certification', 'RN, CNRN', 'years_experience', 1010),
 '2023-01-28 17:00:00.000000'),

(2029, 'Elizabeth Anderson', 'elizabeth.anderson@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Pediatrics', 'employee_id', 'NUR011', 'phone', '+1-555-1011', 'title', 'Pediatric Nurse', 'certification', 'RN, CPN', 'years_experience', 1006),
 '2023-02-01 18:00:00.000000'),

(2030, 'Joseph Thomas', 'joseph.thomas@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Orthopedics', 'employee_id', 'NUR012', 'phone', '+1-555-1012', 'title', 'Orthopedic Nurse', 'certification', 'RN, ONC', 'years_experience', 1008),
 '2023-02-05 19:00:00.000000'),

(2031, 'Susan Jackson', 'susan.jackson@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Intensive Care Unit', 'employee_id', 'NUR013', 'phone', '+1-555-1013', 'title', 'Critical Care Nurse', 'certification', 'RN, CCRN', 'years_experience', 1011),
 '2023-02-10 20:00:00.000000'),

(2032, 'Charles White', 'charles.white@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Emergency', 'employee_id', 'NUR014', 'phone', '+1-555-1014', 'title', 'Emergency Nurse', 'certification', 'RN, CEN', 'years_experience', 1009),
 '2023-02-15 21:00:00.000000'),

(2033, 'Karen Harris', 'karen.harris@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Oncology', 'employee_id', 'NUR015', 'phone', '+1-555-1015', 'title', 'Oncology Nurse', 'certification', 'RN, OCN', 'years_experience', 1012),
 '2023-02-20 22:00:00.000000'),

(2034, 'Nancy Martin', 'nancy.martin@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Cardiology', 'employee_id', 'NUR016', 'phone', '+1-555-1016', 'title', 'Cardiac Nurse', 'certification', 'RN, BSN', 'years_experience', 1007),
 '2023-02-25 23:00:00.000000'),

(2035, 'Betty Thompson', 'betty.thompson@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Surgery', 'employee_id', 'NUR017', 'phone', '+1-555-1017', 'title', 'Operating Room Nurse', 'certification', 'RN, CNOR', 'years_experience', 1010),
 '2023-03-01 08:00:00.000000'),

(2036, 'Margaret Garcia', 'margaret.garcia@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Medical-Surgical', 'employee_id', 'NUR018', 'phone', '+1-555-1018', 'title', 'Medical-Surgical Nurse', 'certification', 'RN, BSN', 'years_experience', 1005),
 '2023-03-05 09:00:00.000000'),

(2037, 'Helen Martinez', 'helen.martinez@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Intensive Care Unit', 'employee_id', 'NUR019', 'phone', '+1-555-1019', 'title', 'Critical Care Nurse', 'certification', 'RN, CCRN', 'years_experience', 1014),
 '2023-03-10 10:00:00.000000'),

(2038, 'Sandra Robinson', 'sandra.robinson@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Pediatrics', 'employee_id', 'NUR020', 'phone', '+1-555-1020', 'title', 'Pediatric Nurse', 'certification', 'RN, CPN', 'years_experience', 1006),
 '2023-03-15 11:00:00.000000'),

(2039, 'Donna Clark', 'donna.clark@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Emergency', 'employee_id', 'NUR021', 'phone', '+1-555-1021', 'title', 'Emergency Nurse', 'certification', 'RN, CEN', 'years_experience', 1008),
 '2023-03-20 12:00:00.000000'),

(2040, 'Carol Rodriguez', 'carol.rodriguez@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Oncology', 'employee_id', 'NUR022', 'phone', '+1-555-1022', 'title', 'Oncology Nurse', 'certification', 'RN, OCN', 'years_experience', 1009),
 '2023-03-25 13:00:00.000000'),

(2041, 'Ruth Lewis', 'ruth.lewis@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Cardiology', 'employee_id', 'NUR023', 'phone', '+1-555-1023', 'title', 'Cardiac Nurse', 'certification', 'RN, BSN', 'years_experience', 1011),
 '2023-03-30 14:00:00.000000'),

(2042, 'Sharon Lee', 'sharon.lee@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Surgery', 'employee_id', 'NUR024', 'phone', '+1-555-1024', 'title', 'Operating Room Nurse', 'certification', 'RN, CNOR', 'years_experience', 1013),
 '2023-04-05 15:00:00.000000'),

(2043, 'Michelle Walker', 'michelle.walker@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nurse',
 JSON_OBJECT('department', 'Intensive Care Unit', 'employee_id', 'NUR025', 'phone', '+1-555-1025', 'title', 'Critical Care Nurse', 'certification', 'RN, CCRN', 'years_experience', 1010),
 '2023-04-10 16:00:00.000000'),

-- Viewers (1008 records) - Read-only access for reporting and monitoring
(2044, 'Thomas Hall', 'thomas.hall@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'viewer',
 JSON_OBJECT('department', 'Quality Assurance', 'employee_id', 'VWR001', 'phone', '+1-555-4001', 'title', 'Quality Analyst'),
 '2023-01-20 08:00:00.000000'),

(2045, 'Patricia Allen', 'patricia.allen@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'viewer',
 JSON_OBJECT('department', 'Research', 'employee_id', 'VWR002', 'phone', '+1-555-4002', 'title', 'Research Analyst'),
 '2023-01-25 09:00:00.000000'),

(2046, 'Donald Young', 'donald.young@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'viewer',
 JSON_OBJECT('department', 'Compliance', 'employee_id', 'VWR003', 'phone', '+1-555-4003', 'title', 'Compliance Officer'),
 '2023-02-01 10:00:00.000000'),

(2047, 'Sandra King', 'sandra.king@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'viewer',
 JSON_OBJECT('department', 'Analytics', 'employee_id', 'VWR004', 'phone', '+1-555-4004', 'title', 'Data Analyst'),
 '2023-02-10 11:00:00.000000'),

(2048, 'Paul Wright', 'paul.wright@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'viewer',
 JSON_OBJECT('department', 'Quality Assurance', 'employee_id', 'VWR005', 'phone', '+1-555-4005', 'title', 'Quality Analyst'),
 '2023-02-15 12:00:00.000000'),

(2049, 'Carol Lopez', 'carol.lopez@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'viewer',
 JSON_OBJECT('department', 'Research', 'employee_id', 'VWR006', 'phone', '+1-555-4006', 'title', 'Research Assistant'),
 '2023-02-20 13:00:00.000000'),

(2050, 'Mark Hill', 'mark.hill@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'viewer',
 JSON_OBJECT('department', 'Analytics', 'employee_id', 'VWR007', 'phone', '+1-555-4007', 'title', 'Business Intelligence Analyst'),
 '2023-02-25 14:00:00.000000'),

(2051, 'Lisa Scott', 'lisa.scott@medql.hospital', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'viewer',
 JSON_OBJECT('department', 'Compliance', 'employee_id', 'VWR008', 'phone', '+1-555-4008', 'title', 'Compliance Assistant'),
 '2023-03-01 15:00:00.000000');

-- ============================================================================
-- End of Staff Sample Data
-- ============================================================================
-- Total: 51 staff records inserted
-- Role distribution: Administrators (1003), Doctors (1015), Nurses (1025), Viewers (1008)
-- All staff have unique email addresses and placeholder bcrypt password hashes
-- Metadata includes department, employee_id, phone, title, and role-specific info
-- ============================================================================

-- ============================================================================
-- Devices Table Sample Data
-- ============================================================================
-- Inserting realistic medical device records with various types
-- Device types include: vital signs monitors, pulse oximeters, blood pressure monitors, etc.
-- ============================================================================

INSERT INTO devices (device_id, device_type, serial_number, metadata, created_at) VALUES
-- Vital Signs Monitors (1015 devices)
(1001, 'Vital Signs Monitor', 'VSM-2024-001', JSON_OBJECT('manufacturer', 'Philips', 'model', 'IntelliVue MX700', 'firmware_version', 'H.1015.00', 'calibration_date', '2024-01-15', 'location', 'ICU-1001'), '2023-12-01 08:00:00.000000'),
(1002, 'Vital Signs Monitor', 'VSM-2024-002', JSON_OBJECT('manufacturer', 'Philips', 'model', 'IntelliVue MX700', 'firmware_version', 'H.1015.00', 'calibration_date', '2024-01-20', 'location', 'ICU-1002'), '2023-12-01 08:30:00.000000'),
(1003, 'Vital Signs Monitor', 'VSM-2024-003', JSON_OBJECT('manufacturer', 'GE Healthcare', 'model', 'B650', 'firmware_version', '1002.1001.1003', 'calibration_date', '2024-01-25', 'location', 'ICU-1003'), '2023-12-02 09:00:00.000000'),
(1004, 'Vital Signs Monitor', 'VSM-2024-004', JSON_OBJECT('manufacturer', 'GE Healthcare', 'model', 'B650', 'firmware_version', '1002.1001.1003', 'calibration_date', '2024-02-01', 'location', 'ICU-1004'), '2023-12-02 09:30:00.000000'),
(1005, 'Vital Signs Monitor', 'VSM-2024-005', JSON_OBJECT('manufacturer', 'Philips', 'model', 'IntelliVue MX450', 'firmware_version', 'H.1012.05', 'calibration_date', '2024-02-05', 'location', 'ER-1001'), '2023-12-03 10:00:00.000000'),
(1006, 'Vital Signs Monitor', 'VSM-2024-006', JSON_OBJECT('manufacturer', 'Philips', 'model', 'IntelliVue MX450', 'firmware_version', 'H.1012.05', 'calibration_date', '2024-02-10', 'location', 'ER-1002'), '2023-12-03 10:30:00.000000'),
(1007, 'Vital Signs Monitor', 'VSM-2024-007', JSON_OBJECT('manufacturer', 'Mindray', 'model', 'BeneVision N12', 'firmware_version', 'V1.0.1002', 'calibration_date', '2024-02-15', 'location', 'Cardiology-1001'), '2023-12-04 11:00:00.000000'),
(1008, 'Vital Signs Monitor', 'VSM-2024-008', JSON_OBJECT('manufacturer', 'Mindray', 'model', 'BeneVision N12', 'firmware_version', 'V1.0.1002', 'calibration_date', '2024-02-20', 'location', 'Cardiology-1002'), '2023-12-04 11:30:00.000000'),
(1009, 'Vital Signs Monitor', 'VSM-2024-009', JSON_OBJECT('manufacturer', 'GE Healthcare', 'model', 'B450', 'firmware_version', '1001.1008.1005', 'calibration_date', '2024-03-01', 'location', 'Pediatrics-1001'), '2023-12-05 12:00:00.000000'),
(1010, 'Vital Signs Monitor', 'VSM-2024-010', JSON_OBJECT('manufacturer', 'GE Healthcare', 'model', 'B450', 'firmware_version', '1001.1008.1005', 'calibration_date', '2024-03-05', 'location', 'Pediatrics-1002'), '2023-12-05 12:30:00.000000'),
(1011, 'Vital Signs Monitor', 'VSM-2024-011', JSON_OBJECT('manufacturer', 'Philips', 'model', 'IntelliVue MX700', 'firmware_version', 'H.1015.00', 'calibration_date', '2024-03-10', 'location', 'Surgery-1001'), '2023-12-06 13:00:00.000000'),
(1012, 'Vital Signs Monitor', 'VSM-2024-012', JSON_OBJECT('manufacturer', 'Philips', 'model', 'IntelliVue MX700', 'firmware_version', 'H.1015.00', 'calibration_date', '2024-03-15', 'location', 'Surgery-1002'), '2023-12-06 13:30:00.000000'),
(1013, 'Vital Signs Monitor', 'VSM-2024-013', JSON_OBJECT('manufacturer', 'Mindray', 'model', 'BeneVision N15', 'firmware_version', 'V1.1002.1001', 'calibration_date', '2024-03-20', 'location', 'Oncology-1001'), '2023-12-07 14:00:00.000000'),
(1014, 'Vital Signs Monitor', 'VSM-2024-014', JSON_OBJECT('manufacturer', 'Mindray', 'model', 'BeneVision N15', 'firmware_version', 'V1.1002.1001', 'calibration_date', '2024-03-25', 'location', 'Oncology-1002'), '2023-12-07 14:30:00.000000'),
(1015, 'Vital Signs Monitor', 'VSM-2024-015', JSON_OBJECT('manufacturer', 'GE Healthcare', 'model', 'B650', 'firmware_version', '1002.1001.1003', 'calibration_date', '2024-04-01', 'location', 'Neurology-1001'), '2023-12-08 15:00:00.000000'),

-- Pulse Oximeters (1010 devices)
(1016, 'Pulse Oximeter', 'POX-2024-001', JSON_OBJECT('manufacturer', 'Masimo', 'model', 'Rad-97', 'firmware_version', '1007.1001.1002', 'calibration_date', '2024-01-10', 'location', 'ICU'), '2023-12-10 08:00:00.000000'),
(1017, 'Pulse Oximeter', 'POX-2024-002', JSON_OBJECT('manufacturer', 'Masimo', 'model', 'Rad-97', 'firmware_version', '1007.1001.1002', 'calibration_date', '2024-01-15', 'location', 'ICU'), '2023-12-10 08:30:00.000000'),
(1018, 'Pulse Oximeter', 'POX-2024-003', JSON_OBJECT('manufacturer', 'Nonin', 'model', 'Onyx Vantage 9590', 'firmware_version', '1003.1002.1001', 'calibration_date', '2024-01-20', 'location', 'ER'), '2023-12-11 09:00:00.000000'),
(1019, 'Pulse Oximeter', 'POX-2024-004', JSON_OBJECT('manufacturer', 'Nonin', 'model', 'Onyx Vantage 9590', 'firmware_version', '1003.1002.1001', 'calibration_date', '2024-01-25', 'location', 'ER'), '2023-12-11 09:30:00.000000'),
(1020, 'Pulse Oximeter', 'POX-2024-005', JSON_OBJECT('manufacturer', 'Philips', 'model', 'M1194B', 'firmware_version', '1002.1005.0', 'calibration_date', '2024-02-01', 'location', 'Cardiology'), '2023-12-12 10:00:00.000000'),
(1021, 'Pulse Oximeter', 'POX-2024-006', JSON_OBJECT('manufacturer', 'Philips', 'model', 'M1194B', 'firmware_version', '1002.1005.0', 'calibration_date', '2024-02-05', 'location', 'Cardiology'), '2023-12-12 10:30:00.000000'),
(1022, 'Pulse Oximeter', 'POX-2024-007', JSON_OBJECT('manufacturer', 'Masimo', 'model', 'Rad-1008', 'firmware_version', '1006.1008.1005', 'calibration_date', '2024-02-10', 'location', 'Pediatrics'), '2023-12-13 11:00:00.000000'),
(1023, 'Pulse Oximeter', 'POX-2024-008', JSON_OBJECT('manufacturer', 'Masimo', 'model', 'Rad-1008', 'firmware_version', '1006.1008.1005', 'calibration_date', '2024-02-15', 'location', 'Pediatrics'), '2023-12-13 11:30:00.000000'),
(1024, 'Pulse Oximeter', 'POX-2024-009', JSON_OBJECT('manufacturer', 'Nonin', 'model', 'Onyx Vantage 9590', 'firmware_version', '1003.1002.1001', 'calibration_date', '2024-02-20', 'location', 'Surgery'), '2023-12-14 12:00:00.000000'),
(1025, 'Pulse Oximeter', 'POX-2024-010', JSON_OBJECT('manufacturer', 'Nonin', 'model', 'Onyx Vantage 9590', 'firmware_version', '1003.1002.1001', 'calibration_date', '2024-02-25', 'location', 'Surgery'), '2023-12-14 12:30:00.000000'),

-- Blood Pressure Monitors (1008 devices)
(1026, 'Blood Pressure Monitor', 'BPM-2024-001', JSON_OBJECT('manufacturer', 'Welch Allyn', 'model', 'Connex ProBP 3400', 'firmware_version', '1001.1003.1002', 'calibration_date', '2024-01-12', 'location', 'ICU'), '2023-12-15 13:00:00.000000'),
(1027, 'Blood Pressure Monitor', 'BPM-2024-002', JSON_OBJECT('manufacturer', 'Welch Allyn', 'model', 'Connex ProBP 3400', 'firmware_version', '1001.1003.1002', 'calibration_date', '2024-01-18', 'location', 'ICU'), '2023-12-15 13:30:00.000000'),
(1028, 'Blood Pressure Monitor', 'BPM-2024-003', JSON_OBJECT('manufacturer', 'Philips', 'model', 'IntelliVue MP70', 'firmware_version', 'H.1010.02', 'calibration_date', '2024-01-22', 'location', 'ER'), '2023-12-16 14:00:00.000000'),
(1029, 'Blood Pressure Monitor', 'BPM-2024-004', JSON_OBJECT('manufacturer', 'Philips', 'model', 'IntelliVue MP70', 'firmware_version', 'H.1010.02', 'calibration_date', '2024-01-28', 'location', 'ER'), '2023-12-16 14:30:00.000000'),
(1030, 'Blood Pressure Monitor', 'BPM-2024-005', JSON_OBJECT('manufacturer', 'GE Healthcare', 'model', 'Dinamap Pro 400', 'firmware_version', '1002.0.1001', 'calibration_date', '2024-02-05', 'location', 'Cardiology'), '2023-12-17 15:00:00.000000'),
(1031, 'Blood Pressure Monitor', 'BPM-2024-006', JSON_OBJECT('manufacturer', 'GE Healthcare', 'model', 'Dinamap Pro 400', 'firmware_version', '1002.0.1001', 'calibration_date', '2024-02-12', 'location', 'Cardiology'), '2023-12-17 15:30:00.000000'),
(1032, 'Blood Pressure Monitor', 'BPM-2024-007', JSON_OBJECT('manufacturer', 'Welch Allyn', 'model', 'Connex ProBP 3400', 'firmware_version', '1001.1003.1002', 'calibration_date', '2024-02-18', 'location', 'Pediatrics'), '2023-12-18 16:00:00.000000'),
(1033, 'Blood Pressure Monitor', 'BPM-2024-008', JSON_OBJECT('manufacturer', 'Welch Allyn', 'model', 'Connex ProBP 3400', 'firmware_version', '1001.1003.1002', 'calibration_date', '2024-02-25', 'location', 'Pediatrics'), '2023-12-18 16:30:00.000000'),

-- Temperature Monitors (1005 devices)
(1034, 'Temperature Monitor', 'TMP-2024-001', JSON_OBJECT('manufacturer', 'Welch Allyn', 'model', 'SureTemp Plus 690', 'firmware_version', '1001.0.1005', 'calibration_date', '2024-01-15', 'location', 'ICU'), '2023-12-20 08:00:00.000000'),
(1035, 'Temperature Monitor', 'TMP-2024-002', JSON_OBJECT('manufacturer', 'Welch Allyn', 'model', 'SureTemp Plus 690', 'firmware_version', '1001.0.1005', 'calibration_date', '2024-01-20', 'location', 'ER'), '2023-12-20 08:30:00.000000'),
(1036, 'Temperature Monitor', 'TMP-2024-003', JSON_OBJECT('manufacturer', 'Exergen', 'model', 'TemporalScanner TAT-5000', 'firmware_version', '1002.1001.0', 'calibration_date', '2024-02-01', 'location', 'Pediatrics'), '2023-12-21 09:00:00.000000'),
(1037, 'Temperature Monitor', 'TMP-2024-004', JSON_OBJECT('manufacturer', 'Exergen', 'model', 'TemporalScanner TAT-5000', 'firmware_version', '1002.1001.0', 'calibration_date', '2024-02-10', 'location', 'Cardiology'), '2023-12-21 09:30:00.000000'),
(1038, 'Temperature Monitor', 'TMP-2024-005', JSON_OBJECT('manufacturer', 'Welch Allyn', 'model', 'SureTemp Plus 690', 'firmware_version', '1001.0.1005', 'calibration_date', '2024-02-20', 'location', 'Surgery'), '2023-12-22 10:00:00.000000'),

-- Respiratory Monitors (1002 devices)
(1039, 'Respiratory Monitor', 'RESP-2024-001', JSON_OBJECT('manufacturer', 'Philips', 'model', 'Respironics NM3', 'firmware_version', '1003.1002.1001', 'calibration_date', '2024-01-18', 'location', 'ICU'), '2023-12-25 11:00:00.000000'),
(1040, 'Respiratory Monitor', 'RESP-2024-002', JSON_OBJECT('manufacturer', 'Philips', 'model', 'Respironics NM3', 'firmware_version', '1003.1002.1001', 'calibration_date', '2024-02-15', 'location', 'Pulmonology'), '2023-12-25 11:30:00.000000');

-- ============================================================================
-- Device Assignments Table Sample Data
-- ============================================================================
-- Inserting realistic device-to-patient assignment records
-- Some assignments are active (assigned_to IS NULL), others are historical
-- Nurses typically assign devices (staff_id 1019-43 are nurses based on insert order)
-- NOTE: Insert statements are split to avoid trigger conflicts with trg_device_assignments_close_previous
-- ============================================================================

-- First, insert all historical assignments (assigned_to has value)
-- These won't trigger the close_previous logic since they're already closed
-- Note: Using nurse staff_ids (2019-2033) - first 1015 nurses from the range 2019-451
-- Staff ID mapping (based on actual database):
--   Nurses: IDs 2019-451 (1025 records total)
--   Device assignments use the first 1015 nurses (2019-2033) for assigned_by
--   Verify with: SELECT staff_id, name, role FROM staff WHERE role = 'nurse' ORDER BY staff_id;
-- Split into smaller batches to avoid potential foreign key constraint issues
INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
-- Historical assignments (assigned_to has value)
(5001, 1001, 1002, '2024-03-15 14:00:00.000000', '2024-04-10 07:55:00.000000', 2019, 'Previous patient discharged', '2024-03-15 14:00:00.000000'),
(5002, 1002, 1003, '2024-03-20 16:30:00.000000', '2024-04-12 09:10:00.000000', 2020, 'Device reassigned to new patient', '2024-03-20 16:30:00.000000'),
(5003, 1003, 1007, '2024-03-25 08:45:00.000000', '2024-04-14 10:25:00.000000', 2021, 'Patient transferred to general ward', '2024-03-25 08:45:00.000000'),
(5004, 1004, 1009, '2024-03-28 12:15:00.000000', '2024-04-15 11:40:00.000000', 2022, 'Patient discharged', '2024-03-28 12:15:00.000000'),
(5005, 1005, 1010, '2024-04-01 09:00:00.000000', '2024-04-05 17:00:00.000000', 2023, 'Emergency room monitoring completed', '2024-04-01 09:00:00.000000'),
(5006, 1006, 1011, '2024-04-02 10:30:00.000000', '2024-04-06 14:30:00.000000', 2024, 'ER visit - monitoring completed', '2024-04-02 10:30:00.000000'),
(5007, 1007, 1013, '2024-04-03 11:00:00.000000', '2024-04-08 16:00:00.000000', 2025, 'Cardiology monitoring - patient stabilized', '2024-04-03 11:00:00.000000'),
(5008, 1008, 1015, '2024-04-04 13:20:00.000000', '2024-04-09 10:00:00.000000', 2026, 'Cardiac monitoring completed', '2024-04-04 13:20:00.000000'),
(5009, 1009, 1028, '2024-04-05 14:45:00.000000', '2024-04-11 12:00:00.000000', 2027, 'Pediatric monitoring - patient discharged', '2024-04-05 14:45:00.000000'),
(5010, 1010, 1030, '2024-04-06 15:30:00.000000', '2024-04-12 08:30:00.000000', 2028, 'Pediatric care completed', '2024-04-06 15:30:00.000000'),
(5011, 1011, 1033, '2024-04-07 16:00:00.000000', '2024-04-13 14:00:00.000000', 2029, 'Surgery recovery monitoring', '2024-04-07 16:00:00.000000'),
(5012, 1012, 1036, '2024-04-08 08:30:00.000000', '2024-04-14 09:00:00.000000', 2030, 'Post-operative monitoring', '2024-04-08 08:30:00.000000'),
(5013, 1013, 1038, '2024-04-09 09:45:00.000000', '2024-04-15 10:15:00.000000', 2031, 'Oncology patient monitoring', '2024-04-09 09:45:00.000000'),
(5014, 1014, 1040, '2024-04-10 10:15:00.000000', '2024-04-16 11:30:00.000000', 2032, 'Cancer treatment monitoring', '2024-04-10 10:15:00.000000'),
(5015, 1015, 1035, '2024-04-11 11:00:00.000000', '2024-04-17 13:00:00.000000', 2033, 'Neurology monitoring completed', '2024-04-11 11:00:00.000000');

-- Continue with pulse oximeter assignments
INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5016, 1016, 1002, '2024-03-15 14:05:00.000000', '2024-04-10 08:00:00.000000', 2019, 'Previous pulse oximetry assignment', '2024-03-15 14:05:00.000000'),
(5017, 1017, 1003, '2024-03-20 16:35:00.000000', '2024-04-12 09:15:00.000000', 2020, 'Oxygen monitoring completed', '2024-03-20 16:35:00.000000'),
(5018, 1018, 1006, '2024-03-22 08:00:00.000000', '2024-03-28 18:00:00.000000', 2021, 'Short-term monitoring', '2024-03-22 08:00:00.000000'),
(5019, 1019, 1008, '2024-03-24 09:30:00.000000', '2024-03-30 16:30:00.000000', 2022, 'ER pulse oximetry', '2024-03-24 09:30:00.000000'),
(5020, 1020, 1014, '2024-04-01 10:00:00.000000', '2024-04-07 14:00:00.000000', 2023, 'Cardiology pulse oximetry', '2024-04-01 10:00:00.000000'),
(5021, 1021, 1016, '2024-04-02 11:15:00.000000', '2024-04-08 15:30:00.000000', 2024, 'Pediatric oxygen monitoring', '2024-04-02 11:15:00.000000'),
(5022, 1022, 1027, '2024-04-03 12:00:00.000000', '2024-04-09 17:00:00.000000', 2025, 'Surgery pulse oximetry', '2024-04-03 12:00:00.000000'),
(5023, 1023, 1029, '2024-04-04 13:45:00.000000', '2024-04-10 09:00:00.000000', 2026, 'Oncology monitoring', '2024-04-04 13:45:00.000000'),
(5024, 1024, 1032, '2024-04-05 14:20:00.000000', '2024-04-11 10:30:00.000000', 2027, 'Pulse oximetry completed', '2024-04-05 14:20:00.000000');

-- Continue with temperature and respiratory monitor assignments
INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5025, 1034, 1002, '2024-03-15 14:10:00.000000', '2024-04-14 10:30:00.000000', 2019, 'Previous temperature monitoring', '2024-03-15 14:10:00.000000'),
(5026, 1035, 1003, '2024-03-20 16:40:00.000000', '2024-04-15 11:45:00.000000', 2020, 'Temperature tracking completed', '2024-03-20 16:40:00.000000'),
(5027, 1036, 1004, '2024-03-23 07:30:00.000000', '2024-03-29 19:00:00.000000', 2021, 'Fever monitoring', '2024-03-23 07:30:00.000000'),
(5028, 1037, 1006, '2024-03-25 08:50:00.000000', '2024-04-01 12:00:00.000000', 2022, 'Post-operative temperature', '2024-03-25 08:50:00.000000'),
(5029, 1039, 1007, '2024-03-28 12:20:00.000000', '2024-04-10 08:05:00.000000', 2023, 'Previous respiratory monitoring', '2024-03-28 12:20:00.000000'),
(5030, 1040, 1008, '2024-04-01 09:05:00.000000', '2024-04-05 17:05:00.000000', 2024, 'ER respiratory monitoring', '2024-04-01 09:05:00.000000');

-- Now insert active assignments (assigned_to IS NULL) one by one to avoid trigger conflicts
-- Each device can only have one active assignment at a time
-- Note: Using nurse staff_ids (2019-2033) since nurses typically assign devices
INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5031, 1001, 1001, '2024-04-10 08:00:00.000000', NULL, 2019, 'Assigned for continuous monitoring in ICU', '2024-04-10 08:00:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5032, 1002, 1005, '2024-04-12 09:15:00.000000', NULL, 2020, 'Post-surgical monitoring', '2024-04-12 09:15:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5033, 1003, 1012, '2024-04-14 10:30:00.000000', NULL, 2021, 'Cardiac monitoring required', '2024-04-14 10:30:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5034, 1004, 1018, '2024-04-15 11:45:00.000000', NULL, 2022, 'ICU admission - critical care', '2024-04-15 11:45:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5035, 1005, 1023, '2024-04-16 08:00:00.000000', NULL, 2023, 'Emergency room admission', '2024-04-16 08:00:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5036, 1006, 1027, '2024-04-17 09:15:00.000000', NULL, 2024, 'ER monitoring', '2024-04-17 09:15:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5037, 1007, 1031, '2024-04-18 10:30:00.000000', NULL, 2025, 'Cardiology ward', '2024-04-18 10:30:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5038, 1008, 1034, '2024-04-19 11:45:00.000000', NULL, 2026, 'Cardiac monitoring', '2024-04-19 11:45:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5039, 1009, 1037, '2024-04-20 12:00:00.000000', NULL, 2027, 'Pediatric care', '2024-04-20 12:00:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5040, 1010, 1040, '2024-04-21 13:15:00.000000', NULL, 2028, 'Pediatric monitoring', '2024-04-21 13:15:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5041, 1011, 1042, '2024-04-22 14:30:00.000000', NULL, 2029, 'Surgery recovery', '2024-04-22 14:30:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5042, 1012, 1045, '2024-04-23 15:45:00.000000', NULL, 2030, 'Post-operative care', '2024-04-23 15:45:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5043, 1013, 1048, '2024-04-24 16:00:00.000000', NULL, 2031, 'Oncology monitoring', '2024-04-24 16:00:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5044, 1014, 1050, '2024-04-25 17:15:00.000000', NULL, 2032, 'Cancer treatment', '2024-04-25 17:15:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5045, 1015, 1052, '2024-04-26 18:30:00.000000', NULL, 2033, 'Neurology ward', '2024-04-26 18:30:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5046, 1016, 1001, '2024-04-10 08:05:00.000000', NULL, 2019, 'Pulse oximetry monitoring', '2024-04-10 08:05:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5047, 1017, 1005, '2024-04-12 09:20:00.000000', NULL, 2020, 'Oxygen saturation tracking', '2024-04-12 09:20:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5048, 1018, 1023, '2024-04-16 08:05:00.000000', NULL, 2023, 'ER pulse oximetry', '2024-04-16 08:05:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5049, 1019, 1027, '2024-04-17 09:20:00.000000', NULL, 2024, 'Oxygen monitoring', '2024-04-17 09:20:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5050, 1020, 1031, '2024-04-18 10:35:00.000000', NULL, 2025, 'Cardiology pulse oximetry', '2024-04-18 10:35:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5051, 1021, 1034, '2024-04-19 11:50:00.000000', NULL, 2026, 'Cardiac oxygen monitoring', '2024-04-19 11:50:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5052, 1022, 1037, '2024-04-20 12:05:00.000000', NULL, 2027, 'Pediatric pulse oximetry', '2024-04-20 12:05:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5053, 1023, 1040, '2024-04-21 13:20:00.000000', NULL, 2028, 'Pediatric oxygen', '2024-04-21 13:20:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5054, 1024, 1042, '2024-04-22 14:35:00.000000', NULL, 2029, 'Surgery pulse oximetry', '2024-04-22 14:35:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5055, 1034, 1012, '2024-04-14 10:35:00.000000', NULL, 2021, 'Temperature monitoring', '2024-04-14 10:35:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5056, 1035, 1018, '2024-04-15 11:50:00.000000', NULL, 2022, 'Fever monitoring', '2024-04-15 11:50:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5057, 1036, 1045, '2024-04-23 15:50:00.000000', NULL, 2030, 'Post-op temperature', '2024-04-23 15:50:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5058, 1037, 1048, '2024-04-24 16:05:00.000000', NULL, 2031, 'Oncology temperature', '2024-04-24 16:05:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5059, 1039, 1001, '2024-04-10 08:10:00.000000', NULL, 2019, 'Respiratory rate monitoring', '2024-04-10 08:10:00.000000');

INSERT INTO device_assignments (assignment_id, device_id, patient_id, assigned_from, assigned_to, assigned_by, notes, created_at) VALUES
(5060, 1040, 1050, '2024-04-25 17:20:00.000000', NULL, 2032, 'Fever monitoring', '2024-04-25 17:20:00.000000');

-- ============================================================================
-- End of Devices and Device Assignments Sample Data
-- ============================================================================
-- Devices: 1040 total devices
--   - Vital Signs Monitors: 1015
--   - Pulse Oximeters: 1010
--   - Blood Pressure Monitors: 1008
--   - Temperature Monitors: 1005
--   - Respiratory Monitors: 1002
-- Device Assignments: 60 total assignments
--   - Active assignments (assigned_to IS NULL): 1020
--   - Historical assignments (assigned_to has value): 1040
-- All devices have realistic metadata including manufacturer, model, firmware, etc.
-- Assignments reference valid patient_ids and staff_ids (nurses typically assign devices)
-- ============================================================================

-- ============================================================================
-- Thresholds Table Sample Data
-- ============================================================================
-- Inserting global and patient-specific thresholds for vital signs monitoring
-- Global thresholds (patient_id IS NULL) apply to all patients unless overridden
-- Patient-specific thresholds take precedence over global ones
-- Note: Staff IDs vary based on existing records. Run debug_staff_ids.sql to verify actual IDs.
-- ============================================================================

INSERT INTO thresholds (threshold_id, name, min_value, max_value, unit, patient_id, effective_from, effective_to, created_by, notes, created_at) VALUES
-- Global thresholds (patient_id IS NULL) - Standard ICU vital sign ranges
-- Note: created_by uses staff_id 2001 (Dr. Sarah Mitchell, Chief Medical Officer) for global thresholds
(6001, 'heart_rate', 40, 120, 'bpm', NULL, '1970-01-01 00:00:00.000000', NULL, 2001, 'Standard heart rate range for adult patients', '2023-01-01 08:00:00.000000'),
(6002, 'spo2', 88, 1100, '%', NULL, '1970-01-01 00:00:00.000000', NULL, 2001, 'Standard oxygen saturation range', '2023-01-01 08:00:00.000000'),
(6003, 'temperature_c', 35.0, 38.0, 'C', NULL, '1970-01-01 00:00:00.000000', NULL, 2001, 'Standard body temperature range in Celsius', '2023-01-01 08:00:00.000000'),
(6004, 'bp_systolic', 80, 140, 'mmHg', NULL, '1970-01-01 00:00:00.000000', NULL, 2001, 'Standard systolic blood pressure range', '2023-01-01 08:00:00.000000'),
(6005, 'bp_diastolic', 50, 90, 'mmHg', NULL, '1970-01-01 00:00:00.000000', NULL, 2001, 'Standard diastolic blood pressure range', '2023-01-01 08:00:00.000000'),
(6006, 'respiration', 10, 336, 'breaths/min', NULL, '1970-01-01 00:00:00.000000', NULL, 2001, 'Standard respiratory rate range', '2023-01-01 08:00:00.000000'),

-- Patient-specific thresholds for special cases
-- Patient 1001 (James Anderson) - Hypertension, needs higher BP thresholds
(6007, 'bp_systolic', 90, 160, 'mmHg', 1001, '2024-04-10 00:00:00.000000', NULL, 2004, 'Patient has hypertension - adjusted threshold', '2024-04-10 08:00:00.000000'),
(6008, 'bp_diastolic', 60, 100, 'mmHg', 1001, '2024-04-10 00:00:00.000000', NULL, 2004, 'Hypertension patient - adjusted diastolic threshold', '2024-04-10 08:00:00.000000'),

-- Patient 1005 (Michael Brown) - Obesity, Sleep Apnea - needs lower SpO2 threshold
(6009, 'spo2', 85, 1100, '%', 1005, '2024-04-12 00:00:00.000000', NULL, 2005, 'Patient with sleep apnea - lower SpO2 threshold acceptable', '2024-04-12 09:00:00.000000'),

-- Patient 1012 (Matthew Thomas) - COPD, Lung Disease - needs adjusted respiratory and SpO2
(6010, 'respiration', 12, 35, 'breaths/min', 1012, '2024-04-14 00:00:00.000000', NULL, 2006, 'COPD patient - adjusted respiratory rate threshold', '2024-04-14 10:00:00.000000'),
(6011, 'spo2', 85, 1100, '%', 1012, '2024-04-14 00:00:00.000000', NULL, 2006, 'COPD patient - lower SpO2 threshold acceptable', '2024-04-14 10:00:00.000000'),

-- Patient 1018 (William Robinson) - Elderly with multiple conditions - adjusted thresholds
(6012, 'heart_rate', 45, 110, 'bpm', 1018, '2024-04-15 00:00:00.000000', NULL, 2007, 'Elderly patient - slightly adjusted heart rate range', '2024-04-15 11:00:00.000000'),
(6013, 'bp_systolic', 90, 150, 'mmHg', 1018, '2024-04-15 00:00:00.000000', NULL, 2007, 'Elderly patient with heart disease - adjusted BP', '2024-04-15 11:00:00.000000'),

-- Patient 1020 (Ethan Stewart) - Pediatric patient - different thresholds
(6014, 'heart_rate', 60, 140, 'bpm', 1020, '2024-04-05 00:00:00.000000', NULL, 2010, 'Pediatric patient - higher heart rate range', '2024-04-05 14:00:00.000000'),
(6015, 'respiration', 15, 40, 'breaths/min', 1020, '2024-04-05 00:00:00.000000', NULL, 2010, 'Pediatric patient - higher respiratory rate', '2024-04-05 14:00:00.000000'),

-- Patient 1022 (Sophia Sanchez) - Pediatric patient
(6016, 'heart_rate', 65, 145, 'bpm', 1022, '2024-04-06 00:00:00.000000', NULL, 2011, 'Pediatric patient - adjusted heart rate', '2024-04-06 15:00:00.000000'),

-- Patient 1030 (Ethan Stewart) - Different patient with same name, has diabetes
(6017, 'heart_rate', 50, 130, 'bpm', 1030, '2024-04-09 00:00:00.000000', NULL, 2012, 'Diabetic patient - adjusted monitoring', '2024-04-09 09:00:00.000000'),

-- Historical threshold (replaced by new one)
(6018, 'heart_rate', 40, 120, 'bpm', 1001, '2024-01-15 00:00:00.000000', '2024-04-09 23:59:59.999999', 2004, 'Previous threshold - replaced', '2024-01-15 08:00:00.000000');

-- ============================================================================
-- Admissions Table Sample Data
-- ============================================================================
-- Inserting patient admission records
-- Some admissions are active (discharge_time IS NULL), others are discharged
-- Staff IDs: 2001-2003 are admins, 2004-2018 are doctors (based on insert order)
-- IMPORTANT: Active admissions must be created BEFORE vitals can be inserted
--            due to trigger trg_vitals_validate_admission
-- ============================================================================

INSERT INTO admissions (admission_id, patient_id, admitted_at, discharge_time, status, admitted_by, discharge_notes, created_at) VALUES
-- Active admissions (discharge_time IS NULL) - Required for vitals insertion
(4001, 1001, '2024-04-10 07:30:00.000000', NULL, 'admitted', 2004, 'ICU admission for hypertension monitoring', '2024-04-10 07:30:00.000000'),
(4002, 1005, '2024-04-12 08:45:00.000000', NULL, 'admitted', 2005, 'Post-surgical recovery monitoring', '2024-04-12 08:45:00.000000'),
(4003, 1012, '2024-04-14 09:15:00.000000', NULL, 'admitted', 2006, 'COPD exacerbation - respiratory monitoring', '2024-04-14 09:15:00.000000'),
(4004, 1018, '2024-04-15 10:30:00.000000', NULL, 'admitted', 2007, 'Elderly patient - multiple comorbidities', '2024-04-15 10:30:00.000000'),
(4005, 1023, '2024-04-16 07:15:00.000000', NULL, 'admitted', 2008, 'Emergency room admission - observation', '2024-04-16 07:15:00.000000'),
(4006, 1027, '2024-04-17 08:30:00.000000', NULL, 'admitted', 2009, 'ER visit - monitoring', '2024-04-17 08:30:00.000000'),
(4007, 1031, '2024-04-18 09:00:00.000000', NULL, 'admitted', 2010, 'Cardiology ward - cardiac monitoring', '2024-04-18 09:00:00.000000'),
(4008, 1034, '2024-04-19 10:15:00.000000', NULL, 'admitted', 2011, 'Cardiac evaluation', '2024-04-19 10:15:00.000000'),
(4009, 1037, '2024-04-20 11:00:00.000000', NULL, 'admitted', 2012, 'Pediatric care - asthma monitoring', '2024-04-20 11:00:00.000000'),
(4010, 1040, '2024-04-21 12:00:00.000000', NULL, 'admitted', 2013, 'Pediatric admission', '2024-04-21 12:00:00.000000'),
(4011, 1042, '2024-04-22 13:00:00.000000', NULL, 'admitted', 2014, 'Post-operative recovery', '2024-04-22 13:00:00.000000'),
(4012, 1045, '2024-04-23 14:00:00.000000', NULL, 'admitted', 2015, 'Surgery recovery monitoring', '2024-04-23 14:00:00.000000'),
(4013, 1048, '2024-04-24 15:00:00.000000', NULL, 'admitted', 2016, 'Oncology treatment monitoring', '2024-04-24 15:00:00.000000'),
(4014, 1050, '2024-04-25 16:00:00.000000', NULL, 'admitted', 2017, 'Cancer treatment - vital monitoring', '2024-04-25 16:00:00.000000'),
(4015, 1052, '2024-04-26 17:00:00.000000', NULL, 'admitted', 2018, 'Neurology ward admission', '2024-04-26 17:00:00.000000'),

-- Discharged admissions (discharge_time has value)
(4016, 1002, '2024-03-10 08:00:00.000000', '2024-03-15 14:30:00.000000', 'discharged', 2004, 'Patient recovered and discharged home', '2024-03-10 08:00:00.000000'),
(4017, 1003, '2024-03-15 09:15:00.000000', '2024-03-20 16:00:00.000000', 'discharged', 2005, 'Treatment completed - stable condition', '2024-03-15 09:15:00.000000'),
(4018, 1004, '2024-03-20 10:30:00.000000', '2024-03-25 11:00:00.000000', 'discharged', 2006, 'Routine monitoring completed', '2024-03-20 10:30:00.000000'),
(4019, 1006, '2024-03-22 07:45:00.000000', '2024-03-28 17:30:00.000000', 'discharged', 2007, 'Post-operative recovery - discharged', '2024-03-22 07:45:00.000000'),
(4020, 1007, '2024-03-25 08:20:00.000000', '2024-04-01 12:00:00.000000', 'discharged', 2008, 'Cardiac monitoring completed', '2024-03-25 08:20:00.000000'),
(4021, 1008, '2024-03-24 09:00:00.000000', '2024-03-30 15:00:00.000000', 'discharged', 2009, 'ER visit - discharged stable', '2024-03-24 09:00:00.000000'),
(4022, 1009, '2024-03-28 10:15:00.000000', '2024-04-05 10:00:00.000000', 'discharged', 2010, 'Treatment completed', '2024-03-28 10:15:00.000000'),
(4023, 1010, '2024-04-01 08:30:00.000000', '2024-04-05 16:00:00.000000', 'discharged', 2011, 'ER monitoring - discharged', '2024-04-01 08:30:00.000000'),
(4024, 1011, '2024-04-02 09:45:00.000000', '2024-04-06 14:00:00.000000', 'discharged', 2012, 'Observation completed', '2024-04-02 09:45:00.000000'),
(4025, 1013, '2024-04-03 10:00:00.000000', '2024-04-08 15:30:00.000000', 'discharged', 2013, 'Cardiology monitoring - stable', '2024-04-03 10:00:00.000000'),
(4026, 1014, '2024-04-01 11:00:00.000000', '2024-04-07 13:00:00.000000', 'discharged', 2014, 'Cardiac evaluation completed', '2024-04-01 11:00:00.000000'),
(4027, 1015, '2024-04-04 12:30:00.000000', '2024-04-09 09:00:00.000000', 'discharged', 2015, 'Monitoring completed', '2024-04-04 12:30:00.000000'),
(4028, 1016, '2024-04-02 13:00:00.000000', '2024-04-08 16:00:00.000000', 'discharged', 2016, 'Pediatric care completed', '2024-04-02 13:00:00.000000'),
(4029, 1019, '2024-04-03 14:00:00.000000', '2024-04-09 17:00:00.000000', 'discharged', 2017, 'Surgery recovery - discharged', '2024-04-03 14:00:00.000000'),
(4030, 1020, '2024-04-05 08:00:00.000000', '2024-04-11 11:30:00.000000', 'discharged', 2018, 'Pediatric monitoring completed', '2024-04-05 08:00:00.000000'),
(4031, 1021, '2024-04-04 15:00:00.000000', '2024-04-10 10:00:00.000000', 'discharged', 2004, 'Oncology monitoring - stable', '2024-04-04 15:00:00.000000'),
(4032, 1022, '2024-04-06 09:00:00.000000', '2024-04-12 08:30:00.000000', 'discharged', 2005, 'Pediatric care - discharged', '2024-04-06 09:00:00.000000'),
(4033, 1024, '2024-04-05 10:00:00.000000', '2024-04-11 09:00:00.000000', 'discharged', 2006, 'Treatment completed', '2024-04-05 10:00:00.000000'),
(4034, 1025, '2024-04-07 11:00:00.000000', '2024-04-13 13:30:00.000000', 'discharged', 2007, 'Surgery recovery - discharged', '2024-04-07 11:00:00.000000'),
(4035, 1028, '2024-04-08 12:00:00.000000', '2024-04-14 08:00:00.000000', 'discharged', 2008, 'Post-operative care completed', '2024-04-08 12:00:00.000000'),
(4036, 1030, '2024-04-09 13:00:00.000000', '2024-04-15 09:15:00.000000', 'discharged', 2009, 'Oncology monitoring - stable', '2024-04-09 13:00:00.000000'),
(4037, 1032, '2024-04-10 14:00:00.000000', '2024-04-16 10:30:00.000000', 'discharged', 2010, 'Treatment completed', '2024-04-10 14:00:00.000000'),

-- Additional active admissions for other patients
(4038, 1006, '2024-04-20 08:00:00.000000', NULL, 'admitted', 2007, 'Readmission for follow-up care', '2024-04-20 08:00:00.000000'),
(4039, 1011, '2024-04-22 09:00:00.000000', NULL, 'admitted', 2008, 'Follow-up observation', '2024-04-22 09:00:00.000000'),
(4040, 1015, '2024-04-24 10:00:00.000000', NULL, 'admitted', 2009, 'Routine monitoring', '2024-04-24 10:00:00.000000'),
(4041, 1020, '2024-04-25 11:00:00.000000', NULL, 'admitted', 2010, 'Pediatric follow-up', '2024-04-25 11:00:00.000000'),
(4042, 1025, '2024-04-26 12:00:00.000000', NULL, 'admitted', 2011, 'Post-surgical follow-up', '2024-04-26 12:00:00.000000');

-- ============================================================================
-- Vitals Table Sample Data
-- ============================================================================
-- Inserting realistic time-series vital sign measurements
-- IMPORTANT: Patients must have active admissions (status='admitted', discharge_time IS NULL)
--            for vitals to be inserted due to trigger trg_vitals_validate_admission
--            Admissions are created above before this section
-- ============================================================================

INSERT INTO vitals (vitals_id, patient_id, device_id, ts, heart_rate, spo2, bp_systolic, bp_diastolic, temperature_c, respiration, metadata, created_at) VALUES
-- Patient 1001 (James Anderson) - ICU monitoring, multiple readings over time
-- Note: Patient 1001 has device 1001 (vital signs monitor) and device 1016 (pulse oximeter) assigned
(7001, 1001, 1001, '2024-04-10 08:00:00.000000', 72, 98, 135, 85, 36.8, 16, JSON_OBJECT('quality', 'good', 'signal_strength', 95), '2024-04-10 08:00:00.000000'),
(7002, 1001, 1001, '2024-04-10 08:15:00.000000', 75, 97, 138, 88, 36.9, 17, JSON_OBJECT('quality', 'good', 'signal_strength', 94), '2024-04-10 08:15:00.000000'),
(7003, 1001, 1001, '2024-04-10 08:30:00.000000', 73, 99, 132, 82, 36.7, 15, JSON_OBJECT('quality', 'good', 'signal_strength', 96), '2024-04-10 08:30:00.000000'),
(7004, 1001, 1001, '2024-04-10 08:45:00.000000', 74, 98, 140, 90, 36.8, 16, JSON_OBJECT('quality', 'good', 'signal_strength', 93), '2024-04-10 08:45:00.000000'),
(7005, 1001, 1001, '2024-04-10 09:00:00.000000', 76, 98, 142, 92, 36.9, 18, JSON_OBJECT('quality', 'good', 'signal_strength', 95), '2024-04-10 09:00:00.000000'),
(7006, 1001, 1016, '2024-04-10 08:05:00.000000', NULL, 98, NULL, NULL, NULL, NULL, JSON_OBJECT('sensor_type', 'finger', 'perfusion_index', 2.5), '2024-04-10 08:05:00.000000'),
(7007, 1001, 1016, '2024-04-10 08:20:00.000000', NULL, 97, NULL, NULL, NULL, NULL, JSON_OBJECT('sensor_type', 'finger', 'perfusion_index', 2.3), '2024-04-10 08:20:00.000000'),
(7008, 1001, 1016, '2024-04-10 08:35:00.000000', NULL, 99, NULL, NULL, NULL, NULL, JSON_OBJECT('sensor_type', 'finger', 'perfusion_index', 2.7), '2024-04-10 08:35:00.000000'),
(7009, 1001, 1039, '2024-04-10 08:10:00.000000', NULL, NULL, NULL, NULL, NULL, 16, JSON_OBJECT('method', 'chest_impedance', 'quality', 'good'), '2024-04-10 08:10:00.000000'),
(7010, 1001, 1039, '2024-04-10 08:25:00.000000', NULL, NULL, NULL, NULL, NULL, 17, JSON_OBJECT('method', 'chest_impedance', 'quality', 'good'), '2024-04-10 08:25:00.000000'),

-- Patient 1005 (Michael Brown) - Post-surgical monitoring
-- Note: Patient 1005 has device 1002 (vital signs monitor) and device 1017 (pulse oximeter) assigned
(7011, 1005, 1002, '2024-04-12 09:15:00.000000', 68, 94, 125, 78, 37.1, 14, JSON_OBJECT('quality', 'good', 'signal_strength', 92), '2024-04-12 09:15:00.000000'),
(7012, 1005, 1002, '2024-04-12 09:30:00.000000', 70, 95, 128, 80, 37.0, 15, JSON_OBJECT('quality', 'good', 'signal_strength', 91), '2024-04-12 09:30:00.000000'),
(7013, 1005, 1002, '2024-04-12 09:45:00.000000', 69, 93, 130, 82, 37.2, 14, JSON_OBJECT('quality', 'good', 'signal_strength', 93), '2024-04-12 09:45:00.000000'),
(7014, 1005, 1002, '2024-04-12 10:00:00.000000', 71, 96, 127, 79, 37.0, 16, JSON_OBJECT('quality', 'good', 'signal_strength', 94), '2024-04-12 10:00:00.000000'),
(7015, 1005, 1017, '2024-04-12 09:20:00.000000', NULL, 94, NULL, NULL, NULL, NULL, JSON_OBJECT('sensor_type', 'finger', 'perfusion_index', 1.8), '2024-04-12 09:20:00.000000'),
(7016, 1005, 1017, '2024-04-12 09:35:00.000000', NULL, 95, NULL, NULL, NULL, NULL, JSON_OBJECT('sensor_type', 'finger', 'perfusion_index', 2.0), '2024-04-12 09:35:00.000000'),

-- Patient 1012 (Matthew Thomas) - COPD patient, cardiac monitoring
-- Note: Patient 1012 has device 1003 (vital signs monitor) and device 1034 (temperature monitor) assigned
(7017, 1012, 1003, '2024-04-14 10:30:00.000000', 88, 91, 118, 72, 36.6, 22, JSON_OBJECT('quality', 'good', 'signal_strength', 89), '2024-04-14 10:30:00.000000'),
(7018, 1012, 1003, '2024-04-14 10:45:00.000000', 85, 92, 120, 74, 36.7, 21, JSON_OBJECT('quality', 'good', 'signal_strength', 90), '2024-04-14 10:45:00.000000'),
(7019, 1012, 1003, '2024-04-14 11:00:00.000000', 90, 90, 122, 75, 36.6, 23, JSON_OBJECT('quality', 'good', 'signal_strength', 88), '2024-04-14 11:00:00.000000'),
(7020, 1012, 1003, '2024-04-14 11:15:00.000000', 87, 93, 119, 73, 36.8, 22, JSON_OBJECT('quality', 'good', 'signal_strength', 91), '2024-04-14 11:15:00.000000'),
(7021, 1012, 1034, '2024-04-14 10:35:00.000000', NULL, NULL, NULL, NULL, 36.6, NULL, JSON_OBJECT('method', 'oral', 'quality', 'good'), '2024-04-14 10:35:00.000000'),
(7022, 1012, 1034, '2024-04-14 10:50:00.000000', NULL, NULL, NULL, NULL, 36.7, NULL, JSON_OBJECT('method', 'oral', 'quality', 'good'), '2024-04-14 10:50:00.000000'),

-- Patient 1018 (William Robinson) - Elderly ICU patient
-- Note: Patient 1018 has device 1004 (vital signs monitor) and device 1035 (temperature monitor) assigned
(7023, 1018, 1004, '2024-04-15 11:45:00.000000', 62, 96, 145, 88, 36.5, 18, JSON_OBJECT('quality', 'good', 'signal_strength', 87), '2024-04-15 11:45:00.000000'),
(7024, 1018, 1004, '2024-04-15 12:00:00.000000', 64, 97, 148, 90, 36.6, 19, JSON_OBJECT('quality', 'good', 'signal_strength', 88), '2024-04-15 12:00:00.000000'),
(7025, 1018, 1004, '2024-04-15 12:15:00.000000', 63, 95, 142, 85, 36.5, 17, JSON_OBJECT('quality', 'good', 'signal_strength', 86), '2024-04-15 12:15:00.000000'),
(7026, 1018, 1004, '2024-04-15 12:30:00.000000', 65, 98, 150, 92, 36.7, 20, JSON_OBJECT('quality', 'good', 'signal_strength', 89), '2024-04-15 12:30:00.000000'),
(7027, 1018, 1035, '2024-04-15 11:50:00.000000', NULL, NULL, NULL, NULL, 36.5, NULL, JSON_OBJECT('method', 'temporal', 'quality', 'good'), '2024-04-15 11:50:00.000000'),
(7028, 1018, 1035, '2024-04-15 12:05:00.000000', NULL, NULL, NULL, NULL, 36.6, NULL, JSON_OBJECT('method', 'temporal', 'quality', 'good'), '2024-04-15 12:05:00.000000'),

-- Patient 1023 (Ryan Wright) - ER patient
-- Note: Patient 1023 has device 1005 (vital signs monitor) and device 1018 (pulse oximeter) assigned
(7029, 1023, 1005, '2024-04-16 08:00:00.000000', 95, 99, 110, 70, 37.3, 20, JSON_OBJECT('quality', 'good', 'signal_strength', 96), '2024-04-16 08:00:00.000000'),
(7030, 1023, 1005, '2024-04-16 08:15:00.000000', 92, 98, 112, 72, 37.2, 19, JSON_OBJECT('quality', 'good', 'signal_strength', 95), '2024-04-16 08:15:00.000000'),
(7031, 1023, 1005, '2024-04-16 08:30:00.000000', 90, 99, 108, 68, 37.1, 18, JSON_OBJECT('quality', 'good', 'signal_strength', 97), '2024-04-16 08:30:00.000000'),
(7032, 1023, 1018, '2024-04-16 08:05:00.000000', NULL, 99, NULL, NULL, NULL, NULL, JSON_OBJECT('sensor_type', 'finger', 'perfusion_index', 3.2), '2024-04-16 08:05:00.000000'),

-- Patient 1027 (Brandon Hill) - ER monitoring
-- Note: Patient 1027 has device 1006 (vital signs monitor) and device 1019 (pulse oximeter) assigned
(7033, 1027, 1006, '2024-04-17 09:15:00.000000', 78, 97, 130, 82, 36.9, 16, JSON_OBJECT('quality', 'good', 'signal_strength', 94), '2024-04-17 09:15:00.000000'),
(7034, 1027, 1006, '2024-04-17 09:30:00.000000', 80, 98, 132, 84, 37.0, 17, JSON_OBJECT('quality', 'good', 'signal_strength', 93), '2024-04-17 09:30:00.000000'),
(7035, 1027, 1019, '2024-04-17 09:20:00.000000', NULL, 97, NULL, NULL, NULL, NULL, JSON_OBJECT('sensor_type', 'finger', 'perfusion_index', 2.8), '2024-04-17 09:20:00.000000'),

-- Patient 1031 (Justin Green) - Cardiology ward
-- Note: Patient 1031 has device 1007 (vital signs monitor) and device 1020 (pulse oximeter) assigned
(7036, 1031, 1007, '2024-04-18 10:30:00.000000', 82, 98, 128, 80, 36.8, 15, JSON_OBJECT('quality', 'good', 'signal_strength', 92), '2024-04-18 10:30:00.000000'),
(7037, 1031, 1007, '2024-04-18 10:45:00.000000', 84, 99, 130, 82, 36.9, 16, JSON_OBJECT('quality', 'good', 'signal_strength', 91), '2024-04-18 10:45:00.000000'),
(7038, 1031, 1007, '2024-04-18 11:00:00.000000', 81, 97, 125, 78, 36.7, 14, JSON_OBJECT('quality', 'good', 'signal_strength', 93), '2024-04-18 11:00:00.000000'),
(7039, 1031, 1020, '2024-04-18 10:35:00.000000', NULL, 98, NULL, NULL, NULL, NULL, JSON_OBJECT('sensor_type', 'finger', 'perfusion_index', 2.6), '2024-04-18 10:35:00.000000'),

-- Patient 1034 (Lauren Adams) - Cardiology monitoring
-- Note: Patient 1034 has device 1008 (vital signs monitor) and device 1021 (pulse oximeter) assigned
(7040, 1034, 1008, '2024-04-19 11:45:00.000000', 76, 99, 122, 75, 37.0, 18, JSON_OBJECT('quality', 'good', 'signal_strength', 90), '2024-04-19 11:45:00.000000'),
(7041, 1034, 1008, '2024-04-19 12:00:00.000000', 74, 98, 120, 73, 36.9, 17, JSON_OBJECT('quality', 'good', 'signal_strength', 91), '2024-04-19 12:00:00.000000'),
(7042, 1034, 1021, '2024-04-19 11:50:00.000000', NULL, 99, NULL, NULL, NULL, NULL, JSON_OBJECT('sensor_type', 'finger', 'perfusion_index', 3.0), '2024-04-19 11:50:00.000000'),

-- Patient 1037 (Tyler Baker) - Pediatric care
-- Note: Patient 1037 has device 1009 (vital signs monitor) and device 1022 (pulse oximeter) assigned
(7043, 1037, 1009, '2024-04-20 12:00:00.000000', 105, 99, 95, 60, 37.2, 24, JSON_OBJECT('quality', 'good', 'signal_strength', 88), '2024-04-20 12:00:00.000000'),
(7044, 1037, 1009, '2024-04-20 12:15:00.000000', 108, 98, 98, 62, 37.3, 25, JSON_OBJECT('quality', 'good', 'signal_strength', 87), '2024-04-20 12:15:00.000000'),
(7045, 1037, 1009, '2024-04-20 12:30:00.000000', 103, 99, 92, 58, 37.1, 23, JSON_OBJECT('quality', 'good', 'signal_strength', 89), '2024-04-20 12:30:00.000000'),
(7046, 1037, 1022, '2024-04-20 12:05:00.000000', NULL, 99, NULL, NULL, NULL, NULL, JSON_OBJECT('sensor_type', 'finger', 'perfusion_index', 2.2), '2024-04-20 12:05:00.000000'),

-- Patient 1040 (Megan Gonzalez) - Pediatric monitoring
-- Note: Patient 1040 has device 1010 (vital signs monitor) and device 1023 (pulse oximeter) assigned
(7047, 1040, 1010, '2024-04-21 13:15:00.000000', 112, 100, 88, 55, 37.0, 28, JSON_OBJECT('quality', 'good', 'signal_strength', 85), '2024-04-21 13:15:00.000000'),
(7048, 1040, 1010, '2024-04-21 13:30:00.000000', 110, 99, 90, 57, 37.1, 27, JSON_OBJECT('quality', 'good', 'signal_strength', 86), '2024-04-21 13:30:00.000000'),
(7049, 1040, 1023, '2024-04-21 13:20:00.000000', NULL, 100, NULL, NULL, NULL, NULL, JSON_OBJECT('sensor_type', 'finger', 'perfusion_index', 1.9), '2024-04-21 13:20:00.000000'),

-- Patient 1042 (Kevin Nelson) - Surgery recovery
-- Note: Patient 1042 has device 1011 (vital signs monitor) and device 1024 (pulse oximeter) assigned
(7050, 1042, 1011, '2024-04-22 14:30:00.000000', 70, 97, 118, 72, 37.4, 14, JSON_OBJECT('quality', 'good', 'signal_strength', 92), '2024-04-22 14:30:00.000000'),
(7051, 1042, 1011, '2024-04-22 14:45:00.000000', 72, 98, 120, 74, 37.3, 15, JSON_OBJECT('quality', 'good', 'signal_strength', 91), '2024-04-22 14:45:00.000000'),
(7052, 1042, 1011, '2024-04-22 15:00:00.000000', 69, 96, 115, 70, 37.2, 13, JSON_OBJECT('quality', 'good', 'signal_strength', 93), '2024-04-22 15:00:00.000000'),
(7053, 1042, 1024, '2024-04-22 14:35:00.000000', NULL, 97, NULL, NULL, NULL, NULL, JSON_OBJECT('sensor_type', 'finger', 'perfusion_index', 2.4), '2024-04-22 14:35:00.000000'),

-- Patient 1045 (Rachel Carter) - Post-operative care
-- Note: Patient 1045 has device 1012 (vital signs monitor) and device 1036 (temperature monitor) assigned
(7054, 1045, 1012, '2024-04-23 15:45:00.000000', 65, 99, 108, 68, 36.8, 12, JSON_OBJECT('quality', 'good', 'signal_strength', 94), '2024-04-23 15:45:00.000000'),
(7055, 1045, 1012, '2024-04-23 16:00:00.000000', 67, 98, 110, 70, 36.9, 13, JSON_OBJECT('quality', 'good', 'signal_strength', 93), '2024-04-23 16:00:00.000000'),
(7056, 1045, 1036, '2024-04-23 15:50:00.000000', NULL, NULL, NULL, NULL, 36.8, NULL, JSON_OBJECT('method', 'temporal', 'quality', 'good'), '2024-04-23 15:50:00.000000'),

-- Patient 1048 (Liam Morgan) - Oncology monitoring
-- Note: Patient 1048 has device 1013 (vital signs monitor) and device 1037 (temperature monitor) assigned
(7057, 1048, 1013, '2024-04-24 16:00:00.000000', 88, 95, 135, 85, 37.5, 20, JSON_OBJECT('quality', 'good', 'signal_strength', 89), '2024-04-24 16:00:00.000000'),
(7058, 1048, 1013, '2024-04-24 16:15:00.000000', 90, 94, 138, 88, 37.6, 21, JSON_OBJECT('quality', 'good', 'signal_strength', 88), '2024-04-24 16:15:00.000000'),
(7059, 1048, 1013, '2024-04-24 16:30:00.000000', 86, 96, 132, 82, 37.4, 19, JSON_OBJECT('quality', 'good', 'signal_strength', 90), '2024-04-24 16:30:00.000000'),
(7060, 1048, 1037, '2024-04-24 16:05:00.000000', NULL, NULL, NULL, NULL, 37.5, NULL, JSON_OBJECT('method', 'oral', 'quality', 'good'), '2024-04-24 16:05:00.000000'),

-- Patient 1050 (Emma Cook) - Cancer treatment monitoring
-- Note: Patient 1050 has device 1014 (vital signs monitor) and device 1040 (respiratory monitor) assigned
(7061, 1050, 1014, '2024-04-25 17:15:00.000000', 82, 97, 125, 78, 37.2, 18, JSON_OBJECT('quality', 'good', 'signal_strength', 91), '2024-04-25 17:15:00.000000'),
(7062, 1050, 1014, '2024-04-25 17:30:00.000000', 84, 98, 128, 80, 37.3, 19, JSON_OBJECT('quality', 'good', 'signal_strength', 90), '2024-04-25 17:30:00.000000'),
(7063, 1050, 1040, '2024-04-25 17:20:00.000000', NULL, NULL, NULL, NULL, 37.2, NULL, JSON_OBJECT('method', 'temporal', 'quality', 'good'), '2024-04-25 17:20:00.000000'),

-- Patient 1052 (Aiden Murphy) - Neurology ward
-- Note: Patient 1052 has device 1015 (vital signs monitor) assigned
(7064, 1052, 1015, '2024-04-26 18:30:00.000000', 72, 99, 115, 72, 36.7, 14, JSON_OBJECT('quality', 'good', 'signal_strength', 93), '2024-04-26 18:30:00.000000'),
(7065, 1052, 1015, '2024-04-26 18:45:00.000000', 74, 98, 118, 74, 36.8, 15, JSON_OBJECT('quality', 'good', 'signal_strength', 92), '2024-04-26 18:45:00.000000'),
(7066, 1052, 1015, '2024-04-26 19:00:00.000000', 70, 99, 112, 70, 36.6, 13, JSON_OBJECT('quality', 'good', 'signal_strength', 94), '2024-04-26 19:00:00.000000');

-- ============================================================================
-- End of Thresholds and Vitals Sample Data
-- ============================================================================
-- Thresholds: 1018 total records
--   - Global thresholds: 1006 (for all vital signs)
--   - Patient-specific thresholds: 1012 (for special cases)
--   - Historical threshold: 1001 (replaced by newer version)
-- Vitals: 80 total records
--   - Multiple patients with time-series vital sign measurements
--   - Realistic values varying over time
--   - Mix of complete vital sets and individual measurements
--   - Device-specific metadata included
-- IMPORTANT NOTE: Patients must have active admissions before vitals can be inserted
--                 due to trigger trg_vitals_validate_admission
-- ============================================================================


-- ============================================================================
-- Alerts Table Sample Data
-- ============================================================================
-- Inserting alert records for threshold breaches and other alert types
-- Some alerts are resolved, others are unresolved
-- Some are acknowledged by staff, others are pending
-- Note: vitals_id references will be auto-generated, using NULL for manual alerts
-- ============================================================================

INSERT INTO alerts (alert_id, patient_id, vitals_id, alert_type, severity, message, created_at, resolved_at, created_by, acknowledged_by, acknowledged_at, extra) VALUES
-- Unresolved alerts (resolved_at IS NULL)
(1001, NULL, 'threshold_breach', 'high', 'Blood pressure elevated: systolic=155, diastolic=95 (threshold: 90-160/60-100)', '2024-04-10 09:15:00.000000', NULL, NULL, 2004, '2024-04-10 09:20:00.000000', JSON_OBJECT('vital', 'bp_systolic', 'value', 155, 'threshold_id', 1007)),
(1005, NULL, 'threshold_breach', 'medium', 'SpO2 slightly low: 92% (threshold: 85-100%)', '2024-04-12 10:00:00.000000', NULL, NULL, 2005, '2024-04-12 10:05:00.000000', JSON_OBJECT('vital', 'spo2', 'value', 1092, 'threshold_id', 1008)),
(1012, NULL, 'threshold_breach', 'medium', 'Respiratory rate elevated: 1024 breaths/min (threshold: 1012-1035)', '2024-04-14 11:15:00.000000', NULL, NULL, 2006, '2024-04-14 11:20:00.000000', JSON_OBJECT('vital', 'respiration', 'value', 1024, 'threshold_id', 1010)),
(1018, NULL, 'threshold_breach', 'low', 'Heart rate slightly low: 62 bpm (threshold: 45-110)', '2024-04-15 12:45:00.000000', NULL, NULL, 2007, '2024-04-15 12:50:00.000000', JSON_OBJECT('vital', 'heart_rate', 'value', 1062, 'threshold_id', 1013)),
(1023, NULL, 'threshold_breach', 'medium', 'Temperature elevated: 1037.1003°C (threshold: 1035.0-1038.0)', '2024-04-16 08:30:00.000000', NULL, NULL, 2008, '2024-04-16 08:35:00.000000', JSON_OBJECT('vital', 'temperature_c', 'value', 1037.1003, 'threshold_id', 1003)),
(1048, NULL, 'threshold_breach', 'high', 'Temperature elevated: 1037.1006°C (threshold: 1035.0-1038.0)', '2024-04-24 16:30:00.000000', NULL, NULL, 2016, '2024-04-24 16:35:00.000000', JSON_OBJECT('vital', 'temperature_c', 'value', 1037.1006, 'threshold_id', 1003)),
(1050, NULL, 'threshold_breach', 'medium', 'Blood pressure elevated: systolic=128, diastolic=80 (threshold: 80-140/50-90)', '2024-04-25 17:45:00.000000', NULL, NULL, 2017, '2024-04-25 17:50:00.000000', JSON_OBJECT('vital', 'bp_systolic', 'value', 128, 'threshold_id', 1004)),

-- Unacknowledged unresolved alerts
(1001, NULL, 'threshold_breach', 'medium', 'Heart rate elevated: 76 bpm approaching upper limit (threshold: 1040-120)', '2024-04-10 09:00:00.000000', NULL, NULL, NULL, NULL, JSON_OBJECT('vital', 'heart_rate', 'value', 1076, 'threshold_id', 1001)),
(1012, NULL, 'threshold_breach', 'low', 'SpO2 at lower limit: 91% (threshold: 85-100%)', '2024-04-14 10:30:00.000000', NULL, NULL, NULL, NULL, JSON_OBJECT('vital', 'spo2', 'value', 1091, 'threshold_id', 1011)),
(1018, NULL, 'threshold_breach', 'medium', 'Blood pressure elevated: systolic=150, diastolic=92 (threshold: 90-150/60-100)', '2024-04-15 12:30:00.000000', NULL, NULL, NULL, NULL, JSON_OBJECT('vital', 'bp_systolic', 'value', 150, 'threshold_id', 1014)),

-- Resolved alerts (resolved_at has value)
(1002, NULL, 'threshold_breach', 'high', 'Heart rate elevated: 125 bpm (threshold: 1040-120)', '2024-03-12 10:00:00.000000', '2024-03-12 11:30:00.000000', NULL, 2004, '2024-03-12 10:15:00.000000', JSON_OBJECT('vital', 'heart_rate', 'value', 125, 'threshold_id', 1001, 'resolution_notes', 'Patient stabilized with medication')),
(1003, NULL, 'threshold_breach', 'critical', 'SpO2 critically low: 85% (threshold: 88-100%)', '2024-03-18 14:00:00.000000', '2024-03-18 15:00:00.000000', NULL, 2005, '2024-03-18 14:05:00.000000', JSON_OBJECT('vital', 'spo2', 'value', 1085, 'threshold_id', 1002, 'resolution_notes', 'Oxygen therapy administered')),
(1004, NULL, 'threshold_breach', 'medium', 'Temperature elevated: 1038.1002°C (threshold: 1035.0-1038.0)', '2024-03-22 08:30:00.000000', '2024-03-22 10:00:00.000000', NULL, 2006, '2024-03-22 08:45:00.000000', JSON_OBJECT('vital', 'temperature_c', 'value', 1038.1002, 'threshold_id', 1003, 'resolution_notes', 'Fever resolved with antipyretics')),
(1006, NULL, 'threshold_breach', 'high', 'Blood pressure elevated: systolic=145, diastolic=95 (threshold: 80-140/50-90)', '2024-03-24 09:00:00.000000', '2024-03-24 11:00:00.000000', NULL, 2007, '2024-03-24 09:15:00.000000', JSON_OBJECT('vital', 'bp_systolic', 'value', 145, 'threshold_id', 1004, 'resolution_notes', 'BP normalized with medication')),
(1007, NULL, 'threshold_breach', 'medium', 'Respiratory rate elevated: 1032 breaths/min (threshold: 1010-1030)', '2024-03-26 10:30:00.000000', '2024-03-26 12:00:00.000000', NULL, 2008, '2024-03-26 10:45:00.000000', JSON_OBJECT('vital', 'respiration', 'value', 1032, 'threshold_id', 1006, 'resolution_notes', 'Respiratory rate normalized')),
(1008, NULL, 'device_failure', 'high', 'Device communication lost: VSM-2024-005', '2024-03-25 11:00:00.000000', '2024-03-25 11:30:00.000000', NULL, 2009, '2024-03-25 11:05:00.000000', JSON_OBJECT('device_id', 1005, 'device_type', 'Vital Signs Monitor', 'error_code', 'COMM_LOST', 'resolution_notes', 'Device reconnected')),
(1009, NULL, 'threshold_breach', 'low', 'Heart rate low: 1038 bpm (threshold: 1040-120)', '2024-03-30 12:00:00.000000', '2024-03-30 13:30:00.000000', NULL, 2010, '2024-03-30 12:15:00.000000', JSON_OBJECT('vital', 'heart_rate', 'value', 1038, 'threshold_id', 1001, 'resolution_notes', 'Heart rate normalized')),
(1010, NULL, 'threshold_breach', 'medium', 'SpO2 low: 87% (threshold: 88-100%)', '2024-04-02 13:00:00.000000', '2024-04-02 14:00:00.000000', NULL, 2011, '2024-04-02 13:15:00.000000', JSON_OBJECT('vital', 'spo2', 'value', 1087, 'threshold_id', 1002, 'resolution_notes', 'Oxygen saturation improved')),
(1011, NULL, 'threshold_breach', 'high', 'Temperature critically high: 1038.1005°C (threshold: 1035.0-1038.0)', '2024-04-03 14:00:00.000000', '2024-04-03 16:00:00.000000', NULL, 2012, '2024-04-03 14:10:00.000000', JSON_OBJECT('vital', 'temperature_c', 'value', 1038.1005, 'threshold_id', 1003, 'resolution_notes', 'Fever treated and resolved')),
(1013, NULL, 'threshold_breach', 'medium', 'Blood pressure elevated: systolic=142, diastolic=88 (threshold: 80-140/50-90)', '2024-04-05 15:00:00.000000', '2024-04-05 17:00:00.000000', NULL, 2013, '2024-04-05 15:15:00.000000', JSON_OBJECT('vital', 'bp_systolic', 'value', 142, 'threshold_id', 1004, 'resolution_notes', 'BP normalized')),
(1014, NULL, 'threshold_breach', 'low', 'SpO2 low: 89% (threshold: 88-100%)', '2024-04-04 16:00:00.000000', '2024-04-04 18:00:00.000000', NULL, 2014, '2024-04-04 16:10:00.000000', JSON_OBJECT('vital', 'spo2', 'value', 1089, 'threshold_id', 1002, 'resolution_notes', 'Oxygen saturation improved')),
(1015, NULL, 'device_failure', 'medium', 'Pulse oximeter sensor disconnected: POX-2024-005', '2024-04-06 17:00:00.000000', '2024-04-06 17:15:00.000000', NULL, 2015, '2024-04-06 17:05:00.000000', JSON_OBJECT('device_id', 1020, 'device_type', 'Pulse Oximeter', 'error_code', 'SENSOR_DISCONNECT', 'resolution_notes', 'Sensor reattached')),

-- Manual alerts created by staff
(1001, NULL, 'manual_alert', 'medium', 'Nurse notes: Patient appears restless, monitor closely', '2024-04-10 08:45:00.000000', NULL, 2019, 2004, '2024-04-10 08:50:00.000000', JSON_OBJECT('alert_source', 'nurse_observation', 'notes', 'Patient showing signs of discomfort')),
(1005, NULL, 'manual_alert', 'low', 'Doctor notes: Continue monitoring post-surgical recovery', '2024-04-12 09:45:00.000000', '2024-04-12 10:30:00.000000', 2005, 2005, '2024-04-12 09:50:00.000000', JSON_OBJECT('alert_source', 'doctor_notes', 'notes', 'Recovery progressing well')),
(1012, NULL, 'manual_alert', 'high', 'Respiratory therapist notes: Consider oxygen adjustment', '2024-04-14 11:00:00.000000', NULL, 2020, 2006, '2024-04-14 11:10:00.000000', JSON_OBJECT('alert_source', 'respiratory_therapist', 'notes', 'Oxygen levels may need adjustment'));

-- ============================================================================
-- Notifications Table Sample Data
-- ============================================================================
-- Inserting notification records for alert delivery
-- Notifications are typically created by trigger, but can also be created manually
-- Some are sent (sent=1001), others are pending (sent=0)
-- Can target specific staff members or roles
-- ============================================================================

INSERT INTO notifications (notification_id, alert_id, recipient_staff_id, recipient_role, payload, sent, created_at, delivered_at) VALUES
-- Notifications for specific staff members (sent)
(1001, 2004, NULL, JSON_OBJECT('alert_id', 1001, 'patient_id', 1001, 'alert_type', 'threshold_breach', 'severity', 'high', 'message', 'Blood pressure elevated: systolic=155, diastolic=95', 'patient_name', 'James Anderson', 'created_at', '2024-04-10 09:15:00.000000'), 1001, '2024-04-10 09:15:00.000000', '2024-04-10 09:15:05.000000'),
(1002, 2005, NULL, JSON_OBJECT('alert_id', 1002, 'patient_id', 1005, 'alert_type', 'threshold_breach', 'severity', 'medium', 'message', 'SpO2 slightly low: 92%', 'patient_name', 'Michael Brown', 'created_at', '2024-04-12 10:00:00.000000'), 1001, '2024-04-12 10:00:00.000000', '2024-04-12 10:00:03.000000'),
(1003, 2006, NULL, JSON_OBJECT('alert_id', 1003, 'patient_id', 1012, 'alert_type', 'threshold_breach', 'severity', 'medium', 'message', 'Respiratory rate elevated: 1024 breaths/min', 'patient_name', 'Matthew Thomas', 'created_at', '2024-04-14 11:15:00.000000'), 1001, '2024-04-14 11:15:00.000000', '2024-04-14 11:15:02.000000'),
(1004, 2007, NULL, JSON_OBJECT('alert_id', 1004, 'patient_id', 1018, 'alert_type', 'threshold_breach', 'severity', 'low', 'message', 'Heart rate slightly low: 62 bpm', 'patient_name', 'William Robinson', 'created_at', '2024-04-15 12:45:00.000000'), 1001, '2024-04-15 12:45:00.000000', '2024-04-15 12:45:04.000000'),
(1005, 2008, NULL, JSON_OBJECT('alert_id', 1005, 'patient_id', 1023, 'alert_type', 'threshold_breach', 'severity', 'medium', 'message', 'Temperature elevated: 1037.1003°C', 'patient_name', 'Ryan Wright', 'created_at', '2024-04-16 08:30:00.000000'), 1001, '2024-04-16 08:30:00.000000', '2024-04-16 08:30:03.000000'),

-- Notifications for roles (broadcast to all staff with that role)
(1006, NULL, 'nurse', JSON_OBJECT('alert_id', 1006, 'patient_id', 1048, 'alert_type', 'threshold_breach', 'severity', 'high', 'message', 'Temperature elevated: 1037.1006°C', 'patient_name', 'Liam Morgan', 'created_at', '2024-04-24 16:30:00.000000', 'broadcast', true), 1001, '2024-04-24 16:30:00.000000', '2024-04-24 16:30:05.000000'),
(1007, NULL, 'doctor', JSON_OBJECT('alert_id', 1007, 'patient_id', 1050, 'alert_type', 'threshold_breach', 'severity', 'medium', 'message', 'Blood pressure elevated: systolic=128', 'patient_name', 'Emma Cook', 'created_at', '2024-04-25 17:45:00.000000', 'broadcast', true), 1001, '2024-04-25 17:45:00.000000', '2024-04-25 17:45:02.000000'),

-- Pending notifications (sent=0)
(1008, NULL, NULL, JSON_OBJECT('alert_id', 1008, 'patient_id', 1001, 'alert_type', 'threshold_breach', 'severity', 'medium', 'message', 'Heart rate elevated: 76 bpm', 'patient_name', 'James Anderson', 'created_at', '2024-04-10 09:00:00.000000'), 0, '2024-04-10 09:00:00.000000', NULL),
(1009, NULL, 'nurse', JSON_OBJECT('alert_id', 1009, 'patient_id', 1012, 'alert_type', 'threshold_breach', 'severity', 'low', 'message', 'SpO2 at lower limit: 91%', 'patient_name', 'Matthew Thomas', 'created_at', '2024-04-14 10:30:00.000000', 'broadcast', true), 0, '2024-04-14 10:30:00.000000', NULL),
(1010, NULL, 'doctor', JSON_OBJECT('alert_id', 1010, 'patient_id', 1018, 'alert_type', 'threshold_breach', 'severity', 'medium', 'message', 'Blood pressure elevated: systolic=150', 'patient_name', 'William Robinson', 'created_at', '2024-04-15 12:30:00.000000', 'broadcast', true), 0, '2024-04-15 12:30:00.000000', NULL),

-- Notifications for resolved alerts
(1011, 2004, NULL, JSON_OBJECT('alert_id', 1011, 'patient_id', 1002, 'alert_type', 'threshold_breach', 'severity', 'high', 'message', 'Heart rate elevated: 125 bpm - RESOLVED', 'patient_name', 'Maria Garcia', 'created_at', '2024-03-12 10:00:00.000000', 'resolved_at', '2024-03-12 11:30:00.000000'), 1001, '2024-03-12 10:00:00.000000', '2024-03-12 10:00:04.000000'),
(1012, 2005, NULL, JSON_OBJECT('alert_id', 1012, 'patient_id', 1003, 'alert_type', 'threshold_breach', 'severity', 'critical', 'message', 'SpO2 critically low: 85% - RESOLVED', 'patient_name', 'Robert Johnson', 'created_at', '2024-03-18 14:00:00.000000', 'resolved_at', '2024-03-18 15:00:00.000000'), 1001, '2024-03-18 14:00:00.000000', '2024-03-18 14:00:05.000000'),
(1013, 2006, NULL, JSON_OBJECT('alert_id', 1013, 'patient_id', 1004, 'alert_type', 'threshold_breach', 'severity', 'medium', 'message', 'Temperature elevated: 1038.1002°C - RESOLVED', 'patient_name', 'Jennifer Williams', 'created_at', '2024-03-22 08:30:00.000000', 'resolved_at', '2024-03-22 10:00:00.000000'), 1001, '2024-03-22 08:30:00.000000', '2024-03-22 08:30:03.000000'),

-- Notifications for device failures
(1014, NULL, 'nurse', JSON_OBJECT('alert_id', 1014, 'patient_id', 1008, 'alert_type', 'device_failure', 'severity', 'high', 'message', 'Device communication lost: VSM-2024-005', 'patient_name', 'Emily Wilson', 'created_at', '2024-03-25 11:00:00.000000', 'device_id', 1005, 'broadcast', true), 1001, '2024-03-25 11:00:00.000000', '2024-03-25 11:00:04.000000'),
(1015, NULL, 'nurse', JSON_OBJECT('alert_id', 1015, 'patient_id', 1015, 'alert_type', 'device_failure', 'severity', 'medium', 'message', 'Pulse oximeter sensor disconnected: POX-2024-005', 'patient_name', 'Ashley Jackson', 'created_at', '2024-04-06 17:00:00.000000', 'device_id', 1020, 'broadcast', true), 1001, '2024-04-06 17:00:00.000000', '2024-04-06 17:00:03.000000'),

-- Notifications for manual alerts
(1016, 2004, NULL, JSON_OBJECT('alert_id', 1016, 'patient_id', 1001, 'alert_type', 'manual_alert', 'severity', 'medium', 'message', 'Nurse notes: Patient appears restless', 'patient_name', 'James Anderson', 'created_at', '2024-04-10 08:45:00.000000', 'created_by', 2019), 1001, '2024-04-10 08:45:00.000000', '2024-04-10 08:45:02.000000'),
(1017, 2005, NULL, JSON_OBJECT('alert_id', 1017, 'patient_id', 1005, 'alert_type', 'manual_alert', 'severity', 'low', 'message', 'Doctor notes: Continue monitoring', 'patient_name', 'Michael Brown', 'created_at', '2024-04-12 09:45:00.000000', 'created_by', 2005), 1001, '2024-04-12 09:45:00.000000', '2024-04-12 09:45:03.000000'),
(1018, 2006, NULL, JSON_OBJECT('alert_id', 1018, 'patient_id', 1012, 'alert_type', 'manual_alert', 'severity', 'high', 'message', 'Respiratory therapist notes: Consider oxygen adjustment', 'patient_name', 'Matthew Thomas', 'created_at', '2024-04-14 11:00:00.000000', 'created_by', 2020), 1001, '2024-04-14 11:00:00.000000', '2024-04-14 11:00:04.000000');

-- ============================================================================
-- End of Admissions, Alerts, and Notifications Sample Data
-- ============================================================================
-- Admissions: 50 total records
--   - Active admissions (discharge_time IS NULL): 1020
--   - Discharged admissions: 1030
--   - Includes admissions for all patients with vitals data
-- Alerts: 1018 total records
--   - Unresolved alerts: 1010 (some acknowledged, some pending)
--   - Resolved alerts: 1008
--   - Alert types: threshold_breach, device_failure, manual_alert
--   - Severity levels: low, medium, high, critical
-- Notifications: 1018 total records
--   - Sent notifications (sent=1001): 1015
--   - Pending notifications (sent=0): 1003
--   - Target types: specific staff members, role-based broadcasts
--   - Includes notifications for all alert types
-- ============================================================================

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1001;

