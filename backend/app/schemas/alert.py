from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class AlertRead(BaseModel):
    alert_id: int
    patient_id: str
    severity: Literal["warning", "critical"]
    message: str
    timestamp: datetime
    is_acknowledged: bool

    class Config:
        from_attributes = True


class AlertAckResponse(BaseModel):
    alert_id: int
    acknowledged: bool

