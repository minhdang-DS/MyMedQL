# MyMedQL

<div align="center">

**Real-Time Patient Vital Monitoring & Anomaly Detection System**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

*A production-ready ICU-style monitoring platform with database-driven architecture*

[Quick Start](#-quick-start) • [Features](#-key-features) • [Architecture](#-architecture) • [Documentation](#-documentation)

</div>

---

## 📋 Overview

MyMedQL is a comprehensive patient monitoring system designed for intensive care units and clinical environments. The platform continuously ingests high-frequency vital signs data, performs real-time anomaly detection, and delivers instant alerts to healthcare staff through an intuitive web dashboard.

### The Challenge

Traditional patient monitoring relies on manual checks and periodic assessments, which can delay detection of critical patient deterioration. In critical care scenarios, every second counts—delayed intervention can mean the difference between recovery and adverse outcomes.

### Our Solution

MyMedQL provides a **database-first architecture** that transforms the relational database from passive storage into an active, intelligent component. By leveraging MySQL triggers, stored procedures, and optimized indexing strategies, we've built a system that:

- ⚡ **Processes 50+ vital sign readings per second** with sub-second query response times
- 🔔 **Generates real-time alerts** automatically when thresholds are exceeded
- 📊 **Delivers live visualizations** of patient vitals with medical-grade waveform rendering
- 🔐 **Enforces role-based access control** for secure, auditable clinical workflows
- 📈 **Maintains complete audit trails** for compliance and research purposes

---

## 🚀 Quick Start

Get MyMedQL up and running in three simple steps:

```bash
# 1. Create .env file with required environment variables
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Add the output to your .env file along with SECRET_KEY

# 2. Start all services with Docker
docker-compose up --build

# 3. Run the demo vitals generator
docker-compose exec backend python backend/scripts/generate_demo_vitals.py
```

**Access the application:**
- Frontend Dashboard: http://localhost:3000
- API Documentation: http://localhost:3001/docs
- Health Check: http://localhost:3001/health

For detailed setup instructions, see [QUICKSTART.md](./QUICKSTART.md).

---

## ✨ Key Features

### 🏥 Real-Time Patient Monitoring
- **Live Vital Signs Dashboard**: Real-time visualization of heart rate, SpO2, blood pressure, temperature, and respiration
- **Medical-Grade Waveforms**: Custom-built visualization engine rendering ECG, plethysmograph, and respiration waveforms
- **Multi-Patient Overview**: Staff can monitor multiple patients simultaneously with status indicators

### 🔔 Intelligent Alert System
- **Automatic Threshold Detection**: Database triggers automatically generate alerts when vitals exceed configurable thresholds
- **Multi-Level Alerting**: Warning and critical alerts with distinct visual indicators
- **Alert Acknowledgment Workflow**: Track which staff members have acknowledged and responded to alerts
- **Duplicate Prevention**: Smart logic prevents duplicate alerts within configurable time windows

### 👥 Role-Based Access Control
- **Staff Roles**: Admin, Doctor, Nurse, and Viewer roles with appropriate permissions
- **Patient Assignment**: Many-to-many relationship allowing flexible staff-patient assignments
- **Filtered Views**: Staff only see patients assigned to them, ensuring privacy and focused workflows

### 📊 Advanced Database Engineering
- **Trigger-Based Automation**: Database triggers handle alert generation, status updates, and data validation
- **Optimized Indexing**: Composite indexes on `(patient_id, ts)` for efficient time-series queries
- **Partitioning Support**: Designed for time-based partitioning of high-volume vitals data
- **Stored Procedures**: Reusable database logic for common analytics operations

### 🔐 Security & Compliance
- **Password Hashing**: Bcrypt with 12 rounds for secure credential storage
- **Field-Level Encryption**: Sensitive medical history encrypted using Fernet symmetric encryption
- **SQL Injection Prevention**: All queries use parameterized statements
- **Audit Logging**: Complete timestamp tracking for all critical operations

### 🎨 Modern User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dynamic Theming**: Visual themes adapt based on patient status (stable, warning, critical)
- **Real-Time Updates**: WebSocket connections deliver instant updates without page refresh
- **Interactive Charts**: Historical trend visualization with adaptive plotting

---

## 🏗️ Architecture

### System Components

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │◄───────►│   Backend API   │◄───────►│   MySQL DB      │
│   (Next.js)     │ WebSocket│   (FastAPI)     │  SQL    │   (8.x)         │
│                 │         │                 │         │                 │
│ • React UI      │         │ • REST API      │         │ • Tables        │
│ • Real-time     │         │ • WebSocket     │         │ • Triggers      │
│ • Visualizations│         │ • Auth          │         │ • Procedures    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │                           │                           │
         │                           │                           │
         └───────────────────────────┴───────────────────────────┘
                              Docker Compose
```

### Data Flow

1. **Vital Signs Ingestion**: Simulator or medical devices insert vital signs into the database
2. **Trigger Activation**: Database triggers automatically evaluate thresholds and create alerts
3. **Real-Time Distribution**: WebSocket connections broadcast updates to connected clients
4. **Dashboard Rendering**: Frontend receives updates and renders live visualizations
5. **Alert Management**: Staff acknowledge alerts, updating database state

### Database Schema Highlights

- **Normalized Design**: 3NF normalization ensures data integrity and eliminates redundancy
- **Time-Series Optimization**: Vitals table optimized for high-frequency inserts with composite indexes
- **Flexible Thresholds**: Global and patient-specific thresholds with type-based categorization
- **Audit Trail**: Complete history of device assignments, alert acknowledgments, and status changes

---

## 🛠️ Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework with automatic API documentation
- **SQLAlchemy Core**: Database abstraction layer with raw SQL support for complex queries
- **WebSocket**: Real-time bidirectional communication for live updates
- **Pydantic**: Data validation and settings management
- **Bcrypt**: Secure password hashing
- **Fernet**: Symmetric encryption for sensitive data

### Frontend
- **Next.js 14**: React framework with server-side rendering and static generation
- **React Hooks**: Custom hooks for WebSocket management and waveform generation
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **SVG Graphics**: Custom mathematical models for medical waveform rendering

### Database
- **MySQL 8.0**: Relational database with InnoDB storage engine
- **Triggers**: Automated alert generation and status management
- **Stored Procedures**: Reusable database logic for analytics
- **Views**: Optimized query patterns for common operations
- **Indexes**: Composite indexes for time-series and join optimization

### Infrastructure
- **Docker & Docker Compose**: Containerized deployment for consistent environments
- **Multi-Stage Builds**: Optimized container images for production
- **Health Checks**: Automated service health monitoring
- **Volume Persistence**: Database data persistence across container restarts

---

## 📁 Project Structure

```
MyMedQL/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/    # REST API endpoints
│   │   ├── core/              # Security & encryption
│   │   ├── db/                 # Database connection
│   │   └── websocket/          # WebSocket handlers
│   ├── scripts/
│   │   └── generate_demo_vitals.py  # Demo data generator
│   └── sql/
│       ├── ddl/                # Schema definitions
│       ├── migrations/         # Database migrations
│       └── seed/               # Sample data
├── frontend/
│   ├── app/                    # Next.js app directory
│   ├── components/             # React components
│   └── public/                 # Static assets
├── docker/                     # Docker configuration
├── docker-compose.yml          # Service orchestration
├── README.md                   # This file
└── QUICKSTART.md              # Setup guide
```

---

## 🎯 Use Cases

### Clinical Monitoring
- **ICU Patient Surveillance**: Continuous monitoring of critical patients
- **Post-Operative Care**: Automated alerting for post-surgical patients
- **Emergency Department**: Rapid triage and monitoring capabilities

### Research & Analytics
- **Vital Signs Analysis**: Historical data for research studies
- **Threshold Optimization**: Analyze alert patterns to refine thresholds
- **Performance Metrics**: Track system performance and response times

### Training & Education
- **Simulated Scenarios**: Reproducible demo scenarios for training
- **Database Engineering**: Showcase advanced database design patterns
- **System Integration**: Demonstrate real-time system architecture

---

## 🔬 Technical Highlights

### Database-First Architecture
Unlike traditional applications that treat the database as passive storage, MyMedQL leverages MySQL as an active component:

- **Triggers**: Automatically generate alerts when vitals exceed thresholds
- **Stored Procedures**: Encapsulate complex analytics logic in the database
- **Views**: Pre-computed query patterns for performance
- **Partitioning**: Designed for time-based data partitioning

### Real-Time Visualization Engine
Custom-built waveform rendering engine using mathematical models:

- **ECG Waveforms**: Piecewise function simulating P-Q-R-S-T complex
- **SpO2 Plethysmograph**: Continuous function with dicrotic notch
- **Respiration**: Sine wave driven by respiration rate
- **60 FPS Rendering**: Smooth, medical-grade visualizations

### Scalability Considerations
- **High-Frequency Inserts**: Optimized for 50+ inserts per second
- **Efficient Queries**: Sub-second response times for typical queries
- **Connection Pooling**: Efficient database connection management
- **WebSocket Scaling**: Designed for multiple concurrent connections

---

## 👥 Team

| Name | Role | Contributions |
|------|------|---------------|
| **Cao Pham Minh Dang** | Database Engineer | ERD design, normalization, indexing, partitioning |
| **Ngo Dinh Khanh** | Backend Developer | API development, database triggers, stored procedures |
| **Pham Dinh Hieu** | Backend Developer | API development, database triggers, stored procedures |
| **Nguyen Anh Duc** | Frontend Developer / QA | Dashboard UI, real-time visualizations, waveform engine |

---

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)**: Step-by-step setup and running instructions
- **API Documentation**: Interactive API docs available at http://localhost:3001/docs when running
- **Database Schema**: See `backend/sql/ddl/` for complete schema definitions

---

## 🔒 Security Considerations

- **Password Security**: Bcrypt hashing with 12 rounds
- **Data Encryption**: Fernet encryption for sensitive medical history
- **SQL Injection Prevention**: All queries use parameterized statements
- **Role-Based Access**: Enforced at both API and database levels
- **Audit Logging**: Complete timestamp tracking for compliance

---

## 🚧 Future Enhancements

- [ ] Mobile application for on-the-go monitoring
- [ ] Machine learning-based predictive alerts
- [ ] Integration with HL7/FHIR standards
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support for multiple facilities
- [ ] Export capabilities for research data

---

## 📄 License

This project is developed for educational purposes as part of the COMP3030 - Databases and Database Systems course.

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices in database engineering, security, and real-time systems.

---

<div align="center">

**Built with ❤️ for better patient care**

[Report Issue](https://github.com/your-repo/issues) • [Request Feature](https://github.com/your-repo/issues) • [Documentation](./QUICKSTART.md)

</div>
