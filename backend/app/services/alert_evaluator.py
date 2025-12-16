from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.threshold import Threshold
from app.models.vital import Vital


class AlertEvaluator:
    """Core alert logic with deduplication window."""

    @staticmethod
    async def evaluate(
        session: AsyncSession, vital: Vital, threshold: Optional[Threshold]
    ) -> Optional[Alert]:
        if threshold is None:
            return None

        now = vital.timestamp or datetime.now(timezone.utc)
        is_critical = vital.heart_rate > threshold.hr_max or vital.spo2 < threshold.spo2_min
        is_warning = (
            not is_critical and vital.heart_rate >= int(threshold.hr_max * 0.9)
        )

        if is_critical:
            dedup_after = now - timedelta(minutes=1)
            stmt = select(Alert).where(
                Alert.patient_id == vital.patient_id,
                Alert.severity == "critical",
                Alert.is_acknowledged.is_(False),
                Alert.timestamp >= dedup_after,
            )
            existing = (await session.execute(stmt)).scalars().first()
            if existing:
                return None

            message = f"Critical vital signs: HR {vital.heart_rate} bpm, SpO2 {vital.spo2}%"
            alert = Alert(
                patient_id=vital.patient_id,
                severity="critical",
                message=message,
                timestamp=now,
            )
        elif is_warning:
            message = f"High heart rate approaching limit: {vital.heart_rate} bpm"
            alert = Alert(
                patient_id=vital.patient_id,
                severity="warning",
                message=message,
                timestamp=now,
            )
        else:
            return None

        session.add(alert)
        await session.flush()
        return alert
from app.schemas.vital_schema import VitalCreate


def evaluate_vital(payload: VitalCreate) -> list[str]:
    """Very small placeholder for threshold checks."""
    alerts: list[str] = []
    if payload.spo2 is not None and payload.spo2 < 90:
        alerts.append("Low SpO2")
    if payload.heart_rate < 40 or payload.heart_rate > 150:
        alerts.append("Abnormal heart rate")
    return alerts



