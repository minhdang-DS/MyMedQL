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
                    SELECT alert_id, patient_id, alert_type, message, threshold,
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
                    SELECT alert_id, patient_id, alert_type, message, threshold,
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


@router.get("/unacknowledged")
async def get_all_unacknowledged_alerts(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """
    Get all alerts (acknowledged and unacknowledged) for all patients since simulation start (staff only).
    Returns both acknowledged and unacknowledged alerts, filtered by simulation start time.
    
    Returns:
        List of alert records ordered by: unacknowledged first (newest first), then acknowledged (newest first)
    """
    # Access Control: Only staff can view all alerts
    if current_user["role"] == "patient":
        raise HTTPException(
            status_code=403, 
            detail="You do not have permission to access all unacknowledged alerts"
        )
    
    try:
        engine = get_engine()
        with engine.connect() as conn:
            # Get simulation start time
            start_time_result = conn.execute(
                text("""
                    SELECT config_value
                    FROM simulation_config
                    WHERE config_key = 'simulation_start_time'
                """)
            )
            start_time_row = start_time_result.fetchone()
            start_time_filter = ""
            params = {}
            
            if start_time_row and start_time_row[0]:
                # Filter alerts created after simulation start
                # The start_time is stored as DATETIME string from database NOW(), so we can compare directly
                # Handle both ISO format (2025-12-21T15:21:11.662129) and DATETIME format (2025-12-21 15:21:11.662129)
                start_time_str = start_time_row[0]
                if 'T' in start_time_str:
                    # ISO format: convert to DATETIME
                    start_time_filter = "AND a.created_at >= STR_TO_DATE(:start_time, '%Y-%m-%dT%H:%i:%s.%f')"
                else:
                    # DATETIME format: use directly
                    start_time_filter = "AND a.created_at >= :start_time"
                params["start_time"] = start_time_str
            
            # Get all alerts (acknowledged and unacknowledged) since simulation start
            result = conn.execute(
                text(f"""
                    SELECT a.alert_id, a.patient_id, a.alert_type, a.threshold, a.message, 
                           a.created_at, a.acknowledged_at,
                           p.first_name, p.last_name, p.room_id
                    FROM alerts a
                    JOIN patients p ON a.patient_id = p.patient_id
                    WHERE 1=1 {start_time_filter}
                    ORDER BY 
                        CASE WHEN a.acknowledged_at IS NULL THEN 0 ELSE 1 END,
                        a.created_at DESC
                """),
                params
            )
            alerts = []
            for row in result:
                alert_dict = dict(row._mapping)
                alert_dict["patient_name"] = f"{row.first_name} {row.last_name}"
                alerts.append(alert_dict)
            return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/{alert_id}/acknowledge", status_code=200)
async def acknowledge_alert(
    alert_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Acknowledge an alert by setting its acknowledged_at timestamp.
    Only staff members can acknowledge alerts.
    
    Args:
        alert_id: The ID of the alert to acknowledge.
        
    Returns:
        The updated alert record.
    """
    # Access Control: Only staff can acknowledge alerts
    if current_user["role"] == "patient":
        raise HTTPException(
            status_code=403, 
            detail="You do not have permission to acknowledge alerts"
        )
    
    try:
        engine = get_engine()
        with engine.begin() as conn:
            # Update the acknowledged_at timestamp
            update_result = conn.execute(
                text("""
                    UPDATE alerts
                    SET acknowledged_at = NOW(6)
                    WHERE alert_id = :alert_id
                """),
                {"alert_id": alert_id}
            )
            
            if update_result.rowcount == 0:
                raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found or already acknowledged")
            
            # Fetch the updated alert record
            select_result = conn.execute(
                text("""
                    SELECT alert_id, patient_id, alert_type, threshold, message, 
                           created_at, acknowledged_at
                    FROM alerts
                    WHERE alert_id = :alert_id
                """),
                {"alert_id": alert_id}
            )
            updated_alert = select_result.fetchone()
            
            if not updated_alert:
                raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found after update")
            
            return dict(updated_alert._mapping)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

