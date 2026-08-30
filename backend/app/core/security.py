"""
Funciones de seguridad
SmartAnalyticsPlatform
"""

from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from app.core.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """
    Crea hash seguro de contraseña.
    """

    # bcrypt acepta máximo 72 bytes
    password = password[:72]

    return pwd_context.hash(password)



def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verifica contraseña.
    """

    plain_password = plain_password[:72]

    return pwd_context.verify(
        plain_password,
        hashed_password,
    )



def create_access_token(
    data: dict,
):

    to_encode = data.copy()

    expire = datetime.now(
        timezone.utc
    ) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update(
        {
            "exp": expire
        }
    )


    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )