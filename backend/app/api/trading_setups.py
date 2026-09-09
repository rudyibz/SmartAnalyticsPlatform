from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.trading_setup_service import (
    create_setup,
    get_active_setups,
    get_all_setups,
    close_setup,
    get_setup_performance,
    get_performance_by_symbol,
)
from app.services.trading_setup_monitor import evaluate_active_setups


router = APIRouter(
    prefix="/trading-setups",
    tags=["Trading Setups"],
)


@router.post("/")
def create_trading_setup(
    data: dict,
    db: Session = Depends(get_db),
):
    return create_setup(db, data)


@router.get("/")
def list_trading_setups(
    db: Session = Depends(get_db),
):
    return get_active_setups(db)


@router.patch("/{setup_id}/close")
def close_trading_setup(
    setup_id: int,
    db: Session = Depends(get_db),
):
    setup = close_setup(db, setup_id)

    if not setup:
        return {"detail": "Trading setup no encontrado"}

    return setup


@router.post("/evaluate")
def evaluate_trading_setups(
    db: Session = Depends(get_db),
):
    return evaluate_active_setups(db)
@router.get("/history")
def list_trading_setup_history(
    db: Session = Depends(get_db),
):
    return get_all_setups(db)
@router.get("/performance")
def trading_setup_performance(
    db: Session = Depends(get_db),
):
    return get_setup_performance(db)
@router.get("/performance/by-symbol")
def trading_setup_performance_by_symbol(
    db: Session = Depends(get_db),
):
    return get_performance_by_symbol(db)