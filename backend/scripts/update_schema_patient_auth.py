import sys
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.database import get_engine

def update_schema():
    engine = get_engine()
    with engine.begin() as conn:
        try:
            print("Attempting to add password_hash column to patients table...")
            conn.execute(text("""
                ALTER TABLE patients 
                ADD COLUMN password_hash CHAR(60) DEFAULT NULL AFTER contact_info
            """))
            print("✅ Successfully added password_hash column.")
        except OperationalError as e:
            if "Duplicate column name" in str(e):
                print("ℹ️ Column password_hash already exists.")
            else:
                print(f"❌ Error updating schema: {e}")
                raise

if __name__ == "__main__":
    update_schema()
