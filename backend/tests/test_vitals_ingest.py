from datetime import datetime, timezone

import pytest
from fastapi import status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vital import Vital
from app.schemas.vital import VitalCreate


@pytest.mark.asyncio
async def test_vitals_ingest_creates_record(
    client, session: AsyncSession, seeded_patient
):
    payload = [
        {
            "patient_id": seeded_patient.patient_id,
            "sensor_id": "sensor-1",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "heart_rate": 130,
            "spo2": 96.5,
            "systolic_bp": 120,
            "diastolic_bp": 80,
            "body_temp": 98.7,
        }
    ]

    response = client.post("/api/v1/vitals", json=payload)

    assert response.status_code == status.HTTP_202_ACCEPTED
    data = response.json()
    assert len(data) == 1
    assert data[0]["patient_id"] == seeded_patient.patient_id

    stmt = select(Vital).where(Vital.patient_id == seeded_patient.patient_id)
    vitals_in_db = (await session.execute(stmt)).scalars().all()
    assert len(vitals_in_db) == 1
    assert vitals_in_db[0].heart_rate == 130

