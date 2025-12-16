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
    """
    Ingest a batch of vital sign readings.
    """
    saved = await VitalService.ingest_batch(session, payload, connection_manager)
    return saved



