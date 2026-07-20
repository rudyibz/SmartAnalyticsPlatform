"""
Endpoints de gestión de usuarios.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.database import get_db

from backend.app.dependencies.auth_dependencies import (
    get_current_user,
    require_role,
)

from backend.app.schemas.user_schema import (
    UserCreate,
    UserResponse,
)

from backend.app.services.user_service import (
    create_user_service,
)

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post(
    "/",
    response_model=UserResponse,
    status_code=201,
    summary="Create User",
    description="Crear un nuevo usuario.",
)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    """
    Crear un nuevo usuario.
    """
    return create_user_service(
        db=db,
        user_data=user,
    )


@router.get(
    "/me",
    tags=["Users"],
)
def get_profile(
    current_user=Depends(get_current_user),
):
    """
    Devuelve el perfil del usuario autenticado.
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "active": current_user.is_active,
        "superuser": current_user.is_superuser,
    }


@router.get(
    "/admin",
    tags=["Users"],
)
def admin_panel(
    current_user=Depends(require_role("admin")),
):
    """
    Panel exclusivo para administradores.
    """
    return {
        "message": "Bienvenido Administrador",
        "user": current_user.username,
        "role": current_user.role,
    }