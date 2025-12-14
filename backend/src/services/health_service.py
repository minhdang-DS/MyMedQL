"""
Health check service
Business logic for health check operations
"""
from typing import List, Dict, Any
from datetime import datetime


class HealthService:
    """Service for health check operations"""
    
    @staticmethod
    def format_health_record(record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format a health check record
        
        Args:
            record: Raw database record
            
        Returns:
            Formatted record
        """
        if record.get('checked_at') and isinstance(record['checked_at'], datetime):
            record['checked_at'] = record['checked_at'].isoformat()
        return record
    
    @staticmethod
    def format_health_records(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Format multiple health check records
        
        Args:
            records: List of raw database records
            
        Returns:
            List of formatted records
        """
        return [HealthService.format_health_record(record) for record in records]

