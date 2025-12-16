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
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.schemas.patient_schema import PatientCreate, PatientRead
from app.services.patient_service import create_patient, get_patient


router = APIRouter()


@router.post("/patients", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
async def create_patient_endpoint(
    payload: PatientCreate,
    db: AsyncSession = Depends(dependencies.get_db),
    current_user: dict = Depends(dependencies.get_current_user),
) -> PatientRead:
    patient = await create_patient(db, payload)
    return patient


@router.get("/patients/{patient_id}", response_model=PatientRead)
async def get_patient_endpoint(
    patient_id: int,
    db: AsyncSession = Depends(dependencies.get_db),
    current_user: dict = Depends(dependencies.get_current_user),
) -> PatientRead:
    patient = await get_patient(db, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient



