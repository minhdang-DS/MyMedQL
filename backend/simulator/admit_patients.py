import sys
from pathlib import Path
from datetime import datetime
from sqlalchemy import text

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.database import get_engine

def admit_patients():
    engine = get_engine()
    with engine.begin() as conn:
        # 1. Ensure patients exist
        print("Creating patients...")
        for i in range(1, 6):
            conn.execute(text("""
                INSERT IGNORE INTO patients (patient_id, first_name, last_name, dob, gender)
                VALUES (:pid, :fname, :lname, '1980-01-01', 'unknown')
            """), {"pid": i, "fname": f"Patient", "lname": f"{i}"})

        # 2. Admit patients (if not already admitted)
        print("Admitting patients...")
        for i in range(1, 6):
            # Check if currently admitted
            result = conn.execute(text("""
                SELECT admission_id FROM admissions 
                WHERE patient_id = :pid AND status = 'admitted'
            """), {"pid": i}).fetchone()
            
            if not result:
                conn.execute(text("""
                    INSERT INTO admissions (patient_id, admitted_at, status)
                    VALUES (:pid, :now, 'admitted')
                """), {"pid": i, "now": datetime.now()})
                print(f"Admitted patient {i}")
            else:
                print(f"Patient {i} already admitted")

if __name__ == "__main__":
    admit_patients()
