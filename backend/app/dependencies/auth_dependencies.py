"""
Dependencias de autenticación JWT
SmartAnalyticsPlatform
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.app.core.config import (
    SECRET_KEY,
    ALGORITHM,
)

from backend.app.db.session import get_db

from backend.app.crud.user_crud import (
    get_user_by_id,
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/token"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    Obtiene el usuario autenticado a partir del JWT.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = get_user_by_id(
        db,
        int(user_id),
    )

    if user is None:
        raise credentials_exception

    return user


def require_role(role: str):
    """
    Dependencia para proteger rutas por rol.
    """

    def role_checker(
        current_user=Depends(get_current_user),
    ):

        if current_user.role.value != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para acceder.",
            )

        return current_user

    return role_checker