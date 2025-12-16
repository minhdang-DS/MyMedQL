from datetime import datetime

from pydantic import BaseModel, Field


class VitalCreate(BaseModel):
    patient_id: str
    sensor_id: str
    timestamp: datetime
    heart_rate: int = Field(..., ge=0, le=300)
    spo2: float = Field(..., ge=0, le=100)
    systolic_bp: int
    diastolic_bp: int
    body_temp: float


class VitalRead(VitalCreate):
    id: int

    class Config:
        from_attributes = True

