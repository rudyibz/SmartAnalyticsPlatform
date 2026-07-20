from typing import Optional

from sqlalchemy.orm import Session

from backend.app.models.user import User


def get_user_by_id(
    db: Session,
    user_id: int,
) -> Optional[User]:
    """
    Obtiene un usuario por su ID.
    """
    return (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )


def get_user_by_email(
    db: Session,
    email: str,
) -> Optional[User]:
    """
    Obtiene un usuario por email.
    """
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def get_user_by_username(
    db: Session,
    username: str,
) -> Optional[User]:
    """
    Obtiene un usuario por username.
    """
    return (
        db.query(User)
        .filter(User.username == username)
        .first()
    )


def get_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> list[User]:
    """
    Devuelve una lista paginada de usuarios.
    """
    return (
        db.query(User)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_user(
    db: Session,
    user: User,
) -> User:
    """
    Inserta un usuario en la base de datos.
    """
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def update_user(
    db: Session,
    user: User,
) -> User:
    """
    Actualiza un usuario existente.
    """
    db.commit()
    db.refresh(user)

    return user


def delete_user(
    db: Session,
    user: User,
) -> None:
    """
    Elimina un usuario.
    """
    db.delete(user)
    db.commit()