from sqlalchemy import Float, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Threshold(Base):
    __tablename__ = "thresholds"
    __table_args__ = (UniqueConstraint("patient_id", name="uq_threshold_patient"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patient.patient_id"), index=True)
    hr_max: Mapped[int] = mapped_column(Integer)
    spo2_min: Mapped[float] = mapped_column(Float)

    patient: Mapped["Patient"] = relationship("Patient", back_populates="thresholds")

