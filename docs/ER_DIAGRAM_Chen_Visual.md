# MyMedQL ER Diagram - Chen Notation (Visual)

## Complete Chen Notation Diagram

```
                    ┌─────────────────┐
                    │    PATIENTS      │
                    │  ┌───────────┐   │
                    │  │patient_id │PK │
                    │  │first_name │   │
                    │  │last_name  │   │
                    │  │dob        │   │
                    │  │gender     │   │
                    │  │contact_   │   │
                    │  │  info     │   │
                    │  │medical_   │   │
                    │  │  history  │   │
                    │  └───────────┘   │
                    └────────┬─────────┘
                             │
                             │ 1
                             │
                    ┌────────▼────────┐
                    │      HAS        │
                    └────────┬────────┘
                             │
                             │ N
                             │
                    ┌────────▼────────┐
                    │   ADMISSIONS    │
                    │  ┌───────────┐   │
                    │  │admission_ │PK │
                    │  │  id       │   │
                    │  │patient_id │FK │
                    │  │admitted_  │   │
                    │  │  by      │FK │
                    │  │admitted_  │   │
                    │  │  at      │   │
                    │  │discharge_│   │
                    │  │  time    │   │
                    │  │status    │   │
                    │  └───────────┘   │
                    └────────┬─────────┘
                             │
                             │ N
                             │
                    ┌────────▼────────┐
                    │     ADMITS       │
                    └────────┬────────┘
                             │
                             │ 1
                             │
                    ┌────────▼────────┐
                    │      STAFF      │
                    │  ┌───────────┐   │
                    │  │staff_id  │PK │
                    │  │name      │   │
                    │  │email     │UK │
                    │  │password_ │   │
                    │  │  hash    │   │
                    │  │role      │   │
                    │  └───────────┘   │
                    └────────┬─────────┘
                             │
                             │ 1
                             │
                    ┌────────▼────────┐
                    │     CREATES      │
                    └────────┬────────┘
                             │
                             │ N
                             │
                    ┌────────▼────────┐
                    │   THRESHOLDS    │
                    │  ┌───────────┐   │
                    │  │threshold_│PK │
                    │  │  id      │   │
                    │  │name      │   │
                    │  │min_value │   │
                    │  │max_value │   │
                    │  │unit      │   │
                    │  │patient_id│FK │
                    │  │created_  │   │
                    │  │  by      │FK │
                    │  │effective_│   │
                    │  │  from    │   │
                    │  │effective_│   │
                    │  │  to      │   │
                    │  └───────────┘   │
                    └────────┬─────────┘
                             │
                             │ N
                             │
                    ┌────────▼────────┐
                    │      HAS         │
                    │   (optional)     │
                    └────────┬────────┘
                             │
                             │ 0..1
                             │
                    (back to PATIENTS)


┌─────────────────┐
│    PATIENTS      │
│  ┌───────────┐   │
│  │patient_id │PK │
│  └───────────┘   │
└────────┬─────────┘
         │
         │ 1
         │
┌────────▼────────┐
│   ASSIGNED_TO   │
└────────┬────────┘
         │
         │ N
         │
┌────────▼────────┐
│DEVICE_ASSIGNMENTS│
│  ┌───────────┐   │
│  │assignment│PK │
│  │  _id     │   │
│  │device_id │FK │
│  │patient_id│FK │
│  │assigned_ │   │
│  │  by      │FK │
│  │assigned_ │   │
│  │  from    │   │
│  │assigned_ │   │
│  │  to      │   │
│  │notes     │   │
│  └───────────┘   │
└────────┬─────────┘
         │
         │ N
         │
┌────────▼────────┐
│    ASSIGNED     │
└────────┬────────┘
         │
         │ 1
         │
┌────────▼────────┐
│    DEVICES      │
│  ┌───────────┐   │
│  │device_id  │PK │
│  │device_    │   │
│  │  type     │   │
│  │serial_    │   │
│  │  number   │UK │
│  │metadata   │   │
│  └───────────┘   │
└────────┬─────────┘
         │
         │ 1
         │
┌────────▼────────┐
│    RECORDS      │
│  (logical,      │
│   no FK)        │
└────────┬────────┘
         │
         │ N
         │
┌────────▼────────┐
│     VITALS      │
│  ┌───────────┐   │
│  │vitals_id  │PK │
│  │ts         │PK │
│  │patient_id │   │
│  │device_id  │   │
│  │heart_rate │   │
│  │spo2       │   │
│  │bp_systolic│   │
│  │bp_        │   │
│  │  diastolic│   │
│  │temperature│   │
│  │  _c       │   │
│  │respiration│   │
│  │metadata   │   │
│  └───────────┘   │
└────────┬─────────┘
         │
         │ 1
         │
┌────────▼────────┐
│   TRIGGERS      │
│  (logical,      │
│   set by        │
│   trigger)      │
└────────┬────────┘
         │
         │ N
         │
┌────────▼────────┐
│     ALERTS      │
│  ┌───────────┐   │
│  │alert_id   │PK │
│  │patient_id │FK │
│  │vitals_id  │   │
│  │created_by │FK │
│  │acknowl-   │   │
│  │  edged_by │FK │
│  │alert_type │   │
│  │severity   │   │
│  │message    │   │
│  │created_at │   │
│  │resolved_  │   │
│  │  at       │   │
│  │acknowl-   │   │
│  │  edged_at │   │
│  │extra      │   │
│  └───────────┘   │
└────────┬─────────┘
         │
         │ 1
         │
┌────────▼────────┐
│   GENERATES     │
└────────┬────────┘
         │
         │ N
         │
┌────────▼────────┐
│  NOTIFICATIONS  │
│  ┌───────────┐   │
│  │notification│PK│
│  │  _id      │   │
│  │alert_id  │FK │
│  │recipient_ │   │
│  │  staff_id│FK │
│  │recipient_ │   │
│  │  role     │   │
│  │payload    │   │
│  │sent       │   │
│  │created_at │   │
│  │delivered_ │   │
│  │  at       │   │
│  └───────────┘   │
└──────────────────┘


Additional Relationships:

STAFF ──1──[ACKNOWLEDGES]──N── ALERTS
STAFF ──1──[ASSIGNS]──N── DEVICE_ASSIGNMENTS
STAFF ──1──[RECEIVES]──N── NOTIFICATIONS
PATIENTS ──1──[HAS]──N── ALERTS
```

## Chen Notation Legend

- **Rectangle** = Entity (Table)
- **Diamond** = Relationship
- **Oval** = Attribute (shown inside entity rectangles)
- **PK** = Primary Key
- **FK** = Foreign Key
- **UK** = Unique Key
- **1** = One (single line)
- **N** = Many (single line)
- **0..1** = Zero or One (optional participation)

## Cardinality Notation

- **1** ──[Relationship]── **N** = One-to-Many
- **1** ──[Relationship]── **1** = One-to-One
- **N** ──[Relationship]── **N** = Many-to-Many
- **0..1** ──[Relationship]── **N** = Optional One-to-Many

## Key Relationships Summary

1. **PATIENTS** ──1──[HAS]──N── **ADMISSIONS**
2. **STAFF** ──1──[ADMITS]──N── **ADMISSIONS**
3. **PATIENTS** ──1──[ASSIGNED_TO]──N── **DEVICE_ASSIGNMENTS**
4. **DEVICES** ──1──[ASSIGNED]──N── **DEVICE_ASSIGNMENTS**
5. **STAFF** ──1──[ASSIGNS]──N── **DEVICE_ASSIGNMENTS**
6. **PATIENTS** ──0..1──[HAS]──N── **THRESHOLDS** (NULL = global)
7. **STAFF** ──1──[CREATES]──N── **THRESHOLDS**
8. **PATIENTS** ──1──[HAS]──N── **VITALS** (logical, no FK)
9. **DEVICES** ──1──[RECORDS]──N── **VITALS** (logical, no FK)
10. **VITALS** ──1──[TRIGGERS]──N── **ALERTS** (logical)
11. **PATIENTS** ──1──[HAS]──N── **ALERTS**
12. **STAFF** ──1──[CREATES]──N── **ALERTS**
13. **STAFF** ──1──[ACKNOWLEDGES]──N── **ALERTS**
14. **ALERTS** ──1──[GENERATES]──N── **NOTIFICATIONS**
15. **STAFF** ──1──[RECEIVES]──N── **NOTIFICATIONS**

