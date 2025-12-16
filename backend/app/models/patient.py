from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Patient(Base):
    __tablename__ = "patient"
    
    patient_id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    thresholds: Mapped["Threshold | None"] = relationship(
        "Threshold", back_populates="patient", uselist=False, cascade="all, delete-orphan"
    )
    vitals: Mapped[list["Vital"]] = relationship(
        "Vital", back_populates="patient", cascade="all, delete-orphan"
    )
    alerts: Mapped[list["Alert"]] = relationship(
        "Alert", back_populates="patient", cascade="all, delete-orphan"
    )



