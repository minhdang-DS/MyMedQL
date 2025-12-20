import sys
from pathlib import Path
from sqlalchemy import text
from passlib.context import CryptContext

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.database import get_engine

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_staff_users():
    engine = get_engine()
    password = "password123"
    hashed = pwd_context.hash(password)
    
    with engine.begin() as conn:
        print(f"Seeding staff users (password: {password})...")
        
        # Insert or update Admin
        conn.execute(text("""
            INSERT INTO staff (name, email, password_hash, role, metadata)
            VALUES ('Admin User', 'admin@example.com', :hash, 'admin', '{"department": "Administration"}')
            ON DUPLICATE KEY UPDATE password_hash = :hash
        """), {"hash": hashed})
        
        # Insert or update Doctor
        conn.execute(text("""
            INSERT INTO staff (name, email, password_hash, role, metadata)
            VALUES ('Dr. Alice Smith', 'doctor@example.com', :hash, 'doctor', '{"department": "Cardiology"}')
            ON DUPLICATE KEY UPDATE password_hash = :hash
        """), {"hash": hashed})
        
        # Insert or update Nurse
        conn.execute(text("""
            INSERT INTO staff (name, email, password_hash, role, metadata)
            VALUES ('Nurse Bob', 'nurse@example.com', :hash, 'nurse', '{"department": "ICU"}')
            ON DUPLICATE KEY UPDATE password_hash = :hash
        """), {"hash": hashed})

        print("✅ Successfully seeded staff users.")
        print("Credentials:")
        print(f"  Admin: admin@example.com / {password}")
        print(f"  Doctor: doctor@example.com / {password}")
        print(f"  Nurse: nurse@example.com / {password}")

if __name__ == "__main__":
    seed_staff_users()
