from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: Optional[str] = "customer"


class UserCreate(UserBase):
    password: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "customer@example.com",
                "name": "Jane Doe",
                "password": "strongpassword123",
                "role": "customer",
            }
        }
    )


class UserUpdate(UserBase):
    password: Optional[str] = None


class UserInDBBase(UserBase):
    id: int
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class UserResponse(UserInDBBase):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": 1,
                "email": "customer@example.com",
                "name": "Jane Doe",
                "role": "customer",
                "is_active": True,
            }
        }
    )


class Token(BaseModel):
    access_token: str
    token_type: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
            }
        }
    )


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
