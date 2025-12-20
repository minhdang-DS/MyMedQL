"""
FastAPI dependencies for authentication
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import text
from typing import Optional, Dict, Any
from app.db.database import get_engine
from app.core.security import verify_token

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Dependency to get current authenticated user from JWT token.
    
    Args:
        token: JWT token from Authorization header
        
    Returns:
        User information dictionary (staff_id, email, role, etc.)
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    # Verify token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract user info from token
    # Extract user info from token
    sub = payload.get("sub")
    role = payload.get("role", "staff") # Default to staff if not specified
    
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        engine = get_engine()
        with engine.connect() as conn:
            if role == "patient":
                # Handle patient
                patient_id = payload.get("id")
                if not patient_id:
                    # Fallback to parsing sub if id not in payload
                    if sub.startswith("patient_"):
                        patient_id = int(sub.replace("patient_", ""))
                    else:
                        patient_id = int(sub)
                
                result = conn.execute(
                    text("SELECT patient_id, first_name, last_name FROM patients WHERE patient_id = :pid"),
                    {"pid": patient_id}
                )
                user = result.fetchone()
                
                if not user:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Patient not found",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                
                return {
                    "id": user.patient_id,
                    "name": f"{user.first_name} {user.last_name}",
                    "role": "patient"
                }
            else:
                # Handle staff
                # sub is staff_id
                result = conn.execute(
                    text("""
                        SELECT staff_id, name, email, role 
                        FROM staff 
                        WHERE staff_id = :staff_id
                    """),
                    {"staff_id": int(sub)}
                )
                user = result.fetchone()
                
                if not user:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User not found",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                
                return {
                    "id": user.staff_id, # Normalize to id
                    "staff_id": user.staff_id, # Keep for compatibility
                    "name": user.name,
                    "email": user.email,
                    "role": user.role
                }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

