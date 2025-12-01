# Real-Time Patient Vital Monitoring & Anomaly Detection System

## Project Title
**Real-Time Patient Vital Monitoring & Anomaly Detection**

---

## 📄 Brief description
We build a lightweight ICU-style monitoring platform that ingests patient vital signs in real time, stores them in a structured relational database, and presents them on a live web dashboard. The system detects abnormal values, generates time-stamped alerts, and provides historical trends to support clinical decision-making. Our primary technical focus is demonstrating robust database engineering with MySQL as the canonical data store.

**Problem we solve:** manual or infrequent checks can delay detection of patient deterioration. We provide a reproducible, database-driven pipeline that enables continuous monitoring, auditable alerting, and efficient querying of high-frequency vitals for clinicians and researchers.

---

## Project originality (similar systems & our novelties)
There are commercial and open-source patient-monitoring products. Our project differs in three key ways:

1. **Database-first architecture.**  
   We make the relational database the active component (partitioning, stored procedures, triggers, views, JSON columns and optimized indexing) rather than treating it as passive storage. This highlights database engineering practices rarely visible in commercial stacks.

2. **Configurable, auditable alerting.**  
   Thresholds can be global or patient-specific, versioned, and stored in the DB so every alert is reproducible and auditable. Device assignment history is tracked for realism.

3. **Reproducible demo scenarios.**  
   We provide a sensor simulator and scripted scenarios (stable → deterioration → recovery) so graders can reproduce alert flows deterministically. This makes the project ideal for teaching and demonstration.

---

## 🎯 Functional & Non-functional requirements

### Functional
- CRUD for Patients, Staff, Devices, Thresholds.  
- High-frequency ingestion of vitals (target: 1–5s per device in demo).  
- Trigger-based alert creation on vitals insert.  
- Stored procedures for common analytics (e.g., `get_last_n_readings`, `aggregate_daily_stats`).  
- Views for frequent query patterns (hourly averages, patient summaries).  
- Real-time dashboard: WebSocket-driven updates of vital trends and alerts.  
- Role-based access control (roles: admin, doctor, nurse, viewer).  
- Device assignment history and alert acknowledgement workflow.

### Non-functional
- Primary DB: **MySQL 8.x** (InnoDB).  
- Data model normalized to **3NF**.  
- Indexing on `(patient_id, ts)` and appropriate composite indexes.  
- Optional partitioning of `vitals` by time (monthly) for demo data.  
- Secure password hashing (bcrypt).  
- Application-layer encryption for sensitive fields (medical history) with keys held in environment for the demo.  
- Parameterized queries to prevent SQL injection.  
- Docker Compose for reproducible local demo.  
- Performance target for the demo: handle 50 inserts/sec with sub-second reads for typical queries.

---

## 🧱 Planned core entities (brief outline)
- **Patient** — `patient_id`, `first_name`, `last_name`, `dob`, `gender`, `contact_info` (JSON), `medical_history` (encrypted), timestamps.  
- **Staff** — `staff_id`, `name`, `email`, `password_hash`, `role`, timestamps.  
- **Device** — `device_id`, `device_type`, `serial_number`, `metadata` (JSON), timestamps.  
- **DeviceAssignment** — `assignment_id`, `device_id`, `patient_id`, `assigned_from`, `assigned_to`, `assigned_by`.  
- **Vitals** — `vitals_id`, `patient_id`, `device_id`, `ts`, `heart_rate`, `spo2`, `bp_systolic`, `bp_diastolic`, `temperature_c`, `respiration`, `metadata`, indexes on `(patient_id, ts)` and `(device_id, ts)`.  
- **Threshold** — `threshold_id`, `name` (vital name), `min_value`, `max_value`, `unit`, `patient_id` (nullable), `effective_from`, `effective_to`, `created_by`.  
- **Alert** — `alert_id`, `patient_id`, `vitals_id`, `alert_type`, `severity`, `message`, `created_at`, `resolved_at`, `created_by`, `acknowledged_by`, `acknowledged_at`.

---

## 🔧 Tech stack
- **Database:** MySQL 8.x (InnoDB).  
- **Backend / API:** Node.js + Express (WebSocket via Socket.IO).  
  - Alternatives: Python (FastAPI) — acceptable if team prefers Python; final choice will be stated in repo.  
- **Frontend:** React + TailwindCSS; charts via Recharts or Chart.js.  
- **Dev / Ops:** Docker & Docker Compose for local deployment.  
- **Security & Utilities:** bcrypt (passwords), JWT or secure server sessions, `.env` for demo secrets.  
- **Optional (scaling):** Redis for pub/sub if we separate real-time messaging from DB write load; Mosquitto if demonstrating MQTT.

---

## 👥 Team members & roles
- **Cao Pham Minh Dang** — Backend Developer: API implementation, DB triggers, stored procedures, simulator integration.  
- **Ngo Dinh Khanh** — Frontend Developer: Dashboard UI, real-time charts, alert panel.  
- **Pham Dinh Hieu** — Database Engineer: ERD, DDL, normalization, indexing, partitioning strategy, performance tuning.  
- **Nguyen Anh Duc** — DevOps / QA: Docker Compose, deployment scripts, automated tests, documentation and final presentation.

---

## 📅 Timeline (3-week plan with milestones)

> We plan an intensive 3-week development sprint focused on producing a working, demo-ready MVP and clear deliverables for grading.

### Week 1 — Design & core database
- Finalize requirements and ERD (draw.io / PlantUML).  
- Implement full MySQL DDL: tables, primary/foreign keys, indexes, partitioning strategy (example).  
- Implement `Threshold`, `DeviceAssignment`, `Vitals`, `Alert` tables.  
- Create sample data and seed scripts.  
- Deliverables: `ERD.png`, `sql/ddl.sql`, `sql/sample_data.sql`.

### Week 2 — Backend core & real-time ingestion
- Implement backend API (Express) with secure endpoints and RBAC.  
- Implement WebSocket server and simple client demo flows.  
- Add triggers (AFTER INSERT on `vitals`) to create `alert` rows and at least two stored procedures (`get_last_n_readings`, `aggregate_daily_stats`).  
- Build a sensor simulator that streams vitals into the API or directly into DB for demo scenarios.  
- Deliverables: `backend/` code, triggers and stored procedures in `sql/`, `simulator/`.

### Week 3 — Frontend, integration, testing & presentation
- Build React dashboard: patient list, live vitals charts, alert panel, patient detail modal.  
- Integration testing: end-to-end demo with simulator (stable → deterioration → recovery scenario).  
- Performance tuning: run basic insert/ query load tests, tune indexes/partitions.  
- Prepare documentation: `README.md`, `GRADE.md` (run instructions for graders), demo video and slides.  
- Deliverables: `frontend/` code, `docker-compose.yml`, `docs/`, final presentation materials.

---

## Closing notes
We intentionally prioritize a MySQL-first implementation to showcase database design, query optimization, stored logic, and reproducible real-time behavior. Our deliverables will be easy to run locally (Docker Compose) and straightforward for graders to validate using provided SQL checks and scripted scenarios.

If desired, after this README is committed we will add the full ERD and the complete `sql/ddl.sql` (including example partitioning, indexes, triggers, and stored procedures) and a ready-to-run `docker-compose.yml`.
