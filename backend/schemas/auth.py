from pydantic import BaseModel

class UserSchema(BaseModel):
    id: str
    email: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    user: UserSchema
    message: str
