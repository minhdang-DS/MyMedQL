from datetime import datetime, timezone

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.threshold import Threshold
from app.models.vital import Vital
from app.services.alert_evaluator import AlertEvaluator


@pytest.mark.asyncio
async def test_alert_evaluator_returns_critical(session: AsyncSession):
    threshold = Threshold(patient_id="p1", hr_max=120, spo2_min=92)
    vital = Vital(
        patient_id="p1",
        sensor_id="s1",
        timestamp=datetime.now(timezone.utc),
        heart_rate=150,
        spo2=95,
        systolic_bp=120,
        diastolic_bp=80,
        body_temp=98.6,
    )
    session.add(threshold)
    await session.flush()

    alert = await AlertEvaluator.evaluate(session, vital, threshold)

    assert alert is not None
    assert alert.severity == "critical"


@pytest.mark.asyncio
async def test_alert_evaluator_no_alert_when_normal(session: AsyncSession):
    threshold = Threshold(patient_id="p1", hr_max=120, spo2_min=92)
    vital = Vital(
        patient_id="p1",
        sensor_id="s1",
        timestamp=datetime.now(timezone.utc),
        heart_rate=80,
        spo2=96,
        systolic_bp=115,
        diastolic_bp=75,
        body_temp=98.4,
    )
    session.add(threshold)
    await session.flush()

    alert = await AlertEvaluator.evaluate(session, vital, threshold)

    assert alert is None

