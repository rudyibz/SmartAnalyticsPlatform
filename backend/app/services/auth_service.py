from sqlalchemy.orm import Session

from backend.app.core.exceptions import (
    InvalidCredentialsError,
)

from backend.app.core.security import (
    verify_password,
    create_access_token,
)

from backend.app.crud.user_crud import (
    get_user_by_email,
)


def login_service(
    db: Session,
    email: str,
    password: str,
):

    # Buscar usuario por email
    user = get_user_by_email(
        db,
        email,
    )

    if not user:
        raise InvalidCredentialsError(
            "Email o contraseña incorrectos."
        )


    # Comparar contraseña enviada
    # contra hash almacenado
    if not verify_password(
        password,
        user.hashed_password,
    ):
        raise InvalidCredentialsError(
            "Email o contraseña incorrectos."
        )


    # Crear JWT

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
        }
    )


    return {
        "access_token": access_token,
        "token_type": "bearer",
    }