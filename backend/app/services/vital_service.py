from typing import Iterable, List, Optional, Sequence

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Alert, Patient, Threshold, Vital
from app.schemas.vital import VitalCreate
from app.services.alert_evaluator import AlertEvaluator
from app.websockets.manager import ConnectionManager


class VitalService:
    """Handles ingestion, evaluation, persistence, and broadcasting."""

    @staticmethod
    async def ingest_batch(
        session: AsyncSession,
        payloads: Sequence[VitalCreate],
        connection_manager: ConnectionManager,
    ) -> List[Vital]:
        if not payloads:
            return []

        # Expect all vitals in a batch to belong to the same patient for simplicity.
        patient_id = payloads[0].patient_id
        patient = await VitalService._get_patient(session, patient_id)
        if patient is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient {patient_id} not found",
            )

        threshold = await VitalService._get_threshold(session, patient_id)
        saved_vitals: List[Vital] = []
        generated_alerts: List[Alert] = []

        for item in payloads:
            vital = Vital(
                patient_id=item.patient_id,
                sensor_id=item.sensor_id,
                timestamp=item.timestamp,
                heart_rate=item.heart_rate,
                spo2=item.spo2,
                systolic_bp=item.systolic_bp,
                diastolic_bp=item.diastolic_bp,
                body_temp=item.body_temp,
            )
            session.add(vital)
            await session.flush()
            saved_vitals.append(vital)

            alert = await AlertEvaluator.evaluate(session, vital, threshold)
            if alert:
                generated_alerts.append(alert)

        await session.commit()

        await VitalService._broadcast(
            connection_manager, saved_vitals=saved_vitals, alerts=generated_alerts
        )
        return saved_vitals

    @staticmethod
    async def _get_patient(session: AsyncSession, patient_id: str) -> Optional[Patient]:
        stmt = select(Patient).where(Patient.patient_id == patient_id)
        return (await session.execute(stmt)).scalars().first()

    @staticmethod
    async def _get_threshold(
        session: AsyncSession, patient_id: str
    ) -> Optional[Threshold]:
        stmt = select(Threshold).where(Threshold.patient_id == patient_id)
        return (await session.execute(stmt)).scalars().first()

    @staticmethod
    async def _broadcast(
        connection_manager: ConnectionManager,
        saved_vitals: Iterable[Vital],
        alerts: Iterable[Alert],
    ) -> None:
        vital_payload = [
            {
                "type": "VITAL_UPDATE",
                "data": {
                    "patient_id": v.patient_id,
                    "heart_rate": v.heart_rate,
                    "spo2": v.spo2,
                    "timestamp": v.timestamp.isoformat(),
                },
            }
            for v in saved_vitals
        ]

        alert_payload = [
            {
                "type": "ALERT_NEW",
                "data": {
                    "alert_id": a.id,
                    "patient_id": a.patient_id,
                    "severity": a.severity,
                    "message": a.message,
                    "timestamp": a.timestamp.isoformat(),
                },
            }
            for a in alerts
        ]

        for message in [*vital_payload, *alert_payload]:
            await connection_manager.broadcast(message)



