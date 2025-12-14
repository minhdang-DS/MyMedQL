# MyMedQL Entity-Relationship Diagram (Chen Notation)

## Chen Notation ER Diagram

```
┌─────────────────────┐
│     PATIENTS        │
│  ┌───────────────┐  │
│  │  patient_id   │  │◄────┐
│  │  first_name   │  │     │
│  │  last_name    │  │     │
│  │  dob          │  │     │
│  │  gender       │  │     │
│  │  contact_info │  │     │
│  │  medical_     │  │     │
│  │    history    │  │     │
│  └───────────────┘  │     │
└─────────────────────┘     │
         │                   │
         │                   │
         │                   │
    ┌────▼────┐         ┌────▼────┐
    │  HAS    │         │ ASSIGNED│
    │         │         │    TO   │
    └────┬────┘         └────┬────┘
         │                   │
         │                   │
    ┌────▼──────────────┐    │
    │   ADMISSIONS      │    │
    │  ┌──────────────┐ │    │
    │  │ admission_id │ │    │
    │  │ admitted_at  │ │    │
    │  │ discharge_   │ │    │
    │  │   time       │ │    │
    │  │ status       │ │    │
    │  └──────────────┘ │    │
    └───────────────────┘    │
                              │
                              │
         ┌────────────────────┘
         │
         │
    ┌────▼─────────────────────┐
    │  DEVICE_ASSIGNMENTS      │
    │  ┌────────────────────┐  │
    │  │  assignment_id    │  │
    │  │  assigned_from    │  │
    │  │  assigned_to      │  │
    │  │  notes            │  │
    │  └────────────────────┘  │
    └───────────────────────────┘
         │
         │
    ┌────▼────┐
    │ ASSIGNS │
    └────┬────┘
         │
         │
┌────────▼────────┐
│      STAFF      │
│  ┌────────────┐ │
│  │  staff_id  │ │◄────┐
│  │  name      │ │     │
│  │  email     │ │     │
│  │  password_ │ │     │
│  │    hash    │ │     │
│  │  role      │ │     │
│  └────────────┘ │     │
└─────────────────┘     │
         │               │
         │               │
    ┌────▼────┐     ┌────▼────┐
    │ ADMITS  │     │ CREATES │
    └────┬────┘     └────┬────┘
         │               │
         │               │
         │          ┌────▼──────────┐
         │          │   THRESHOLDS  │
         │          │  ┌──────────┐ │
         │          │  │threshold_│ │
         │          │  │  id      │ │
         │          │  │ name     │ │
         │          │  │ min_value│ │
         │          │  │ max_value│ │
         │          │  │ unit     │ │
         │          │  │ effective│ │
         │          │  │  _from   │ │
         │          │  │ effective│ │
         │          │  │  _to     │ │
         │          │  └──────────┘ │
         │          └───────────────┘
         │
         │
    ┌────▼────┐
    │ ACKNOW- │
    │ LEDGES  │
    └────┬────┘
         │
         │
┌────────▼────────┐
│     ALERTS      │
│  ┌────────────┐ │
│  │  alert_id  │ │◄────┐
│  │  alert_    │ │     │
│  │    type    │ │     │
│  │  severity  │ │     │
│  │  message   │ │     │
│  │  created_  │ │     │
│  │    at      │ │     │
│  │  resolved_ │ │     │
│  │    at      │ │     │
│  │  vitals_id │ │     │
│  └────────────┘ │     │
└─────────────────┘     │
         │               │
         │               │
    ┌────▼────┐     ┌────▼────┐
    │ GENER-  │     │ RECEIVES│
    │  ATES   │     │         │
    └────┬────┘     └────┬────┘
         │               │
         │               │
┌────────▼────────┐     │
│  NOTIFICATIONS  │     │
│  ┌────────────┐ │     │
│  │notification│ │     │
│  │   _id      │ │     │
│  │ payload    │ │     │
│  │ sent       │ │     │
│  │ created_at │ │     │
│  │ delivered_ │ │     │
│  │   at       │ │     │
│  └────────────┘ │     │
└─────────────────┘     │
                        │
                        │
┌───────────────────────┘
│
│
┌────────▼────────┐
│    DEVICES      │
│  ┌────────────┐ │
│  │  device_id │ │
│  │  device_   │ │
│  │    type    │ │
│  │  serial_   │ │
│  │  number    │ │
│  │  metadata  │ │
│  └────────────┘ │
└─────────────────┘
         │
         │
    ┌────▼────┐
    │ RECORDS │
    └────┬────┘
         │
         │
┌────────▼────────┐
│     VITALS      │
│  ┌────────────┐ │
│  │  vitals_id │ │
│  │  ts        │ │
│  │  heart_    │ │
│  │    rate    │ │
│  │  spo2      │ │
│  │  bp_       │ │
│  │  systolic  │ │
│  │  bp_       │ │
│  │  diastolic │ │
│  │  temper-   │ │
│  │    ature_c │ │
│  │  respira-  │ │
│  │    tion    │ │
│  │  metadata  │ │
│  └────────────┘ │
└─────────────────┘
         │
         │
    ┌────▼────┐
    │TRIGGERS │
    └────┬────┘
         │
         │
    (back to ALERTS)
```

## Relationship Details (Chen Notation)

### Entity: PATIENTS
**Attributes:**
- patient_id (Primary Key)
- first_name
- last_name
- dob
- gender
- contact_info
- medical_history
- created_at
- updated_at

**Relationships:**
- HAS → ADMISSIONS (1:N)
- ASSIGNED TO → DEVICE_ASSIGNMENTS (1:N)
- HAS → THRESHOLDS (0..1:N) [optional - NULL for global]
- HAS → VITALS (1:N) [logical, no FK]
- HAS → ALERTS (1:N)

---

### Entity: STAFF
**Attributes:**
- staff_id (Primary Key)
- name
- email (Unique)
- password_hash
- role
- metadata
- created_at
- updated_at

**Relationships:**
- ADMITS → ADMISSIONS (1:N)
- ASSIGNS → DEVICE_ASSIGNMENTS (1:N)
- CREATES → THRESHOLDS (1:N)
- CREATES → ALERTS (1:N)
- ACKNOWLEDGES → ALERTS (1:N)
- RECEIVES → NOTIFICATIONS (1:N)

---

### Entity: DEVICES
**Attributes:**
- device_id (Primary Key)
- device_type
- serial_number (Unique)
- metadata
- created_at
- updated_at

**Relationships:**
- ASSIGNED → DEVICE_ASSIGNMENTS (1:N)
- RECORDS → VITALS (1:N) [logical, no FK]

---

### Entity: ADMISSIONS
**Attributes:**
- admission_id (Primary Key)
- patient_id (Foreign Key)
- admitted_by (Foreign Key)
- admitted_at
- discharge_time
- status
- discharge_notes
- created_at
- updated_at

**Relationships:**
- HAS ← PATIENTS (N:1)
- ADMITS ← STAFF (N:1)

---

### Entity: DEVICE_ASSIGNMENTS
**Attributes:**
- assignment_id (Primary Key)
- device_id (Foreign Key)
- patient_id (Foreign Key)
- assigned_by (Foreign Key)
- assigned_from
- assigned_to
- notes
- created_at

**Relationships:**
- ASSIGNED TO ← PATIENTS (N:1)
- ASSIGNED ← DEVICES (N:1)
- ASSIGNS ← STAFF (N:1)

---

### Entity: THRESHOLDS
**Attributes:**
- threshold_id (Primary Key)
- name
- min_value
- max_value
- unit
- patient_id (Foreign Key, nullable)
- created_by (Foreign Key)
- effective_from
- effective_to
- notes
- created_at

**Relationships:**
- HAS ← PATIENTS (N:0..1) [optional - NULL = global]
- CREATES ← STAFF (N:1)

---

### Entity: VITALS
**Attributes:**
- vitals_id (Primary Key)
- ts (Primary Key, partition key)
- patient_id (no FK - partitioned table)
- device_id (no FK - partitioned table)
- heart_rate
- spo2
- bp_systolic
- bp_diastolic
- temperature_c
- respiration
- metadata
- created_at

**Relationships:**
- HAS ← PATIENTS (N:1) [logical, validated by trigger]
- RECORDS ← DEVICES (N:1) [logical, validated by app]
- TRIGGERS → ALERTS (1:N) [logical, set by trigger]

**Note:** Partitioned table - no foreign keys allowed in MySQL

---

### Entity: ALERTS
**Attributes:**
- alert_id (Primary Key)
- patient_id (Foreign Key)
- vitals_id (no FK - vitals is partitioned)
- created_by (Foreign Key, nullable)
- acknowledged_by (Foreign Key, nullable)
- alert_type
- severity
- message
- created_at
- resolved_at
- acknowledged_at
- extra

**Relationships:**
- HAS ← PATIENTS (N:1)
- TRIGGERS ← VITALS (N:1) [logical]
- CREATES ← STAFF (N:1)
- ACKNOWLEDGES ← STAFF (N:1)
- GENERATES → NOTIFICATIONS (1:N)

---

### Entity: NOTIFICATIONS
**Attributes:**
- notification_id (Primary Key)
- alert_id (Foreign Key)
- recipient_staff_id (Foreign Key, nullable)
- recipient_role (nullable)
- payload
- sent
- created_at
- delivered_at

**Relationships:**
- GENERATES ← ALERTS (N:1)
- RECEIVES ← STAFF (N:1)

---

## Cardinality Summary

| Relationship | Entity 1 | Cardinality | Entity 2 | Notes |
|-------------|----------|-------------|----------|-------|
| HAS | PATIENTS | 1 | ADMISSIONS | N |
| ADMITS | STAFF | 1 | ADMISSIONS | N |
| ASSIGNED TO | PATIENTS | 1 | DEVICE_ASSIGNMENTS | N |
| ASSIGNED | DEVICES | 1 | DEVICE_ASSIGNMENTS | N |
| ASSIGNS | STAFF | 1 | DEVICE_ASSIGNMENTS | N |
| HAS | PATIENTS | 0..1 | THRESHOLDS | N (NULL = global) |
| CREATES | STAFF | 1 | THRESHOLDS | N |
| HAS | PATIENTS | 1 | VITALS | N (logical, no FK) |
| RECORDS | DEVICES | 1 | VITALS | N (logical, no FK) |
| TRIGGERS | VITALS | 1 | ALERTS | N (logical) |
| HAS | PATIENTS | 1 | ALERTS | N |
| CREATES | STAFF | 1 | ALERTS | N |
| ACKNOWLEDGES | STAFF | 1 | ALERTS | N |
| GENERATES | ALERTS | 1 | NOTIFICATIONS | N |
| RECEIVES | STAFF | 1 | NOTIFICATIONS | N |

## Legend

- **Rectangle** = Entity
- **Oval** = Attribute
- **Diamond** = Relationship
- **Single line** = Partial participation (optional)
- **Double line** = Total participation (mandatory)
- **1** = One
- **N** = Many
- **0..1** = Zero or One (optional)

