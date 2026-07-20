from sqlalchemy.orm import Session

from backend.app.models.roles import UserRole
from backend.app.core.exceptions import UserAlreadyExistsError
from backend.app.core.security import hash_password
from backend.app.crud.user_crud import (
    create_user,
    get_user_by_email,
    get_user_by_username,
)
from backend.app.models.user import User
from backend.app.schemas.user_schema import UserCreate


def create_user_service(
    db: Session,
    user_data: UserCreate,
) -> User:
    """
    Registra un nuevo usuario.
    """

    if get_user_by_email(db, user_data.email):
        raise UserAlreadyExistsError(
            "El email ya está registrado."
        )

    if get_user_by_username(db, user_data.username):
        raise UserAlreadyExistsError(
            "El nombre de usuario ya existe."
        )

    # Guardar la contraseña cifrada con bcrypt
    user = User(
    username=user_data.username,
    email=user_data.email,
    hashed_password=hash_password(user_data.password),
)

    return create_user(db, user)