"""
Analytics endpoints - stored procedure integration
"""
from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from typing import List, Dict, Any
from app.db.database import get_engine

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/patients/{patient_id}/summary")
async def get_patient_summary(patient_id: int) -> Dict[str, Any]:
    """
    Get patient summary using stored procedure.
    Returns current vitals and active alert count.
    
    Args:
        patient_id: Patient ID
        
    Returns:
        Patient summary with current vitals and alert count
    """
    try:
        engine = get_engine()
        with engine.connect() as conn:
            # Call stored procedure
            result = conn.execute(
                text("CALL sp_get_patient_summary(:id)"),
                {"id": patient_id}
            )
            
            # MySQL stored procedures return result sets
            # Fetch the first row (or iterate if multiple result sets)
            summary = result.fetchone()
            
            if not summary:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Patient {patient_id} summary not found"
                )
            
            return dict(summary._mapping)
    except HTTPException:
        raise
    except Exception as e:
        # Check if it's a procedure not found error
        if "does not exist" in str(e).lower() or "procedure" in str(e).lower():
            raise HTTPException(
                status_code=501, 
                detail=f"Stored procedure not available: {str(e)}. BE2 needs to create sp_get_patient_summary."
            )
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/hourly-stats")
async def get_hourly_stats() -> List[Dict[str, Any]]:
    """
    Get aggregated hourly statistics using stored procedure.
    
    Returns:
        List of hourly aggregated vital signs statistics
    """
    try:
        engine = get_engine()
        with engine.connect() as conn:
            # Call stored procedure
            result = conn.execute(
                text("CALL sp_aggregate_hourly_stats()")
            )
            
            # Fetch all rows from result set
            stats = [dict(row._mapping) for row in result]
            
            return stats
    except Exception as e:
        # Check if it's a procedure not found error
        if "does not exist" in str(e).lower() or "procedure" in str(e).lower():
            raise HTTPException(
                status_code=501, 
                detail=f"Stored procedure not available: {str(e)}. BE2 needs to create sp_aggregate_hourly_stats."
            )
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

