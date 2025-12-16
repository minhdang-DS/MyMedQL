from app.db.base_class import Base  # noqa: F401

# Import all models here so SQLAlchemy/Alembic can discover them
from app.models.alert import Alert  # noqa: F401
from app.models.patient import Patient  # noqa: F401
from app.models.threshold import Threshold  # noqa: F401
from app.models.vital import Vital  # noqa: F401



