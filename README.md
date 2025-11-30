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

The system demonstrates practical integration of databases, real-time data pipelines, and web interfaces.

---

## 🎯 Requirements

### **Functional Requirements**
- CRUD operations for Patients, Staff, and Devices  
- Ingest real-time vitals (1–5s intervals)  
- Automatic alert generation when vitals exceed thresholds  
- Trend visualization (last 1h, 24h, custom ranges)  
- Staff authentication and role-based access (admin/doctor/nurse/viewer)  
- Dashboard with real-time charts and alerts panel  
- Stored procedures for trend query (e.g., “last N readings”)  
- Triggers for alert generation  

### **Non-functional Requirements**
- Database normalized to 3NF  
- Indexing for fast time-series lookups  
- Optional table partitioning for Vitals  
- Secure password hashing  
- Encrypted sensitive patient fields  
- SQL injection prevention (parameterized queries)  
- Real-time readiness (WebSocket/MQTT)  
- Clean, responsive UI with dark mode  

---

## 🧱 Planned Core Entities

- **Patient**: demographics, medical history  
- **Vitals**: timestamped vital-sign measurements  
- **Alert**: generated warnings for abnormal values  
- **Device**: monitoring device assigned to a patient  
- **Staff**: system users with roles and permissions  
- **Threshold**: configurable vital-sign boundaries  

These entities form the backbone of the system’s ERD and database logic.

---

## 🔧 Tech Stack

**Backend / API**  
- Node.js / Express *or* Python (Flask / FastAPI)  
- WebSocket/MQTT for real-time updates  

**Database**  
- MySQL / PostgreSQL  
- Optional: TimescaleDB for time-series performance  

**Frontend**  
- React + TailwindCSS  
- Recharts / Chart.js for visualization  

**Security**  
- bcrypt password hashing  
- Role-based access control  
- Parameterized SQL queries  

---

## 👥 Team Members & Roles

| Name | Role | Responsibilities |
|------|------|------------------|
| Member 1 | Backend Developer | API, DB triggers, stored procedures |
| Member 2 | Frontend Developer | Dashboard UI, charts, real-time visualization |
| Member 3 | Database Engineer | ERD, normalization, indexing, partitioning |
| Member 4 | DevOps / QA | Deployment, testing, documentation |

*(Update names depending on your team.)*

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

## 📌 Professional Notes
This README serves as the landing page for the project repository. It summarizes the scope, architecture, and planned milestones to provide a clear overview for maintainers, collaborators, and evaluators.

---
