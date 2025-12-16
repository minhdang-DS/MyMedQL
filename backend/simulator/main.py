"""
Simulator main script - integrates with BE2's generator to insert vital signs data
"""
import sys
import time
from datetime import datetime
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from simulator.db_writer import batch_insert_vitals

# Import BE2's generator (will be created by BE2)
try:
    from simulator.generator import PatientVitalState
except ImportError:
    print("⚠️  Warning: simulator.generator not found. BE2 needs to create generator.py")
    print("   For now, using a mock implementation for testing...")
    
    # Mock implementation for testing until BE2 creates the real one
    class PatientVitalState:
        def __init__(self, patient_id: int):
            self.patient_id = patient_id
            self.current_hr = 80
            self.current_temp = 37.0
            self.current_bp_sys = 120
            self.current_bp_dia = 80
            self.current_spo2 = 98
            self.current_resp = 16
        
        def next_tick(self) -> dict:
            """Generate next vital signs reading"""
            import random
            # Simple random walk
            self.current_hr += random.randint(-2, 2)
            self.current_temp += random.uniform(-0.1, 0.1)
            self.current_bp_sys += random.randint(-3, 3)
            self.current_bp_dia += random.randint(-2, 2)
            self.current_spo2 += random.randint(-1, 1)
            self.current_resp += random.randint(-1, 1)
            
            # Clamp values to reasonable ranges
            self.current_hr = max(60, min(120, self.current_hr))
            self.current_temp = max(36.0, min(38.5, self.current_temp))
            self.current_bp_sys = max(100, min(140, self.current_bp_sys))
            self.current_bp_dia = max(60, min(90, self.current_bp_dia))
            self.current_spo2 = max(95, min(100, self.current_spo2))
            self.current_resp = max(12, min(20, self.current_resp))
            
            return {
                "patient_id": self.patient_id,
                "device_id": None,
                "ts": datetime.now(),
                "heart_rate": int(self.current_hr),
                "spo2": int(self.current_spo2),
                "bp_systolic": int(self.current_bp_sys),
                "bp_diastolic": int(self.current_bp_dia),
                "temperature_c": round(self.current_temp, 2),
                "respiration": int(self.current_resp),
                "metadata": None
            }


def main():
    """
    Main simulator loop - generates and inserts vital signs for multiple patients
    """
    # Default: 5 patients, starting from patient_id 1
    # In production, you might query the database for actual patient IDs
    num_patients = 5
    start_patient_id = 1
    
    print(f"🚀 Starting simulator for {num_patients} patients...")
    print(f"   Patient IDs: {start_patient_id} to {start_patient_id + num_patients - 1}")
    
    # Create PatientVitalState instances for each patient
    patients = [PatientVitalState(patient_id) for patient_id in range(start_patient_id, start_patient_id + num_patients)]
    
    insert_count = 0
    start_time = time.time()
    
    try:
        while True:
            # Generate vital signs for all patients
            vital_data_list = []
            for patient in patients:
                vital_data = patient.next_tick()
                vital_data_list.append(vital_data)
            
            # Batch insert all vitals
            batch_insert_vitals(vital_data_list)
            insert_count += len(vital_data_list)
            
            # Log progress every 10 inserts
            if insert_count % 10 == 0:
                elapsed = time.time() - start_time
                rate = insert_count / elapsed if elapsed > 0 else 0
                print(f"📊 Progress: {insert_count} records inserted | Rate: {rate:.2f} inserts/sec")
            
            # Wait 1 second before next batch
            time.sleep(1)
            
    except KeyboardInterrupt:
        elapsed = time.time() - start_time
        rate = insert_count / elapsed if elapsed > 0 else 0
        print(f"\n🛑 Simulator stopped by user")
        print(f"📊 Total: {insert_count} records inserted in {elapsed:.2f} seconds")
        print(f"📊 Average rate: {rate:.2f} inserts/sec")


if __name__ == "__main__":
    main()

