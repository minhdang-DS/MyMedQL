from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.threshold import ThresholdRead


class PatientRead(BaseModel):
    patient_id: str
    name: Optional[str] = None
    created_at: datetime
    thresholds: Optional[ThresholdRead] = None

    class Config:
        from_attributes = True

