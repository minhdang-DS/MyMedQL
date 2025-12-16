MyMedQL Backend (FastAPI)
=========================

This backend implements the ingestion, alert evaluation, persistence, and websocket broadcasting flow described in the specification.

Key entrypoints
---------------
- `app/main.py` – FastAPI application factory and router wiring.
- `app/api/routers` – HTTP endpoints for vitals ingestion, patients, and alerts.
- `app/services/alert_evaluator.py` – Core alert business logic with deduplication.
- `app/websockets/manager.py` – Connection manager that broadcasts JSON updates.

Local development
-----------------
1. Create a virtualenv with Python 3.11+ and install dependencies:
   ```bash
   cd MyMedQL/backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Run the API:
   ```bash
   uvicorn app.main:app --reload --port 3001
   ```
3. Set database env vars (defaults point to the docker-compose MySQL service):
   - `DB_HOST=db`
   - `DB_PORT=3306`
   - `DB_NAME=mymedql`
   - `DB_USER=medql_user`
   - `DB_PASSWORD=medql_pass`

Testing
-------
Pytest is configured to run against an in-memory SQLite database for speed.
