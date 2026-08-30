"""
Endpoints de gestión de usuarios.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.dependencies.auth_dependencies import (
    get_current_user,
    require_role,
)

from app.schemas.user_schema import (
    UserCreate,
    UserResponse,
    UserUpdate,
)

from app.services.user_service import (
    create_user_service,
    update_user_service,
)

from app.crud.user_crud import (
    get_users,
    get_user_by_id,
    delete_user,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# =====================================================
# CREATE USER
# =====================================================

@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create User",
    description="Crear un nuevo usuario. Solo administradores.",
)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    """
    Crear un nuevo usuario.
    """

    return create_user_service(
        db=db,
        user_data=user,
    )


# =====================================================
# CURRENT USER
# =====================================================

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Current User",
    description="Devuelve el perfil del usuario autenticado.",
)
def get_profile(
    current_user=Depends(get_current_user),
):
    """
    Devuelve el usuario actualmente autenticado.
    """

    return current_user


# =====================================================
# LIST USERS
# =====================================================

@router.get(
    "/",
    response_model=list[UserResponse],
    summary="List Users",
    description="Lista usuarios. Solo administradores.",
)
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    """
    Lista usuarios con paginación básica.
    """

    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="skip no puede ser negativo.",
        )

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="limit debe estar entre 1 y 100.",
        )

    return get_users(
        db=db,
        skip=skip,
        limit=limit,
    )


# =====================================================
# GET USER BY ID
# =====================================================

@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get User",
    description="Obtiene un usuario por ID. Solo administradores.",
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    """
    Obtiene un usuario concreto.
    """

    user = get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    return user


# =====================================================
# UPDATE USER
# =====================================================

@router.patch(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update User",
    description="Actualiza un usuario. Solo administradores.",
)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    """
    Actualiza los datos editables de un usuario.
    """

    user = get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    return update_user_service(
        db=db,
        user=user,
        user_data=user_data,
    )


# =====================================================
# ACTIVATE / DEACTIVATE USER
# =====================================================

@router.patch(
    "/{user_id}/status",
    response_model=UserResponse,
    summary="Change User Status",
    description="Activa o desactiva un usuario. Solo administradores.",
)
def change_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    """
    Activa o desactiva un usuario.
    """

    user = get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    # Evitar que un administrador se desactive accidentalmente
    if (
        user.id == current_user.id
        and not is_active
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivar tu propio usuario administrador.",
        )

    user.is_active = is_active

    db.commit()
    db.refresh(user)

    return user


# =====================================================
# DELETE USER
# =====================================================

@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete User",
    description="Elimina un usuario. Solo administradores.",
)
def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    """
    Elimina un usuario.
    """

    user = get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    # Evitar que el administrador se elimine a sí mismo
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propio usuario administrador.",
        )

    delete_user(
        db=db,
        user=user,
    )

    return None


# =====================================================
# ADMIN PANEL
# =====================================================

@router.get(
    "/admin/panel",
    summary="Admin Panel",
    description="Endpoint exclusivo para administradores.",
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
        "role": (
            current_user.role.value
            if hasattr(current_user.role, "value")
            else str(current_user.role)
        ),
    }
