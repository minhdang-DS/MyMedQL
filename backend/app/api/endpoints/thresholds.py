"""
Thresholds endpoints - manage vital signs thresholds for alert generation
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import text
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from app.db.database import get_engine
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/api/thresholds", tags=["thresholds"])


# Pydantic models for request/response
class ThresholdUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=64)
    type: str = Field(..., pattern="^(warning|danger)$")
    min_value: float | None = None
    max_value: float | None = None


@router.get("/")
async def list_thresholds() -> List[Dict[str, Any]]:
    """
    List all thresholds.
    
    Returns:
        List of threshold records
    """
    try:
        engine = get_engine()
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT threshold_id, name, type, min_value, max_value, created_at, updated_at FROM thresholds ORDER BY name, type")
            )
            thresholds = [dict(row._mapping) for row in result]
            return thresholds
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{name}")
async def get_thresholds_by_name(name: str) -> List[Dict[str, Any]]:
    """
    Get thresholds by name (e.g., 'heart_rate').
    
    Args:
        name: Threshold name
        
    Returns:
        List of threshold records for the given name (warning and danger)
    """
    try:
        engine = get_engine()
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT threshold_id, name, type, min_value, max_value, created_at, updated_at FROM thresholds WHERE name = :name ORDER BY type"),
                {"name": name}
            )
            thresholds = [dict(row._mapping) for row in result]
            if not thresholds:
                raise HTTPException(status_code=404, detail=f"Threshold '{name}' not found")
            return thresholds
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/{name}/{threshold_type}")
async def update_threshold(
    name: str,
    threshold_type: str,
    threshold_data: ThresholdUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Update a threshold.
    
    Args:
        name: Threshold name (e.g., 'heart_rate')
        threshold_type: Threshold type ('warning' or 'danger')
        threshold_data: Updated threshold data
        
    Returns:
        Updated threshold record
    """
    # Validate threshold_type
    if threshold_type not in ['warning', 'danger']:
        raise HTTPException(status_code=400, detail="threshold_type must be 'warning' or 'danger'")
    
    # Validate that name and type match the URL parameters
    if threshold_data.name != name:
        raise HTTPException(status_code=400, detail="Threshold name in body must match URL parameter")
    if threshold_data.type != threshold_type:
        raise HTTPException(status_code=400, detail="Threshold type in body must match URL parameter")
    
    try:
        engine = get_engine()
        with engine.connect() as conn:
            # Check if threshold exists
            check_result = conn.execute(
                text("SELECT threshold_id FROM thresholds WHERE name = :name AND type = :type"),
                {"name": name, "type": threshold_type}
            )
            existing = check_result.fetchone()
            
            if existing:
                # Update existing threshold
                conn.execute(
                    text("""
                        UPDATE thresholds 
                        SET min_value = :min_value, max_value = :max_value, updated_at = CURRENT_TIMESTAMP(6)
                        WHERE name = :name AND type = :type
                    """),
                    {
                        "name": name,
                        "type": threshold_type,
                        "min_value": threshold_data.min_value,
                        "max_value": threshold_data.max_value
                    }
                )
                conn.commit()
            else:
                # Insert new threshold
                conn.execute(
                    text("""
                        INSERT INTO thresholds (name, type, min_value, max_value)
                        VALUES (:name, :type, :min_value, :max_value)
                    """),
                    {
                        "name": name,
                        "type": threshold_type,
                        "min_value": threshold_data.min_value,
                        "max_value": threshold_data.max_value
                    }
                )
                conn.commit()
            
            # Fetch and return updated threshold
            result = conn.execute(
                text("SELECT threshold_id, name, type, min_value, max_value, created_at, updated_at FROM thresholds WHERE name = :name AND type = :type"),
                {"name": name, "type": threshold_type}
            )
            threshold = result.fetchone()
            return dict(threshold._mapping)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

