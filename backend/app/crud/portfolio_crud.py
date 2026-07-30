from sqlalchemy.orm import Session

from backend.app.models.portfolio import Portfolio


def create_position(
    db: Session,
    user_id: int,
    symbol: str,
    quantity: float,
    buy_price: float,
):
    position = Portfolio(
        user_id=user_id,
        symbol=symbol.upper(),
        quantity=quantity,
        buy_price=buy_price,
    )

    db.add(position)
    db.commit()
    db.refresh(position)

    return position


def get_portfolio(
    db: Session,
    user_id: int,
):
    return (
        db.query(Portfolio)
        .filter(Portfolio.user_id == user_id)
        .all()
    )


def get_position(
    db: Session,
    position_id: int,
    user_id: int,
):
    return (
        db.query(Portfolio)
        .filter(
            Portfolio.id == position_id,
            Portfolio.user_id == user_id,
        )
        .first()
    )


def update_position(
    db: Session,
    position: Portfolio,
    quantity: float,
    buy_price: float,
):
    position.quantity = quantity
    position.buy_price = buy_price

    db.commit()
    db.refresh(position)

    return position


def delete_position(
    db: Session,
    position: Portfolio,
):
    db.delete(position)
    db.commit()