from pydantic import BaseModel


class ThresholdRead(BaseModel):
    hr_max: int
    spo2_min: float

    class Config:
        from_attributes = True

