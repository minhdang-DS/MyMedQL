from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_connection_manager, get_db
from app.models.alert import Alert
from app.schemas.alert import AlertAckResponse, AlertRead
from app.websockets.manager import ConnectionManager

router = APIRouter()


@router.get("", response_model=list[AlertRead])
async def list_alerts(session: AsyncSession = Depends(get_db)):
    alerts = (await session.execute(select(Alert))).scalars().all()
    return [
        AlertRead(
            alert_id=a.id,
            patient_id=a.patient_id,
            severity=a.severity,
            message=a.message,
            timestamp=a.timestamp,
            is_acknowledged=a.is_acknowledged,
        )
        for a in alerts
    ]


@router.put("/{alert_id}/acknowledge", response_model=AlertAckResponse)
async def acknowledge_alert(
    alert_id: int,
    session: AsyncSession = Depends(get_db),
    connection_manager: ConnectionManager = Depends(get_connection_manager),
):
    stmt = select(Alert).where(Alert.id == alert_id)
    alert = (await session.execute(stmt)).scalars().first()
    if alert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found"
        )

    alert.is_acknowledged = True
    await session.commit()

    await connection_manager.broadcast({"type": "ALERT_ACK", "id": alert_id})

    return AlertAckResponse(alert_id=alert_id, acknowledged=True)

