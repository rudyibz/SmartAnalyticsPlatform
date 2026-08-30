from sqlalchemy.orm import Session

from app.core.exceptions import UserAlreadyExistsError
from app.core.security import hash_password
from app.crud.user_crud import (
    create_user,
    get_user_by_email,
    get_user_by_username,
)
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate


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

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(
            user_data.password
        ),
    )

    return create_user(db, user)


def update_user_service(
    db: Session,
    user: User,
    user_data: UserUpdate,
) -> User:
    """
    Actualiza los datos editables de un usuario.
    """

    if user_data.username is not None:
        existing_user = get_user_by_username(
            db,
            user_data.username,
        )

        if (
            existing_user
            and existing_user.id != user.id
        ):
            raise UserAlreadyExistsError(
                "El nombre de usuario ya existe."
            )

        user.username = user_data.username

    if user_data.email is not None:
        existing_user = get_user_by_email(
            db,
            user_data.email,
        )

        if (
            existing_user
            and existing_user.id != user.id
        ):
            raise UserAlreadyExistsError(
                "El email ya está registrado."
            )

        user.email = user_data.email

    if user_data.password is not None:
        user.hashed_password = hash_password(
            user_data.password
        )

    db.commit()
    db.refresh(user)

    return user
