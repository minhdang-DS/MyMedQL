# Real-Time Patient Vital Monitoring & Anomaly Detection System

A lightweight ICU-style monitoring platform that collects patient vital signs in real time, stores them in a structured database, and displays them on a live web dashboard. The system generates alerts when abnormal values are detected and provides historical trends to support clinical decision-making.

---

## 📄 Description

Modern hospital wards and ICUs depend on continuous monitoring of patient vitals such as heart rate, blood pressure, SpO₂, temperature, and respiration. Manual monitoring leads to inconsistent sampling, human error, and delayed reaction to critical events.

This project implements a real-time monitoring system that:

- Receives live vital-sign data from simulated or actual sensors  
- Stores high-frequency readings efficiently in a database  
- Detects anomalies using thresholds and database triggers  
- Presents an interactive web dashboard with trends and alerts  
- Supports secure role-based access for hospital staff  

The system demonstrates practical integration of relational databases, real-time pipelines, and modern web interfaces.

---

## 🌟 Project Originality

Real-time patient monitoring systems already exist in hospitals (e.g., Philips IntelliVue, Mindray monitors), but these systems are proprietary, expensive, and closed-source. Some open-source medical dashboards exist, but very few integrate:

- A relational schema designed for **high-frequency time-series vitals**
- **Database-driven anomaly detection** using triggers
- A **live web dashboard** built from scratch with real-time data streams
- An academic-friendly architecture that prioritizes transparency and reproducibility

Your system becomes original by focusing on:

1. **Database-centric design**  
   Instead of treating the DB as a passive storage layer, your system uses it actively through triggers, stored procedures, partitioning, and views. This demonstrates mastery of database engineering—something commercial systems rarely reveal.

2. **Educational transparency**  
   All components are fully documented and open for inspection, making the platform valuable for teaching data modeling, real-time systems, and security.

3. **Configurable thresholds & alert logic**  
   Hospitals often use fixed vendor logic. Your system allows dynamic, DB-driven configuration.

4. **Lightweight architecture**  
   Instead of a monolithic medical device, it uses standard web technologies, making the system easy to deploy in labs or academic environments.

---

## 🔍 Database & Tech Choices Evaluation

### Database Features (MySQL / PostgreSQL)

- **Stored Procedures** enable predefined analytical operations (e.g., last N readings).  
- **Triggers** allow immediate, rule-driven alert creation without relying on backend timing loops.  
- **Views** optimize repeated analytical patterns such as daily averages or vitals summaries.  
- **Indexes** on `(patient_id, timestamp)` support fast retrieval of high-frequency data.  
- **Partitioning** on timestamp improves performance for large datasets.

These are appropriate for a database-focused project and map perfectly to grading criteria.

**Potential Enhancements:**

- PostgreSQL with **TimescaleDB** extension provides native time-series optimizations, but MySQL still satisfies all requirements and is simpler for course grading.
- Using PostgreSQL would allow materialized views for faster analytics, though not mandatory.

### Web Stack (Node.js / Flask)

Both choices match the needs of:

- Rapid CRUD development  
- Real-time communication via WebSocket  
- Integration with SQL databases  
- Flexible authentication and middleware support  

Flask is minimal and clean for course projects.  
Node.js is fast for streaming data.  
Either is acceptable and aligned with course expectations.

---

## 🧭 Clarity of the Proposal

The proposal is strong but a few points need clarification:

1. **Threshold Entity Usage**  
   The README includes a `Threshold` table, but its exact usage should be clearly defined (global thresholds? per-patient? per-device?).

2. **Device-to-Patient Mapping Rules**  
   The statement “Device assigned to patient” implies one-to-one mapping. Clarify:  
   - Can a patient have multiple devices?  
   - What happens when switching devices?

3. **Anomaly Detection Logic**  
   You have triggers for alerts, but should specify whether backend AI/logic can override DB triggers.

4. **Real-Time Source**  
   Clarify whether vitals come from:  
   - a simulated script  
   - a physical IoT device  
   - or manually entered values

These don't break the proposal but documenting them improves completeness.

---

## 🧪 Feature Evaluation & Suggestions

### Realistic & Sufficient Features

The current feature set is practical for a semester project:

- CRUD operations  
- Real-time ingestion  
- Trigger-based alerts  
- Web dashboard  
- Authentication  
- Basic analytics  

All feasible within 6 weeks.

### Additional Practical Features to Consider

These are easy to implement but significantly enhance the experience:

1. **Patient Status Overview Page**  
   A single screen showing all patients with color-coded statuses (stable / warning / critical).

2. **Alert Acknowledgment System**  
   Staff can mark an alert as "seen" or "resolved".  
   Add columns: `acknowledged_by`, `acknowledged_time`.

3. **Export Functions (CSV)**  
   Simple endpoint to export vitals or alerts. No need for PDF.

4. **API Rate Limiting or Input Validation**  
   Prevent flooding the system with malformed or excessive data.

5. **Automatic Device Offline Detection**  
   If no data arrived for X seconds, mark device as offline.  
   Store in DB: `device_status`.

These features are straightforward but impress instructors.

---

## 🎯 Requirements

### Functional Requirements

- CRUD operations for Patients, Staff, and Devices  
- Ingest real-time vitals (1–5s intervals)  
- Automatic alert generation when vitals exceed thresholds  
- Trend visualization (last 1h, 24h, custom ranges)  
- Staff authentication and role-based access  
- Dashboard with real-time charts and alerts  
- Stored procedures for trend queries  
- Triggers for alert creation  

### Non-functional Requirements

- 3NF normalization  
- Indexing for fast time-series lookups  
- Optional table partitioning  
- Password hashing  
- Encrypted patient fields  
- SQL injection prevention  
- Real-time readiness (WebSocket/MQTT)  
- Clean and responsive UI  

---

## 🧱 Planned Core Entities

- **Patient** — demographics, medical history  
- **Vitals** — high-frequency vital-sign measurements  
- **Alert** — generated warnings for abnormal values  
- **Device** — monitoring devices  
- **Staff** — users with roles  
- **Threshold** — configurable vital-sign boundaries  

These form the backbone of the database’s ERD.

---

## 🔧 Tech Stack

**Backend / API**  
- Node.js / Express or Python (Flask / FastAPI)  
- WebSocket/MQTT for real-time updates  

**Database**  
- MySQL / PostgreSQL  
- Optional TimescaleDB extension for time series optimization  

**Frontend**  
- React + TailwindCSS  
- Recharts / Chart.js  

**Security**  
- bcrypt hashing  
- RBAC enforcement  
- Parameterized SQL queries  

---

## 👥 Team Members & Roles

| Name | Role | Responsibilities |
|------|------|------------------|
| Cao Pham Minh Dang | Backend Developer  | API, DB triggers, stored procedures |
| Ngo Dinh Khanh     | Frontend Developer | Dashboard UI, charts, real-time visualization |
| Pham Dinh Hieu     | Database Engineer  | ERD, normalization, indexing, partitioning |
| Nguyen Anh Duc     | DevOps / QA        | Deployment, testing, documentation |

---

## 📅 Timeline & Milestones

| Week | Milestone |
|------|-----------|
| Week 1 | Requirements finalization, ERD design, tech stack setup |
| Week 2 | Database implementation, DDL, triggers, sample data |
| Week 3 | Backend API + real-time pipeline |
| Week 4 | Dashboard UI, charts, alerts panel |
| Week 5 | Integration testing, performance tuning |
| Week 6 | Final documentation, video demo, presentation |

---
