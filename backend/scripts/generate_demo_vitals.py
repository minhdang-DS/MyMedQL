#!/usr/bin/env python3
"""
Generate 10 minutes of continuous vital signs data for patient 1
This script inserts new vitals every 1 second for demo purposes
"""
import sys
import time
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from simulator.main import PatientVitalState
from simulator.db_writer import batch_insert_vitals

def main():
    print("🚀 Starting continuous vital signs generator for patient 1...")
    print("   Will insert new vitals every 1 second")
    print("   This will create 600 records over 10 minutes")
    print("   Press Ctrl+C to stop early\n")
    
    patient = PatientVitalState(1)
    count = 0
    max_records = 600  # 10 minutes * 60 seconds / 1 second per record
    
    try:
        while count < max_records:
            vital_data = patient.next_tick()
            vital_data['ts'] = datetime.now()
            
            batch_insert_vitals([vital_data])
            count += 1
            
            # Print progress every 10 records to avoid spam
            if count % 10 == 0 or count <= 5:
                print(f"[{count:3d}/{max_records}] HR={vital_data['heart_rate']:3d} | "
                      f"SpO2={vital_data['spo2']:2d}% | "
                      f"BP={vital_data['bp_systolic']:3d}/{vital_data['bp_diastolic']:2d} | "
                      f"Temp={vital_data['temperature_c']:4.1f}°C | "
                      f"Resp={vital_data['respiration']:2d}")
            
            if count < max_records:
                time.sleep(1)  # Wait 1 second before next insert
        
        print(f"\n✅ Completed! Generated {count} vital signs records over 10 minutes")
    except KeyboardInterrupt:
        print(f"\n🛑 Stopped early. Generated {count} vital signs records")

if __name__ == "__main__":
    main()

