"""
Simulator main script - integrates with BE2's generator to insert vital signs data
"""
import sys
import time
import argparse
import threading
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
    Supports load testing with configurable insert rate.
    """
    parser = argparse.ArgumentParser(description="MyMedQL Vital Signs Simulator")
    parser.add_argument(
        "--rate",
        type=float,
        default=5.0,
        help="Target insert rate (inserts per second). Default: 5.0"
    )
    parser.add_argument(
        "--patients",
        type=int,
        default=5,
        help="Number of patients to simulate. Default: 5"
    )
    parser.add_argument(
        "--start-id",
        type=int,
        default=1,
        help="Starting patient ID. Default: 1"
    )
    parser.add_argument(
        "--duration",
        type=int,
        default=0,
        help="Duration in seconds (0 = run indefinitely). Default: 0"
    )
    
    args = parser.parse_args()
    
    num_patients = args.patients
    start_patient_id = args.start_id
    target_rate = args.rate
    duration = args.duration
    
    print(f"🚀 Starting simulator...")
    print(f"   Patients: {num_patients} (IDs: {start_patient_id} to {start_patient_id + num_patients - 1})")
    print(f"   Target rate: {target_rate} inserts/sec")
    if duration > 0:
        print(f"   Duration: {duration} seconds")
    else:
        print(f"   Duration: indefinite (Ctrl+C to stop)")
    
    # Create PatientVitalState instances for each patient
    patients = [PatientVitalState(patient_id) for patient_id in range(start_patient_id, start_patient_id + num_patients)]
    
    insert_count = 0
    start_time = time.time()
    end_time = start_time + duration if duration > 0 else None
    
    # Calculate interval between inserts to achieve target rate
    # If we have N patients, each batch is N inserts
    inserts_per_batch = num_patients
    interval = inserts_per_batch / target_rate if target_rate > 0 else 1.0
    
    try:
        while True:
            # Check if duration limit reached
            if end_time and time.time() >= end_time:
                break
            
            batch_start = time.time()
            
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
                print(f"📊 Progress: {insert_count} records inserted | Rate: {rate:.2f} inserts/sec (target: {target_rate:.2f})")
            
            # Sleep to maintain target rate
            batch_elapsed = time.time() - batch_start
            sleep_time = max(0, interval - batch_elapsed)
            if sleep_time > 0:
                time.sleep(sleep_time)
            
    except KeyboardInterrupt:
        pass
    
    # Final statistics
    elapsed = time.time() - start_time
    rate = insert_count / elapsed if elapsed > 0 else 0
    print(f"\n🛑 Simulator stopped")
    print(f"📊 Total: {insert_count} records inserted in {elapsed:.2f} seconds")
    print(f"📊 Average rate: {rate:.2f} inserts/sec (target: {target_rate:.2f})")
    if target_rate > 0:
        efficiency = (rate / target_rate * 100) if target_rate > 0 else 0
        print(f"📊 Efficiency: {efficiency:.1f}% of target rate")


if __name__ == "__main__":
    main()

