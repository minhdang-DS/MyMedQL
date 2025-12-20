#!/usr/bin/env python3
"""
Generate continuous vital signs data for all patients
This script inserts new vitals every 1 second (1 record per patient per second)
"""
import sys
import time
from pathlib import Path
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.engine import Engine

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from simulator.main import PatientVitalState
from simulator.db_writer import batch_insert_vitals
from app.db.database import get_engine

def get_all_patient_ids(engine: Engine) -> list:
    """Get all patient IDs from the database that have active admissions."""
    with engine.connect() as conn:
        # Only get patients with active admissions (required by database trigger)
        result = conn.execute(text("""
            SELECT DISTINCT p.patient_id 
            FROM patients p
            INNER JOIN admissions a ON p.patient_id = a.patient_id
            WHERE a.status = 'admitted'
            ORDER BY p.patient_id
        """))
        return [row[0] for row in result]

def main():
    print("🚀 Starting continuous vital signs generator for all patients...")
    print("   Will insert 1 vital record per patient every 1 second")
    print("   Press Ctrl+C to stop\n")
    
    # Get all patient IDs from database
    engine = get_engine()
    patient_ids = get_all_patient_ids(engine)
    
    if not patient_ids:
        print("❌ No patients found in database. Please create patients first.")
        return
    
    print(f"📋 Found {len(patient_ids)} patient(s): {patient_ids}\n")
    
    # Create PatientVitalState for each patient
    patients = {pid: PatientVitalState(pid) for pid in patient_ids}
    
    count = 0
    
    try:
        while True:
            # Generate vital data for all patients
            vital_data_list = []
            for patient_id in patient_ids:
                patient = patients[patient_id]
                vital_data = patient.next_tick()
                vital_data['ts'] = datetime.now()
                vital_data_list.append(vital_data)
            
            # Insert all vitals at once
            batch_insert_vitals(vital_data_list)
            count += 1
            
            # Print progress every 10 iterations to avoid spam
            if count % 10 == 0 or count <= 5:
                print(f"[{count:4d}] Inserted {len(vital_data_list)} vital record(s) for {len(patient_ids)} patient(s)")
                # Show sample data from first patient
                sample = vital_data_list[0]
                print(f"      Sample (Patient {sample['patient_id']}): HR={sample['heart_rate']:3d} | "
                      f"SpO2={sample['spo2']:2d}% | "
                      f"BP={sample['bp_systolic']:3d}/{sample['bp_diastolic']:2d} | "
                      f"Temp={sample['temperature_c']:4.1f}°C | "
                      f"Resp={sample['respiration']:2d}")
            
            time.sleep(1)  # Wait 1 second before next insert
        
    except KeyboardInterrupt:
        print(f"\n🛑 Stopped. Generated {count} batches ({count * len(patient_ids)} total vital records)")

if __name__ == "__main__":
    main()

