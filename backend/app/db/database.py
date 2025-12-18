"""
Database connection management using SQLAlchemy Core
"""
import os
from typing import Optional
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.pool import QueuePool
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Global engine instance
_engine: Optional[Engine] = None


def get_engine() -> Engine:
    """
    Get or create the database engine.
    Uses connection pooling for efficiency.
    
    Returns:
        SQLAlchemy Engine instance
    """
    global _engine
    
    if _engine is None:
        # Read database configuration from environment variables
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = int(os.getenv("DB_PORT", "3307"))
        db_name = os.getenv("DB_NAME", "mymedql")
        db_user = os.getenv("DB_USER", "root")
        db_password = os.getenv("DB_PASSWORD", "root")
        
        # Build connection string
        connection_string = (
            f"mysql+pymysql://{db_user}:{db_password}"
            f"@{db_host}:{db_port}/{db_name}"
        )
        
        # Create engine with connection pooling
        _engine = create_engine(
            connection_string,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,  # Verify connections before using
            echo=False,  # Set to True for SQL debugging
        )
    
    return _engine


def test_connection() -> bool:
    """
    Test the database connection.
    
    Returns:
        True if connection successful, False otherwise
    """
    try:
        engine = get_engine()
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        print("✅ Database connection successful!")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


def close_connection():
    """
    Close the database engine and all connections.
    """
    global _engine
    if _engine is not None:
        _engine.dispose()
        _engine = None

