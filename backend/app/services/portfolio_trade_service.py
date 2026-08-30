from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.portfolio import Portfolio
from app.services.market_service import get_price


def buy(
    db: Session,
    user,
    symbol: str,
    quantity: float,
):
    symbol = symbol.strip().upper()

    if not symbol:
        raise HTTPException(
            status_code=400,
            detail="Symbol is required",
        )

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero",
        )

    try:
        price = float(
            get_price(symbol)["price"]
        )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to obtain market price",
        )

    position = (
        db.query(Portfolio)
        .filter(
            Portfolio.user_id == user.id,
            Portfolio.symbol == symbol,
        )
        .first()
    )

    if position:

        total_quantity = (
            position.quantity +
            quantity
        )

        position.buy_price = (
            (
                position.buy_price *
                position.quantity
            )
            +
            (
                price *
                quantity
            )
        ) / total_quantity

        position.quantity = total_quantity

    else:

        position = Portfolio(
            user_id=user.id,
            symbol=symbol,
            quantity=quantity,
            buy_price=price,
        )

        db.add(position)

    db.commit()
    db.refresh(position)

    return position


def sell(
    db: Session,
    user,
    symbol: str,
    quantity: float,
):
    symbol = symbol.strip().upper()

    if not symbol:
        raise HTTPException(
            status_code=400,
            detail="Symbol is required",
        )

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero",
        )

    position = (
        db.query(Portfolio)
        .filter(
            Portfolio.user_id == user.id,
            Portfolio.symbol == symbol,
        )
        .first()
    )

    if not position:
        raise HTTPException(
            status_code=404,
            detail="Position not found",
        )

    if quantity > position.quantity:
        raise HTTPException(
            status_code=400,
            detail="Insufficient quantity",
        )

    position.quantity -= quantity

    if position.quantity <= 0:
        db.delete(position)

    db.commit()

    return {
        "success": True,
        "symbol": symbol,
        "quantity": quantity,
    }
