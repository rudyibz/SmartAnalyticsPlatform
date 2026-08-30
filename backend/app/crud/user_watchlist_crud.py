from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.user_watchlist import UserWatchlist


def create_symbol(
    db: Session,
    user_id: int,
    symbol: str,
):

    normalized = symbol.strip().upper()

    existing = (
        db.query(UserWatchlist)
        .filter(
            UserWatchlist.user_id == user_id,
            UserWatchlist.symbol == normalized,
        )
        .first()
    )

    if existing:
        return existing

    item = UserWatchlist(
        user_id=user_id,
        symbol=normalized,
    )

    db.add(item)

    try:

        db.commit()
        db.refresh(item)

    except IntegrityError:

        db.rollback()

        existing = (
            db.query(UserWatchlist)
            .filter(
                UserWatchlist.user_id == user_id,
                UserWatchlist.symbol == normalized,
            )
            .first()
        )

        if existing:
            return existing

        raise

    return item


def get_watchlist(
    db: Session,
    user_id: int,
):

    return (
        db.query(UserWatchlist)
        .filter(
            UserWatchlist.user_id == user_id
        )
        .order_by(
            UserWatchlist.created_at.desc()
        )
        .all()
    )


def delete_symbol(
    db: Session,
    user_id: int,
    symbol: str,
):

    normalized = symbol.strip().upper()

    item = (
        db.query(UserWatchlist)
        .filter(
            UserWatchlist.user_id == user_id,
            UserWatchlist.symbol == normalized,
        )
        .first()
    )

    if item:

        db.delete(item)
        db.commit()

    return item
