from passlib.context import CryptContext
import traceback

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    hash = pwd_context.hash("password123")
    print(f"Hash: {hash}")
    verify = pwd_context.verify("password123", hash)
    print(f"Verify: {verify}")
    
    # Test long password
    long_pass = "a" * 80
    verify_long = pwd_context.verify(long_pass, hash)
    print(f"Verify Long: {verify_long}")
    
except Exception:
    traceback.print_exc()
