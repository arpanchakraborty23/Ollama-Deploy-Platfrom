from fastapi import APIRouter, Depends
from backend.schemas.auth import LoginRequest, AuthResponse, UserSchema
from backend.core.security import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=AuthResponse)
async def login(credentials: LoginRequest):
    # Dummy login bypasses password verification for personal use
    user = UserSchema(id="1", email=credentials.email)
    return AuthResponse(user=user, message="Login successful (Bypassed)")

@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserSchema)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserSchema(**current_user)
