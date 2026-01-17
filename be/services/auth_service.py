# """Authentication service for user management."""
# import hashlib
# import secrets
# from datetime import datetime
# from typing import Optional
# import jwt
# from ..config import BASE_DIR

# # Simple JWT secret (in production, use environment variable)
# JWT_SECRET = "your-secret-key-change-in-production"
# JWT_ALGORITHM = "HS256"


# def hash_password(password: str) -> str:
#     """Hash a password using SHA256."""
#     return hashlib.sha256(password.encode()).hexdigest()


# def verify_password(password: str, hashed: str) -> bool:
#     """Verify a password against its hash."""
#     return hash_password(password) == hashed


# def generate_token(user_id: str) -> str:
#     """Generate JWT token for user."""
#     payload = {
#         "user_id": user_id,
#         "exp": datetime.utcnow().timestamp() + 86400  # 24 hours
#     }
#     return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# def verify_token(token: str) -> Optional[str]:
#     """Verify JWT token and return user_id."""
#     try:
#         payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
#         return payload.get("user_id")
#     except jwt.ExpiredSignatureError:
#         return None
#     except jwt.InvalidTokenError:
#         return None
