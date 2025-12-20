import sys
from pathlib import Path
from sqlalchemy import text
from passlib.context import CryptContext

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.database import get_engine

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_patient_passwords():
    engine = get_engine()
    password = "password123"
    hashed = pwd_context.hash(password)
    
    with engine.begin() as conn:
        print(f"Seeding passwords for patients 1-5 (password: {password})...")
        conn.execute(text("""
            UPDATE patients 
            SET password_hash = :hash 
            WHERE patient_id BETWEEN 1 AND 5
        """), {"hash": hashed})
        print("✅ Successfully seeded patient passwords.")

if __name__ == "__main__":
    seed_patient_passwords()
