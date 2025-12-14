"""
API dependencies
Reusable dependencies for route handlers
"""
from fastapi import Depends, HTTPException, Header
from typing import Optional

from ..db.database import get_db
from ..config import get_settings

settings = get_settings()


# Example: Database dependency (already in db/database.py but shown here for reference)
def get_database():
    """Get database connection dependency"""
    return get_db()


# Example: API key authentication (for future use)
async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """
    Verify API key from header
    
    Args:
        x_api_key: API key from X-API-Key header
        
    Raises:
        HTTPException: If API key is invalid
    """
    # This is a placeholder - implement your actual API key verification
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    # In production, verify against database or environment variable
    # if x_api_key != settings.api_key:
    #     raise HTTPException(status_code=403, detail="Invalid API key")
    
    return x_api_key


# Example: Current user dependency (for future authentication)
async def get_current_user(api_key: str = Depends(verify_api_key)):
    """
    Get current authenticated user
    
    Args:
        api_key: Verified API key
        
    Returns:
        User object
    """
    # This is a placeholder - implement your actual user retrieval
    # user = get_user_by_api_key(api_key)
    # if not user:
    #     raise HTTPException(status_code=404, detail="User not found")
    # return user
    pass

