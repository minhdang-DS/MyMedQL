from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Vital(Base):
    __tablename__ = "vitals"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patient.patient_id"), index=True)
    sensor_id: Mapped[str] = mapped_column(String(64))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    heart_rate: Mapped[int] = mapped_column(Integer)
    spo2: Mapped[float] = mapped_column(Float)
    systolic_bp: Mapped[int] = mapped_column(Integer)
    diastolic_bp: Mapped[int] = mapped_column(Integer)
    body_temp: Mapped[float] = mapped_column(Float)
    ingested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    patient: Mapped["Patient"] = relationship("Patient", back_populates="vitals")



