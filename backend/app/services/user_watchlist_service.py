from sqlalchemy.orm import Session

from backend.app.crud.user_watchlist_crud import (
    create_symbol,
    delete_symbol,
    get_watchlist,
)


def add_symbol_service(
    db: Session,
    user_id: int,
    symbol: str,
):

    return create_symbol(
        db,
        user_id,
        symbol,
    )


def list_watchlist_service(
    db: Session,
    user_id: int,
):

    return get_watchlist(
        db,
        user_id,
    )


def delete_symbol_service(
    db: Session,
    user_id: int,
    symbol: str,
):

    return delete_symbol(
        db,
        user_id,
        symbol,
    )