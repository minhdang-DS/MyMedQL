"""
Health check endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List, Dict, Any

from ...db.database import get_db

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint for Docker and monitoring
    
    Returns:
        Health status with database connection status
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT 1 as health")
        cursor.fetchone()
        cursor.close()
        conn.close()
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "not_initialized",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.get("/api/health-check")
async def get_health_check_records() -> Dict[str, Any]:
    """
    Get records from health_check table
    
    Returns:
        List of health check records
    """
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, status, checked_at 
            FROM health_check 
            ORDER BY id DESC 
            LIMIT 5
        """)
        
        rows = cursor.fetchall()
        
        # Convert datetime objects to ISO format strings
        for row in rows:
            if row.get('checked_at'):
                row['checked_at'] = row['checked_at'].isoformat()
        
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "count": len(rows),
            "data": rows
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/health-check")
async def create_health_check_record(status: str = "Manual check") -> Dict[str, Any]:
    """
    Create a new health check record
    
    Args:
        status: Status message for the health check
        
    Returns:
        Success message with created record ID
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO health_check (status) VALUES (%s)",
            (status,)
        )
        
        conn.commit()
        record_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": "Health check record created",
            "id": record_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

