"""
Database connection management
"""
import mysql.connector
from mysql.connector import Error
from mysql.connector.pooling import MySQLConnectionPool
from fastapi import HTTPException
import time
from typing import Optional

from ..config import get_settings

settings = get_settings()

# Global connection pool
_db_pool: Optional[MySQLConnectionPool] = None


def create_db_pool() -> Optional[MySQLConnectionPool]:
    """
    Create MySQL connection pool with retry logic
    
    Returns:
        MySQLConnectionPool or None if connection fails
    """
    global _db_pool
    
    max_retries = 5
    retry_delay = 5
    
    db_config = {
        'host': settings.db_host,
        'port': settings.db_port,
        'user': settings.db_user,
        'password': settings.db_password,
        'database': settings.db_name,
        'pool_name': settings.db_pool_name,
        'pool_size': settings.db_pool_size,
        'pool_reset_session': True
    }
    
    for attempt in range(max_retries):
        try:
            print(f"📡 Attempting to connect to database (attempt {attempt + 1}/{max_retries})...")
            print(f"   Host: {db_config['host']}:{db_config['port']}")
            print(f"   Database: {db_config['database']}")
            
            pool = mysql.connector.pooling.MySQLConnectionPool(**db_config)
            
            # Test connection
            conn = pool.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
            conn.close()
            
            print("✅ Database connected successfully!")
            _db_pool = pool
            return pool
            
        except Error as e:
            print(f"❌ Database connection failed: {e}")
            if attempt < max_retries - 1:
                print(f"   Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("   Max retries reached. Starting without database connection.")
                return None
    
    return None


def get_db_connection():
    """
    Get a database connection from the pool
    
    Returns:
        MySQL connection object
        
    Raises:
        HTTPException: If database is not available
    """
    if not _db_pool:
        raise HTTPException(
            status_code=503, 
            detail="Database not available"
        )
    
    try:
        return _db_pool.get_connection()
    except Error as e:
        raise HTTPException(
            status_code=503, 
            detail=f"Database connection error: {str(e)}"
        )


def close_db_pool():
    """Close the database connection pool"""
    global _db_pool
    if _db_pool:
        # Connection pools are automatically closed on deletion
        _db_pool = None
        print("Database pool closed")


def get_db():
    """
    Dependency for getting database connection
    Use this in route dependencies
    
    Yields:
        MySQL connection
    """
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

