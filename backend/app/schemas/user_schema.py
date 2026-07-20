from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """
    Campos comunes de usuario.
    """

    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
    )

    email: EmailStr


class UserCreate(UserBase):
    """
    Datos necesarios para crear un usuario.
    """

    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
    )


class UserUpdate(BaseModel):
    """
    Datos editables.
    """

    username: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=50,
    )

    email: Optional[EmailStr] = None

    password: Optional[str] = Field(
        default=None,
        min_length=8,
        max_length=100,
    )


class UserResponse(UserBase):
    """
    Datos devueltos por la API.
    """

    id: int

    role: str

    is_active: bool

    is_superuser: bool

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
class UserLogin(BaseModel):
    """
    Login.
    """

    username: str

    password: str