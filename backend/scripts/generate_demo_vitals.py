#!/usr/bin/env python3
"""
Generate continuous vital signs data for all patients with phased demo.
Ensures each staff member sees the demo phases for their assigned patients:
- Phase 1 (0-5s): All patients stable
- Phase 2 (5-10s): Some patients transition to warning
- Phase 3 (10s-10min): Some patients critical, some warning, rest stable

For each staff member, their assigned patients are distributed across phases
so every staff sees the demo progression.
"""
import sys
import time
import random
from pathlib import Path
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.engine import Engine
from collections import defaultdict

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from simulator.db_writer import batch_insert_vitals
from app.db.database import get_engine


class DemoPatientState:
    """Patient state controller for demo with stable/warning/critical phases"""
    
    # Stable ranges (normal values)
    STABLE_HR = (70, 90)
    STABLE_SPO2 = (96, 100)
    STABLE_BP_SYS = (110, 130)
    STABLE_BP_DIA = (70, 85)
    STABLE_TEMP = (36.5, 37.2)
    STABLE_RESP = (14, 18)
    
    # Warning ranges (slightly abnormal)
    WARNING_HR = (55, 105)  # Below 60 or above 100
    WARNING_SPO2 = (92, 96)  # Below 94
    WARNING_BP_SYS = (85, 145)  # Below 90 or above 140
    WARNING_BP_DIA = (55, 95)  # Below 60 or above 90
    WARNING_TEMP = (35.8, 37.8)  # Below 36.0 or above 37.5
    WARNING_RESP = (10, 22)  # Below 12 or above 20
    
    # Critical ranges (severely abnormal)
    CRITICAL_HR = (40, 130)  # Below 40 or above 120
    CRITICAL_SPO2 = (85, 92)  # Below 90
    CRITICAL_BP_SYS = (75, 165)  # Below 80 or above 160
    CRITICAL_BP_DIA = (45, 105)  # Below 50 or above 100
    CRITICAL_TEMP = (35.0, 39.0)  # Below 35.0 or above 38.5
    CRITICAL_RESP = (8, 32)  # Below 10 or above 30
    
    def __init__(self, patient_id: int, state: str = 'stable'):
        self.patient_id = patient_id
        self.state = state
        self.current_hr = 80
        self.current_temp = 37.0
        self.current_bp_sys = 120
        self.current_bp_dia = 80
        self.current_spo2 = 98
        self.current_resp = 16
        
    def set_state(self, new_state: str):
        """Transition to a new state"""
        self.state = new_state
        # Set initial values based on state
        if new_state == 'stable':
            self.current_hr = random.randint(*self.STABLE_HR)
            self.current_spo2 = random.randint(*self.STABLE_SPO2)
            self.current_bp_sys = random.randint(*self.STABLE_BP_SYS)
            self.current_bp_dia = random.randint(*self.STABLE_BP_DIA)
            self.current_temp = round(random.uniform(*self.STABLE_TEMP), 1)
            self.current_resp = random.randint(*self.STABLE_RESP)
        elif new_state == 'warning':
            # Set to warning range (slightly abnormal)
            self.current_hr = random.choice([
                random.randint(55, 59),  # Low
                random.randint(101, 105)  # High
            ])
            self.current_spo2 = random.randint(92, 93)  # Low
            self.current_bp_sys = random.choice([
                random.randint(85, 89),  # Low
                random.randint(141, 145)  # High
            ])
            self.current_bp_dia = random.choice([
                random.randint(55, 59),  # Low
                random.randint(91, 95)  # High
            ])
            self.current_temp = round(random.choice([
                random.uniform(35.8, 35.9),  # Low
                random.uniform(37.6, 37.8)  # High
            ]), 1)
            self.current_resp = random.choice([
                random.randint(10, 11),  # Low
                random.randint(21, 22)  # High
            ])
        elif new_state == 'critical':
            # Set to critical range (severely abnormal)
            self.current_hr = random.choice([
                random.randint(40, 45),  # Very low
                random.randint(125, 130)  # Very high
            ])
            self.current_spo2 = random.randint(85, 89)  # Very low
            self.current_bp_sys = random.choice([
                random.randint(75, 79),  # Very low
                random.randint(161, 165)  # Very high
            ])
            self.current_bp_dia = random.choice([
                random.randint(45, 49),  # Very low
                random.randint(101, 105)  # Very high
            ])
            self.current_temp = round(random.choice([
                random.uniform(35.0, 35.2),  # Very low
                random.uniform(38.8, 39.0)  # Very high
            ]), 1)
            self.current_resp = random.choice([
                random.randint(8, 9),  # Very low
                random.randint(31, 32)  # Very high
            ])
    
    def next_tick(self) -> dict:
        """Generate next vital signs reading based on current state"""
        # Small random variation within state range
        if self.state == 'stable':
            self.current_hr += random.randint(-2, 2)
            self.current_hr = max(self.STABLE_HR[0], min(self.STABLE_HR[1], self.current_hr))
            self.current_spo2 += random.randint(-1, 1)
            self.current_spo2 = max(self.STABLE_SPO2[0], min(self.STABLE_SPO2[1], self.current_spo2))
            self.current_bp_sys += random.randint(-3, 3)
            self.current_bp_sys = max(self.STABLE_BP_SYS[0], min(self.STABLE_BP_SYS[1], self.current_bp_sys))
            self.current_bp_dia += random.randint(-2, 2)
            self.current_bp_dia = max(self.STABLE_BP_DIA[0], min(self.STABLE_BP_DIA[1], self.current_bp_dia))
            self.current_temp += random.uniform(-0.1, 0.1)
            self.current_temp = max(self.STABLE_TEMP[0], min(self.STABLE_TEMP[1], self.current_temp))
            self.current_resp += random.randint(-1, 1)
            self.current_resp = max(self.STABLE_RESP[0], min(self.STABLE_RESP[1], self.current_resp))
        elif self.state == 'warning':
            self.current_hr += random.randint(-3, 3)
            self.current_hr = max(self.WARNING_HR[0], min(self.WARNING_HR[1], self.current_hr))
            self.current_spo2 += random.randint(-1, 1)
            self.current_spo2 = max(self.WARNING_SPO2[0], min(self.WARNING_SPO2[1], self.current_spo2))
            self.current_bp_sys += random.randint(-4, 4)
            self.current_bp_sys = max(self.WARNING_BP_SYS[0], min(self.WARNING_BP_SYS[1], self.current_bp_sys))
            self.current_bp_dia += random.randint(-3, 3)
            self.current_bp_dia = max(self.WARNING_BP_DIA[0], min(self.WARNING_BP_DIA[1], self.current_bp_dia))
            self.current_temp += random.uniform(-0.2, 0.2)
            self.current_temp = max(self.WARNING_TEMP[0], min(self.WARNING_TEMP[1], self.current_temp))
            self.current_resp += random.randint(-2, 2)
            self.current_resp = max(self.WARNING_RESP[0], min(self.WARNING_RESP[1], self.current_resp))
        elif self.state == 'critical':
            self.current_hr += random.randint(-4, 4)
            self.current_hr = max(self.CRITICAL_HR[0], min(self.CRITICAL_HR[1], self.current_hr))
            self.current_spo2 += random.randint(-2, 1)
            self.current_spo2 = max(self.CRITICAL_SPO2[0], min(self.CRITICAL_SPO2[1], self.current_spo2))
            self.current_bp_sys += random.randint(-5, 5)
            self.current_bp_sys = max(self.CRITICAL_BP_SYS[0], min(self.CRITICAL_BP_SYS[1], self.current_bp_sys))
            self.current_bp_dia += random.randint(-4, 4)
            self.current_bp_dia = max(self.CRITICAL_BP_DIA[0], min(self.CRITICAL_BP_DIA[1], self.current_bp_dia))
            self.current_temp += random.uniform(-0.3, 0.3)
            self.current_temp = max(self.CRITICAL_TEMP[0], min(self.CRITICAL_TEMP[1], self.current_temp))
            self.current_resp += random.randint(-3, 3)
            self.current_resp = max(self.CRITICAL_RESP[0], min(self.CRITICAL_RESP[1], self.current_resp))
        
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


def get_staff_patient_assignments(engine: Engine) -> dict:
    """
    Get patient assignments for each staff member.
    Returns: {staff_id: [patient_id1, patient_id2, ...]}
    """
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT DISTINCT sp.staff_id, p.patient_id
            FROM staff_patients sp
            INNER JOIN patients p ON sp.patient_id = p.patient_id
            INNER JOIN admissions a ON p.patient_id = a.patient_id
            WHERE a.status IN ('verified', 'admitted')
            ORDER BY sp.staff_id, p.patient_id
        """))
        
        staff_patients = defaultdict(list)
        for row in result:
            staff_patients[row.staff_id].append(row.patient_id)
        
        return dict(staff_patients)


def get_all_patient_ids(engine: Engine) -> list:
    """Get all patient IDs from the database that have active admissions."""
    with engine.connect() as conn:
        # Only get patients with active admissions (status = 'verified' or 'admitted')
        result = conn.execute(text("""
            SELECT DISTINCT p.patient_id 
            FROM patients p
            INNER JOIN admissions a ON p.patient_id = a.patient_id
            WHERE a.status IN ('verified', 'admitted')
            ORDER BY p.patient_id
        """))
        return [row[0] for row in result]


def main():
    print("🚀 Starting phased demo vital signs generator...")
    print("   Phase 1 (0-5s): All patients stable")
    print("   Phase 2 (5-10s): Some patients transition to warning")
    print("   Phase 3 (10s-10min): Some patients critical, some warning, rest stable")
    print("   Duration: 10 minutes (600 seconds)")
    print("   Simulating every second for every patient")
    print("   Press Ctrl+C to stop\n")
    
    # Get all patient IDs from database
    engine = get_engine()
    
    # Acknowledge all existing alerts before starting
    print("📋 Acknowledging all existing alerts...")
    with engine.begin() as conn:
        result = conn.execute(
            text("""
                UPDATE alerts
                SET acknowledged_at = NOW(6)
                WHERE acknowledged_at IS NULL
            """)
        )
        acknowledged_count = result.rowcount
        print(f"   ✅ Acknowledged {acknowledged_count} existing alert(s)\n")
    
    # Record simulation start time (use database NOW() to ensure same timezone)
    print("📋 Recording simulation start time...")
    with engine.begin() as conn:
        # Use database NOW() to ensure timezone consistency
        result = conn.execute(
            text("""
                INSERT INTO simulation_config (config_key, config_value, updated_at)
                VALUES ('simulation_start_time', CAST(NOW(6) AS CHAR), NOW(6))
                ON DUPLICATE KEY UPDATE
                    config_value = CAST(NOW(6) AS CHAR),
                    updated_at = NOW(6)
            """)
        )
        # Get the recorded time for display
        time_result = conn.execute(
            text("SELECT config_value FROM simulation_config WHERE config_key = 'simulation_start_time'")
        )
        recorded_time = time_result.fetchone()[0]
        print(f"   ✅ Simulation start time recorded: {recorded_time}\n")
    
    # Get staff-patient assignments
    staff_patients_map = get_staff_patient_assignments(engine)
    
    if not staff_patients_map:
        print("❌ No staff-patient assignments found. Please create staff-patient assignments first.")
        return
    
    # Get all unique patient IDs
    all_patient_ids = set()
    for patient_list in staff_patients_map.values():
        all_patient_ids.update(patient_list)
    patient_ids = sorted(list(all_patient_ids))
    
    if not patient_ids:
        print("❌ No patients found in database. Please create patients first.")
        return
    
    print(f"📋 Found {len(staff_patients_map)} staff member(s) with patient assignments")
    for staff_id, assigned_patients in staff_patients_map.items():
        print(f"   Staff {staff_id}: {len(assigned_patients)} patient(s) - {assigned_patients}")
    print(f"\n📋 Total unique patients: {len(patient_ids)} - {patient_ids}\n")
    
    # Create DemoPatientState for each patient (all start stable)
    patients = {pid: DemoPatientState(pid, 'stable') for pid in patient_ids}
    
    # For each staff member, distribute their patients across phases
    # This ensures every staff sees the demo progression
    warning_patients = set()
    critical_patients = set()
    stable_patients = set()
    
    for staff_id, assigned_patients in staff_patients_map.items():
        if not assigned_patients:
            continue
        
        # For each staff, distribute their patients: 30% warning, 20% critical, 50% stable
        num_warning = max(1, int(len(assigned_patients) * 0.3))
        num_critical = max(1, int(len(assigned_patients) * 0.2))
        
        # Shuffle this staff's patients
        shuffled = assigned_patients.copy()
        random.shuffle(shuffled)
        
        # Assign phases for this staff's patients
        staff_warning = shuffled[:num_warning]
        staff_critical = shuffled[num_warning:num_warning + num_critical]
        staff_stable = shuffled[num_warning + num_critical:]
        
        warning_patients.update(staff_warning)
        critical_patients.update(staff_critical)
        stable_patients.update(staff_stable)
        
        print(f"📊 Staff {staff_id} state distribution:")
        print(f"   Stable: {len(staff_stable)} patient(s) - {staff_stable}")
        print(f"   Warning: {len(staff_warning)} patient(s) - {staff_warning}")
        print(f"   Critical: {len(staff_critical)} patient(s) - {staff_critical}")
    
    # Convert to lists for easier handling
    warning_patients = list(warning_patients)
    critical_patients = list(critical_patients)
    stable_patients = list(stable_patients)
    
    print(f"\n📊 Overall state distribution:")
    print(f"   Stable: {len(stable_patients)} patient(s) - {stable_patients}")
    print(f"   Warning: {len(warning_patients)} patient(s) - {warning_patients}")
    print(f"   Critical: {len(critical_patients)} patient(s) - {critical_patients}\n")
    
    # Phase timings
    PHASE1_END = 5  # 0-5 seconds: all stable
    PHASE2_END = 10  # 5-10 seconds: warning phase
    TOTAL_DURATION = 600  # 10 minutes
    
    count = 0
    start_time = time.time()
    
    try:
        while True:
            elapsed = time.time() - start_time
            current_second = int(elapsed)
            
            # Check if demo duration reached
            if elapsed >= TOTAL_DURATION:
                print(f"\n✅ Demo completed! Ran for {elapsed:.1f} seconds")
                break
            
            # Phase transitions
            if current_second == PHASE1_END:
                print(f"\n📊 [{current_second}s] Phase 2 starting: Transitioning {len(warning_patients)} patient(s) to WARNING state")
                for pid in warning_patients:
                    patients[pid].set_state('warning')
            
            if current_second == PHASE2_END:
                print(f"\n📊 [{current_second}s] Phase 3 starting: Transitioning {len(critical_patients)} patient(s) to CRITICAL state")
                for pid in critical_patients:
                    patients[pid].set_state('critical')
            
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
            
            # Print progress every 10 iterations or at phase transitions
            if count % 10 == 0 or current_second in [PHASE1_END, PHASE2_END] or count <= 5:
                # Count patients in each state
                state_counts = {'stable': 0, 'warning': 0, 'critical': 0}
                for pid in patient_ids:
                    state_counts[patients[pid].state] += 1
                
                print(f"[{current_second:3d}s] Batch {count:4d} | "
                      f"Stable: {state_counts['stable']}, "
                      f"Warning: {state_counts['warning']}, "
                      f"Critical: {state_counts['critical']} | "
                      f"Sample (P{patient_ids[0]}): HR={vital_data_list[0]['heart_rate']:3d}, "
                      f"SpO2={vital_data_list[0]['spo2']:2d}%")
            
            # Wait 1 second before next iteration
            time.sleep(1)
        
    except KeyboardInterrupt:
        elapsed = time.time() - start_time
        print(f"\n🛑 Stopped by user after {elapsed:.1f} seconds")
        print(f"   Generated {count} batches ({count * len(patient_ids)} total vital records)")
    
    # Final statistics
    elapsed = time.time() - start_time
    total_records = count * len(patient_ids)
    print(f"\n📊 Final Statistics:")
    print(f"   Duration: {elapsed:.1f} seconds ({elapsed/60:.1f} minutes)")
    print(f"   Batches: {count}")
    print(f"   Total records: {total_records}")
    print(f"   Average rate: {total_records/elapsed:.2f} records/second")


if __name__ == "__main__":
    main()
