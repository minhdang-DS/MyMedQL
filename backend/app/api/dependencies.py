from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from app.core.security import verify_token
from app.db.session import get_db
from app.websockets.manager import ConnectionManager

# Connection manager singleton
connection_manager = ConnectionManager()

# OAuth2 scheme for authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def get_connection_manager():
    """Get WebSocket connection manager instance."""
    return connection_manager


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Dependency to get the current authenticated user from JWT token.
    """
    try:
        payload = verify_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


__all__ = ["get_db", "get_connection_manager", "connection_manager", "get_current_user", "oauth2_scheme"]



