"""
Health check schemas
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class HealthCheckBase(BaseModel):
    """Base health check schema"""
    status: str = Field(..., description="Health check status message")


class HealthCheckCreate(HealthCheckBase):
    """Schema for creating health check record"""
    pass


class HealthCheckResponse(HealthCheckBase):
    """Schema for health check response"""
    id: int = Field(..., description="Record ID")
    checked_at: datetime = Field(..., description="Timestamp of check")
    
    class Config:
        from_attributes = True


class HealthStatus(BaseModel):
    """System health status"""
    status: str = Field(..., description="Overall status: healthy/unhealthy")
    database: str = Field(..., description="Database status")
    timestamp: str = Field(..., description="Check timestamp")
    error: Optional[str] = Field(None, description="Error message if any")

