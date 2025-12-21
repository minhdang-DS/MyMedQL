"""
Alerts endpoints - fetch alerts for patients
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import text
from typing import List, Dict, Any, Optional
from app.db.database import get_engine
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("/patient/{patient_id}")
async def get_patient_alerts(
    patient_id: int,
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """
    Get alerts for a specific patient.
    
    Args:
        patient_id: Patient ID
        limit: Maximum number of alerts to return (default: 50, max: 200)
        
    Returns:
        List of alert records ordered by created_at (newest first)
    """
    # Clamp limit to reasonable range
    limit = max(1, min(limit, 200))
    
    try:
        # Access Control:
        # - Staff can access any patient
        # - Patients can only access their own data
        if current_user["role"] == "patient" and current_user["id"] != patient_id:
             raise HTTPException(
                status_code=403, 
                detail="You do not have permission to access this patient's alerts"
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
            
            # Get alerts for patient
            result = conn.execute(
                text("""
                    SELECT alert_id, patient_id, alert_type, message, 
                           created_at, acknowledged_at
                    FROM alerts 
                    WHERE patient_id = :pid 
                    ORDER BY created_at DESC 
                    LIMIT :limit
                """),
                {"pid": patient_id, "limit": limit}
            )
            alerts = [dict(row._mapping) for row in result]
            return alerts
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/patient/{patient_id}/unacknowledged")
async def get_unacknowledged_alerts(
    patient_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """
    Get unacknowledged alerts for a specific patient.
    
    Args:
        patient_id: Patient ID
        
    Returns:
        List of unacknowledged alert records ordered by created_at (newest first)
    """
    try:
        # Access Control:
        # - Staff can access any patient
        # - Patients can only access their own data
        if current_user["role"] == "patient" and current_user["id"] != patient_id:
             raise HTTPException(
                status_code=403, 
                detail="You do not have permission to access this patient's alerts"
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
            
            # Get unacknowledged alerts for patient
            result = conn.execute(
                text("""
                    SELECT alert_id, patient_id, alert_type, message, 
                           created_at, acknowledged_at
                    FROM alerts 
                    WHERE patient_id = :pid 
                      AND acknowledged_at IS NULL
                    ORDER BY created_at DESC
                """),
                {"pid": patient_id}
            )
            alerts = [dict(row._mapping) for row in result]
            return alerts
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

