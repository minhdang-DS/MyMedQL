# MyMedQL Entity-Relationship Diagram

## Text-Based ER Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PATIENTS                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK │ patient_id          │ BIGINT UNSIGNED                                   │
│    │ first_name          │ VARCHAR(100)                                      │
│    │ last_name           │ VARCHAR(100)                                      │
│    │ dob                 │ DATE                                              │
│    │ gender              │ ENUM('male','female','other','unknown')           │
│    │ contact_info        │ JSON                                              │
│    │ medical_history     │ VARBINARY(8192) [encrypted]                        │
│    │ created_at          │ TIMESTAMP(6)                                      │
│    │ updated_at          │ TIMESTAMP(6)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ 1
         │
         │ N
         ├─────────────────────────────────────────────────────────────┐
         │                                                               │
         │                                                               ▼
         │                                                      ┌─────────────────┐
         │                                                      │   ADMISSIONS    │
         │                                                      ├─────────────────┤
         │                                                      │ PK │ admission_id│
         │                                                      │ FK │ patient_id  │
         │                                                      │ FK │ admitted_by │
         │                                                      │    │ admitted_at │
         │                                                      │    │ discharge_  │
         │                                                      │    │   time      │
         │                                                      │    │ status      │
         │                                                      │    │ discharge_  │
         │                                                      │    │   notes     │
         │                                                      └─────────────────┘
         │                                                               │
         │                                                               │
         │                                                               │ 1
         │                                                               │
         │                                                               │ N
         │                                                               │
         │                                                               │
         │                                                               ▼
         │                                                      ┌─────────────────┐
         │                                                      │     STAFF       │
         │                                                      ├─────────────────┤
         │                                                      │ PK │ staff_id    │
         │                                                      │    │ name        │
         │                                                      │    │ email       │
         │                                                      │    │ password_   │
         │                                                      │    │   hash      │
         │                                                      │    │ role        │
         │                                                      │    │ metadata    │
         │                                                      └─────────────────┘
         │                                                               │
         │                                                               │
         │                                                               │ 1
         │                                                               │
         │                                                               │ N
         │                                                               │
         │                                                               │
         │                                                               ▼
         │                                                      ┌─────────────────┐
         │                                                      │  THRESHOLDS     │
         │                                                      ├─────────────────┤
         │                                                      │ PK │ threshold_id│
         │                                                      │ FK │ patient_id  │
         │                                                      │ FK │ created_by  │
         │                                                      │    │ name        │
         │                                                      │    │ min_value   │
         │                                                      │    │ max_value   │
         │                                                      │    │ unit        │
         │                                                      │    │ effective_  │
         │                                                      │    │   from      │
         │                                                      │    │ effective_to│
         │                                                      └─────────────────┘
         │
         │ 1
         │
         │ N
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEVICE_ASSIGNMENTS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK │ assignment_id      │ BIGINT UNSIGNED                                   │
│ FK │ device_id          │ INT UNSIGNED                                      │
│ FK │ patient_id         │ BIGINT UNSIGNED                                   │
│ FK │ assigned_by        │ INT UNSIGNED                                      │
│    │ assigned_from      │ DATETIME(6)                                       │
│    │ assigned_to        │ DATETIME(6)                                       │
│    │ notes              │ VARCHAR(512)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ FK
         │
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DEVICES                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK │ device_id          │ INT UNSIGNED                                      │
│    │ device_type        │ VARCHAR(100)                                      │
│    │ serial_number      │ VARCHAR(128) [UNIQUE]                             │
│    │ metadata           │ JSON                                              │
│    │ created_at         │ TIMESTAMP(6)                                      │
│    │ updated_at         │ TIMESTAMP(6)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ (logical relationship, no FK due to partitioning)
         │
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              VITALS                                           │
│                    [PARTITIONED BY MONTH]                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK │ vitals_id          │ BIGINT UNSIGNED                                    │
│ PK │ ts                 │ DATETIME(6)                                       │
│    │ patient_id         │ BIGINT UNSIGNED [no FK]                           │
│    │ device_id           │ INT UNSIGNED [no FK]                              │
│    │ heart_rate          │ INT                                               │
│    │ spo2                │ INT                                               │
│    │ bp_systolic         │ INT                                               │
│    │ bp_diastolic        │ INT                                               │
│    │ temperature_c       │ DECIMAL(4,2)                                      │
│    │ respiration         │ INT                                               │
│    │ metadata            │ JSON                                              │
│    │ created_at          │ TIMESTAMP(6)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ (logical relationship, no FK due to partitioning)
         │
         │
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ALERTS                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK │ alert_id           │ BIGINT UNSIGNED                                   │
│ FK │ patient_id         │ BIGINT UNSIGNED                                   │
│    │ vitals_id          │ BIGINT UNSIGNED [no FK - vitals partitioned]      │
│ FK │ created_by         │ INT UNSIGNED                                       │
│ FK │ acknowledged_by    │ INT UNSIGNED                                       │
│    │ alert_type         │ VARCHAR(64)                                        │
│    │ severity           │ ENUM('low','medium','high','critical')             │
│    │ message            │ TEXT                                               │
│    │ created_at         │ DATETIME(6)                                        │
│    │ resolved_at        │ DATETIME(6)                                        │
│    │ acknowledged_at    │ DATETIME(6)                                        │
│    │ extra              │ JSON                                               │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │ 1
         │
         │ N
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NOTIFICATIONS                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK │ notification_id    │ BIGINT UNSIGNED                                   │
│ FK │ alert_id           │ BIGINT UNSIGNED                                   │
│ FK │ recipient_staff_id │ INT UNSIGNED                                       │
│    │ recipient_role     │ ENUM('admin','doctor','nurse','viewer')           │
│    │ payload            │ JSON                                               │
│    │ sent               │ TINYINT(1)                                          │
│    │ created_at         │ DATETIME(6)                                         │
│    │ delivered_at       │ DATETIME(6)                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Relationship Summary

### One-to-Many Relationships (with Foreign Keys):

1. **patients** (1) ──< (N) **admissions**
   - `admissions.patient_id` → `patients.patient_id`

2. **staff** (1) ──< (N) **admissions** (admitted_by)
   - `admissions.admitted_by` → `staff.staff_id`

3. **patients** (1) ──< (N) **device_assignments**
   - `device_assignments.patient_id` → `patients.patient_id`

4. **devices** (1) ──< (N) **device_assignments**
   - `device_assignments.device_id` → `devices.device_id`

5. **staff** (1) ──< (N) **device_assignments** (assigned_by)
   - `device_assignments.assigned_by` → `staff.staff_id`

6. **patients** (0..1) ──< (N) **thresholds** (patient-specific, NULL = global)
   - `thresholds.patient_id` → `patients.patient_id` (nullable)

7. **staff** (1) ──< (N) **thresholds** (created_by)
   - `thresholds.created_by` → `staff.staff_id`

8. **patients** (1) ──< (N) **alerts**
   - `alerts.patient_id` → `patients.patient_id`

9. **staff** (1) ──< (N) **alerts** (created_by)
   - `alerts.created_by` → `staff.staff_id`

10. **staff** (1) ──< (N) **alerts** (acknowledged_by)
    - `alerts.acknowledged_by` → `staff.staff_id`

11. **alerts** (1) ──< (N) **notifications**
    - `notifications.alert_id` → `alerts.alert_id`

12. **staff** (1) ──< (N) **notifications** (recipient)
    - `notifications.recipient_staff_id` → `staff.staff_id`

### Logical Relationships (No Foreign Keys - Due to Partitioning):

13. **patients** (1) ──< (N) **vitals**
    - `vitals.patient_id` → `patients.patient_id` (validated by trigger)

14. **devices** (1) ──< (N) **vitals**
    - `vitals.device_id` → `devices.device_id` (validated at application level)

15. **vitals** (1) ──< (N) **alerts**
    - `alerts.vitals_id` → `vitals.vitals_id` (set by trigger)

## Key Constraints

- **Primary Keys**: All tables have auto-increment primary keys
- **Unique Constraints**: 
  - `staff.email` (UNIQUE)
  - `devices.serial_number` (UNIQUE)
- **Foreign Key Constraints**: 12 explicit FKs (vitals relationships handled via triggers/app logic)
- **Partitioning**: `vitals` table partitioned by month (prevents FKs on this table)
- **Indexes**: Comprehensive indexing on foreign keys and frequently queried columns

## Notes

- The `vitals` table cannot have foreign keys due to MySQL's limitation with partitioned tables
- Referential integrity for vitals is maintained through:
  - Trigger `trg_vitals_validate_admission` (ensures patient has active admission)
  - Application-level validation for patient_id and device_id
- The `thresholds` table supports both global (patient_id = NULL) and patient-specific thresholds
- The `device_assignments` table tracks historical assignments with `assigned_to` timestamp

