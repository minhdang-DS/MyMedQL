"""
Encryption utilities for medical history data
"""
import os
from cryptography.fernet import Fernet
from typing import Optional

# Get encryption key from environment
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "")

# Initialize Fernet cipher
_cipher: Optional[Fernet] = None


def _get_cipher() -> Fernet:
    """
    Get or create Fernet cipher instance.
    
    Returns:
        Fernet cipher instance
        
    Raises:
        ValueError: If encryption key is not set or invalid
    """
    global _cipher
    
    if _cipher is None:
        if not ENCRYPTION_KEY:
            raise ValueError(
                "ENCRYPTION_KEY not set. Generate one with: "
                "python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
            )
        
        try:
            # Ensure key is bytes
            key = ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY
            _cipher = Fernet(key)
        except Exception as e:
            raise ValueError(f"Invalid encryption key: {e}")
    
    return _cipher


def encrypt_medical_history(data: str) -> bytes:
    """
    Encrypt medical history data using Fernet symmetric encryption.
    
    Args:
        data: Plain text medical history string
        
    Returns:
        Encrypted bytes (suitable for storing in VARBINARY column)
    """
    cipher = _get_cipher()
    encrypted = cipher.encrypt(data.encode('utf-8'))
    return encrypted


def decrypt_medical_history(encrypted: bytes) -> str:
    """
    Decrypt medical history data.
    
    Args:
        encrypted: Encrypted bytes from database
        
    Returns:
        Decrypted plain text string
    """
    cipher = _get_cipher()
    decrypted = cipher.decrypt(encrypted)
    return decrypted.decode('utf-8')

