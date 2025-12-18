"""
Database writer for batch inserting vital signs data
"""
import os
from typing import List, Dict, Any
from pathlib import Path
from sqlalchemy import text
from app.db.database import get_engine


def load_sql_template(template_name: str) -> str:
    """
    Load SQL template from sql_templates directory.
    
    Args:
        template_name: Name of the SQL template file
        
    Returns:
        SQL query string
    """
    # Get the directory where this file is located
    current_dir = Path(__file__).parent
    template_path = current_dir / "sql_templates" / template_name
    
    if not template_path.exists():
        raise FileNotFoundError(f"SQL template not found: {template_path}")
    
    with open(template_path, "r") as f:
        return f.read()


def batch_insert_vitals(data_list: List[Dict[str, Any]]) -> None:
    """
    Insert multiple vital signs records in a single transaction.
    
    Args:
        data_list: List of dictionaries containing vital sign data.
                   Each dict should have keys matching SQL template parameters:
                   - patient_id (required)
                   - device_id (optional)
                   - ts (required, DATETIME)
                   - heart_rate (optional)
                   - spo2 (optional)
                   - bp_systolic (optional)
                   - bp_diastolic (optional)
                   - temperature_c (optional)
                   - respiration (optional)
                   - metadata (optional, JSON)
    
    Raises:
        Exception: If database operation fails (transaction will be rolled back)
    """
    if not data_list:
        return
    
    # Load SQL template
    sql = load_sql_template("insert_vital.sql")
    
    # Get database engine
    engine = get_engine()
    
    # Execute in a transaction
    with engine.begin() as conn:
        try:
            # Execute batch insert
            conn.execute(text(sql), data_list)
            print(f"✅ Successfully inserted {len(data_list)} vital record(s)")
        except Exception as e:
            print(f"❌ Error inserting vital records: {e}")
            raise  # Re-raise to trigger rollback

