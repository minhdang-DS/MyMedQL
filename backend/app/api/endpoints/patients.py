"""
Patient endpoints - read-only API for patient data
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import text
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import date
from app.db.database import get_engine
from app.api.dependencies import get_current_user
from app.core.encryption import encrypt_medical_history
from app.api.endpoints import websocket

router = APIRouter(prefix="/api/patients", tags=["patients"])


# Pydantic models for request/response
class PatientCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    dob: Optional[date] = None
    gender: Optional[str] = Field(None, pattern="^(male|female|other|unknown)$")
    contact_info: Optional[Dict[str, Any]] = None
    medical_history: Optional[str] = None  # Plain text, will be encrypted


@router.get("/")
async def list_patients() -> List[Dict[str, Any]]:
    """
    List all patients.
    
    Returns:
        List of patient records
    """
    try:
        engine = get_engine()
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT patient_id, first_name, last_name, dob, gender, room_id, created_at FROM patients ORDER BY patient_id")
            )
            patients = [dict(row._mapping) for row in result]
            return patients
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{patient_id}")
async def get_patient(patient_id: int) -> Dict[str, Any]:
    print(f"DEBUG: get_patient called for {patient_id}")
    """
    Get patient details by ID.
    Note: medical_history is encrypted and not returned.
    
    Args:
        patient_id: Patient ID
        
    Returns:
        Patient record (without encrypted medical_history)
    """
    try:
        engine = get_engine()
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT patient_id, first_name, last_name, dob, gender, 
                           contact_info, room_id, created_at, updated_at 
                    FROM patients 
                    WHERE patient_id = :pid
                """),
                {"pid": patient_id}
            )
            patient = result.fetchone()
            
            if not patient:
                raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
            
            return dict(patient._mapping)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{patient_id}/history")
async def get_patient_history(
    patient_id: int, 
    limit: int = 100,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    print(f"DEBUG: get_patient_history called for {patient_id}")
    """
    Get patient vital signs history.
    
    Args:
        patient_id: Patient ID
        limit: Maximum number of records to return (default: 100, max: 1000)
        
    Returns:
        List of vital signs records ordered by timestamp (newest first)
    """
    # Clamp limit to reasonable range
    limit = max(1, min(limit, 1000))
    
    try:
        # Access Control:
        # - Staff can access any patient
        # - Patients can only access their own data
        if current_user["role"] == "patient" and current_user["id"] != patient_id:
             raise HTTPException(
                status_code=403, 
                detail="You do not have permission to access this patient's history"
            )

        engine = get_engine()
        with engine.connect() as conn:
            # First verify patient exists
            patient_check = conn.execute(
                text("SELECT patient_id FROM patients WHERE patient_id = :pid"),
                {"pid": patient_id}
            )
            if not patient_check.fetchone():
                raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
            
            # Get vital signs history
            result = conn.execute(
                text("""
                    SELECT vitals_id, patient_id, device_id, ts, heart_rate, spo2,
                           bp_systolic, bp_diastolic, temperature_c, respiration,
                           metadata, created_at
                    FROM vitals 
                    WHERE patient_id = :pid 
                    ORDER BY ts DESC 
                    LIMIT :limit
                """),
                {"pid": patient_id, "limit": limit}
            )
            vitals = [dict(row._mapping) for row in result]
            return vitals
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{patient_id}/device")
async def get_patient_device(
    patient_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get the currently assigned device for a patient.
    
    Args:
        patient_id: Patient ID
        
    Returns:
        Device information (device_type, serial_number) or None if no active assignment
    """
    try:
        # Access Control:
        # - Staff can access any patient
        # - Patients can only access their own data
        if current_user["role"] == "patient" and current_user["id"] != patient_id:
             raise HTTPException(
                status_code=403, 
                detail="You do not have permission to access this patient's device information"
            )

        engine = get_engine()
        with engine.connect() as conn:
            # First verify patient exists
            patient_check = conn.execute(
                text("SELECT patient_id FROM patients WHERE patient_id = :pid"),
                {"pid": patient_id}
            )
            if not patient_check.fetchone():
                raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
            
            # Get active device assignment with manufacturer from metadata
            result = conn.execute(
                text("""
                    SELECT 
                        d.device_type, 
                        d.serial_number, 
                        d.device_id,
                        JSON_UNQUOTE(JSON_EXTRACT(d.metadata, '$.manufacturer')) as manufacturer
                    FROM devices d
                    INNER JOIN device_assignments da ON d.device_id = da.device_id
                    WHERE da.patient_id = :pid 
                      AND da.assigned_to IS NULL
                    ORDER BY da.assigned_from DESC
                    LIMIT 1
                """),
                {"pid": patient_id}
            )
            device = result.fetchone()
            
            if device:
                device_dict = dict(device._mapping)
                # Handle None manufacturer
                if device_dict.get('manufacturer') is None:
                    device_dict['manufacturer'] = 'Unknown'
                return device_dict
            else:
                return {"device_type": None, "serial_number": None, "device_id": None, "manufacturer": None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/", status_code=201)
async def create_patient(
    patient_data: PatientCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Create a new patient (protected endpoint).
    Medical history is encrypted before storage.
    
    Args:
        patient_data: Patient data including medical_history (plain text)
        current_user: Current authenticated user (from dependency)
        
    Returns:
        Created patient record (without encrypted medical_history)
    """
    try:
        # Encrypt medical history if provided
        encrypted_history = None
        if patient_data.medical_history:
            encrypted_history = encrypt_medical_history(patient_data.medical_history)
        
        engine = get_engine()
        with engine.begin() as conn:  # Use begin() for transaction
            # Insert patient
            result = conn.execute(
                text("""
                    INSERT INTO patients (
                        first_name, last_name, dob, gender, 
                        contact_info, medical_history
                    )
                    VALUES (
                        :first_name, :last_name, :dob, :gender,
                        :contact_info, :medical_history
                    )
                """),
                {
                    "first_name": patient_data.first_name,
                    "last_name": patient_data.last_name,
                    "dob": patient_data.dob,
                    "gender": patient_data.gender or "unknown",
                    "contact_info": patient_data.contact_info,
                    "medical_history": encrypted_history
                }
            )
            
            # Get the inserted patient
            patient_id = result.lastrowid
            patient_result = conn.execute(
                text("""
                    SELECT patient_id, first_name, last_name, dob, gender,
                           contact_info, created_at, updated_at
                    FROM patients
                    WHERE patient_id = :pid
                """),
                {"pid": patient_id}
            )
            patient = patient_result.fetchone()
            
            return dict(patient._mapping)
    except ValueError as e:
        # Encryption key error
        raise HTTPException(status_code=500, detail=f"Encryption error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{patient_id}", status_code=204)
async def delete_patient(
    patient_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> None:
    """
    Delete a patient by ID (protected endpoint).
    This will also cascade delete related records (admissions, vitals, etc.)
    based on database foreign key constraints.
    
    Args:
        patient_id: Patient ID to delete
        current_user: Current authenticated user (from dependency)
        
    Returns:
        No content (204)
    """
    try:
        engine = get_engine()
        with engine.begin() as conn:  # Use begin() for transaction
            # First verify patient exists
            patient_check = conn.execute(
                text("SELECT patient_id FROM patients WHERE patient_id = :pid"),
                {"pid": patient_id}
            )
            if not patient_check.fetchone():
                raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
            
            # Delete patient (cascade will handle related records)
            conn.execute(
                text("DELETE FROM patients WHERE patient_id = :pid"),
                {"pid": patient_id}
            )
            
            return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/{patient_id}/emergency", status_code=201)
async def create_emergency_alert(
    patient_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Create an emergency alert for a patient (protected endpoint).
    This will create an alert that appears in staff live alerts.
    
    Args:
        patient_id: Patient ID
        
    Returns:
        Created alert record
    """
    try:
        engine = get_engine()
        with engine.begin() as conn:
            # Verify patient exists and get patient info
            patient_result = conn.execute(
                text("""
                    SELECT patient_id, first_name, last_name, room_id
                    FROM patients
                    WHERE patient_id = :pid
                """),
                {"pid": patient_id}
            )
            patient = patient_result.fetchone()
            
            if not patient:
                raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
            
            patient_dict = dict(patient._mapping)
            patient_name = f"{patient_dict['first_name']} {patient_dict['last_name']}"
            room_id = patient_dict.get('room_id') or f"Room {patient_id}"
            
            # Create emergency alert
            alert_result = conn.execute(
                text("""
                    INSERT INTO alerts (
                        patient_id,
                        alert_type,
                        severity,
                        message,
                        created_at
                    )
                    VALUES (
                        :patient_id,
                        'emergency_help',
                        'critical',
                        :message,
                        NOW(6)
                    )
                """),
                {
                    "patient_id": patient_id,
                    "message": f"Emergency help requested by {patient_name} at {room_id}. Please come immediately."
                }
            )
            
            alert_id = alert_result.lastrowid
            
            # Get the created alert
            alert_result = conn.execute(
                text("""
                    SELECT alert_id, patient_id, alert_type, severity, message, created_at
                    FROM alerts
                    WHERE alert_id = :alert_id
                """),
                {"alert_id": alert_id}
            )
            alert = alert_result.fetchone()
            alert_dict = dict(alert._mapping)
            
            # Broadcast emergency alert via WebSocket
            # Get manager reference dynamically (it's set during startup)
            manager = websocket.manager
            if manager:
                alert_message = {
                    "type": "emergency_alert",
                    "alert": {
                        "id": f"emergency-{patient_id}",
                        "type": "Emergency Help Request",
                        "patient": patient_name,
                        "severity": "Critical",
                        "time": alert_dict["created_at"].strftime("%H:%M:%S") if hasattr(alert_dict["created_at"], "strftime") else str(alert_dict["created_at"]),
                        "desc": alert_dict["message"],
                        "patient_id": patient_id
                    }
                }
                print(f"🚨 Broadcasting emergency alert: {alert_message}")
                await manager.broadcast(alert_message)
                print(f"✅ Emergency alert broadcasted to {len(manager.active_connections)} connected clients")
            else:
                print("⚠️ Warning: WebSocket manager not available for emergency alert broadcast")
            
            return alert_dict
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

