from typing import List, Sequence

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_connection_manager, get_db
from app.schemas.vital import VitalCreate, VitalRead
from app.services.vital_service import VitalService
from app.websockets.manager import ConnectionManager

router = APIRouter()


@router.post("", status_code=status.HTTP_202_ACCEPTED, response_model=List[VitalRead])
async def ingest_vitals(
    payload: Sequence[VitalCreate],
    session: AsyncSession = Depends(get_db),
    connection_manager: ConnectionManager = Depends(get_connection_manager),
):
    saved = await VitalService.ingest_batch(session, payload, connection_manager)
    return saved
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.schemas.vital_schema import VitalCreate, VitalRead
from app.services.patient_service import get_patient
from app.services.vital_service import record_vital


router = APIRouter()


@router.post("/vitals", response_model=VitalRead, status_code=status.HTTP_201_CREATED)
async def ingest_vital(
    payload: VitalCreate,
    db: AsyncSession = Depends(dependencies.get_db),
    current_user: dict = Depends(dependencies.get_current_user),
) -> VitalRead:
    patient = await get_patient(db, payload.patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    vital = await record_vital(db, payload)
    return vital



