from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth_dependencies import get_current_user

from app.schemas.portfolio_trade import TradeRequest

from app.services.portfolio_trade_service import buy, sell


router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio Trading"],
)


@router.post("/buy")
def buy_asset(
    trade: TradeRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return buy(
        db=db,
        user=current_user,
        symbol=trade.symbol,
        quantity=trade.quantity,
    )


@router.post("/sell")
def sell_asset(
    trade: TradeRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return sell(
        db=db,
        user=current_user,
        symbol=trade.symbol,
        quantity=trade.quantity,
    )
