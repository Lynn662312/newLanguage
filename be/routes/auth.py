# """Routes for user authentication."""
# from fastapi import APIRouter, HTTPException, Depends, Header
# from typing import Optional
# from ..models import UserRegister, UserLogin, LoginResponse, UserResponse
# # from be.services.auth_service import hash_password, verify_password, generate_token, verify_token
# # from ..storage import get_user_by_email, create_user, get_user_by_id

# router = APIRouter(prefix="/api/auth", tags=["auth"])


# def get_current_user(authorization: Optional[str] = Header(None)) -> str:
#     """Dependency to get current user from JWT token."""
#     if not authorization:
#         raise HTTPException(status_code=401, detail="Authorization header missing")
    
#     try:
#         token = authorization.replace("Bearer ", "")
#         user_id = verify_token(token)
#         if not user_id:
#             raise HTTPException(status_code=401, detail="Invalid or expired token")
#         return user_id
#     except Exception as e:
#         raise HTTPException(status_code=401, detail="Invalid token")


# @router.post("/register", response_model=UserResponse)
# async def register(user_data: UserRegister):
#     """
#     Register a new user.
#     """
#     # Check if user already exists
#     existing_user = get_user_by_email(user_data.email)
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Email already registered")
    
#     # Create user
#     user_dict = {
#         "email": user_data.email,
#         "username": user_data.username,
#         "password": hash_password(user_data.password),
#         "native_language": user_data.native_language,
#         "practice_language": user_data.practice_language
#     }
    
#     created_user = create_user(user_dict)
    
#     return UserResponse(
#         id=created_user["id"],
#         email=created_user["email"],
#         username=created_user["username"],
#         native_language=created_user["native_language"],
#         practice_language=created_user["practice_language"],
#         created_at=created_user["created_at"]
#     )


# @router.post("/login", response_model=LoginResponse)
# async def login(credentials: UserLogin):
#     """
#     Login user and return JWT token.
#     """
#     user = get_user_by_email(credentials.email)
#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid email or password")
    
#     if not verify_password(credentials.password, user["password"]):
#         raise HTTPException(status_code=401, detail="Invalid email or password")
    
#     token = generate_token(user["id"])
    
#     user_obj = get_user_by_id(user["id"])
#     if not user_obj:
#         raise HTTPException(status_code=500, detail="Error retrieving user")
    
#     return LoginResponse(
#         access_token=token,
#         user=UserResponse(
#             id=user_obj.id,
#             email=user_obj.email,
#             username=user_obj.username,
#             native_language=user_obj.native_language,
#             practice_language=user_obj.practice_language,
#             created_at=user_obj.created_at
#         )
#     )


# @router.get("/me", response_model=UserResponse)
# async def get_current_user_info(user_id: str = Depends(get_current_user)):
#     """
#     Get current user information.
#     """
#     user = get_user_by_id(user_id)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
    
#     return UserResponse(
#         id=user.id,
#         email=user.email,
#         username=user.username,
#         native_language=user.native_language,
#         practice_language=user.practice_language,
#         created_at=user.created_at
#     )
