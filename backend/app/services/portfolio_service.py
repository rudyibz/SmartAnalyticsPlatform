from fastapi import HTTPException

from app.analytics.portfolio_engine import PortfolioEngine

from app.crud.portfolio_crud import (
    create_position,
    delete_position,
    get_portfolio,
    get_position,
    update_position,
)


def create_portfolio_position(
    db,
    user,
    data,
):
    symbol = data.symbol.strip().upper()

    if not symbol:
        raise HTTPException(
            status_code=400,
            detail="Symbol is required",
        )

    if data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero",
        )

    if data.buy_price <= 0:
        raise HTTPException(
            status_code=400,
            detail="Buy price must be greater than zero",
        )

    return create_position(
        db=db,
        user_id=user.id,
        symbol=symbol,
        quantity=data.quantity,
        buy_price=data.buy_price,
    )


def get_user_portfolio(
    db,
    user,
):
    portfolio = get_portfolio(
        db=db,
        user_id=user.id,
    )

    engine = PortfolioEngine(
        portfolio
    )

    return engine.calculate()


def update_portfolio_position(
    db,
    user,
    position_id,
    data,
):
    position = get_position(
        db=db,
        position_id=position_id,
        user_id=user.id,
    )

    if not position:
        raise HTTPException(
            status_code=404,
            detail="Position not found",
        )

    if data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero",
        )

    if data.buy_price <= 0:
        raise HTTPException(
            status_code=400,
            detail="Buy price must be greater than zero",
        )

    return update_position(
        db=db,
        position=position,
        quantity=data.quantity,
        buy_price=data.buy_price,
    )


def delete_portfolio_position(
    db,
    user,
    position_id,
):
    position = get_position(
        db=db,
        position_id=position_id,
        user_id=user.id,
    )

    if not position:
        raise HTTPException(
            status_code=404,
            detail="Position not found",
        )

    delete_position(
        db=db,
        position=position,
    )

    return {
        "message": "Position deleted",
        "position_id": position_id,
    }