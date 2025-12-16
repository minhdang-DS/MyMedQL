"""
Authentication endpoints - OAuth2 password flow
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import text
from typing import Dict, Any
from app.db.database import get_engine
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/api", tags=["authentication"])


@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Dict[str, Any]:
    """
    OAuth2 password flow login endpoint.
    
    Args:
        form_data: OAuth2 form data containing username and password
        
    Returns:
        Access token and token type
        
    Raises:
        HTTPException: If credentials are invalid
    """
    try:
        engine = get_engine()
        with engine.connect() as conn:
            # Query staff table by email (username field in OAuth2)
            result = conn.execute(
                text("""
                    SELECT staff_id, name, email, password_hash, role 
                    FROM staff 
                    WHERE email = :email
                """),
                {"email": form_data.username}  # OAuth2 uses 'username' field for email
            )
            user = result.fetchone()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Verify password
            if not verify_password(form_data.password, user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Create access token
            access_token = create_access_token(
                data={
                    "sub": str(user.staff_id),  # Subject (user ID)
                    "email": user.email,
                    "role": user.role,
                    "name": user.name
                }
            )
            
            return {
                "access_token": access_token,
                "token_type": "bearer"
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

