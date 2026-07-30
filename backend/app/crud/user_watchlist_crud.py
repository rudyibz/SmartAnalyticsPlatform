from sqlalchemy.orm import Session

from backend.app.models.user_watchlist import UserWatchlist


def create_symbol(
    db: Session,
    user_id: int,
    symbol: str,
):

    item = UserWatchlist(
        user_id=user_id,
        symbol=symbol.upper(),
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


def get_watchlist(
    db: Session,
    user_id: int,
):

    return (
        db.query(UserWatchlist)
        .filter(UserWatchlist.user_id == user_id)
        .all()
    )


def delete_symbol(
    db: Session,
    user_id: int,
    symbol: str,
):

    item = (
        db.query(UserWatchlist)
        .filter(
            UserWatchlist.user_id == user_id,
            UserWatchlist.symbol == symbol.upper(),
        )
        .first()
    )

    if item:

        db.delete(item)
        db.commit()

    return item