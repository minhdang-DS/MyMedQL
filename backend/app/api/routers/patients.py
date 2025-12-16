from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.models.patient import Patient
from app.models.vital import Vital
from app.schemas.patient import PatientRead
from app.schemas.vital import VitalRead

router = APIRouter()


@router.get("/{patient_id}", response_model=PatientRead)
async def get_patient(
    patient_id: str,
    session: AsyncSession = Depends(get_db),
):
    stmt = select(Patient).where(Patient.patient_id == patient_id)
    patient = (await session.execute(stmt)).scalars().first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
        )
    return patient


@router.get("/{patient_id}/history", response_model=List[VitalRead])
async def get_patient_history(
    patient_id: str,
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    session: AsyncSession = Depends(get_db),
):
    patient_stmt = select(Patient).where(Patient.patient_id == patient_id)
    patient = (await session.execute(patient_stmt)).scalars().first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
        )

    stmt = select(Vital).where(Vital.patient_id == patient_id)
    if start_time:
        stmt = stmt.where(Vital.timestamp >= start_time)
    if end_time:
        stmt = stmt.where(Vital.timestamp <= end_time)

    stmt = stmt.order_by(Vital.timestamp.asc())
    vitals = (await session.execute(stmt)).scalars().all()
    return vitals



