from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.trading_setup_service import (
    create_setup,
    get_active_setups,
    close_setup,
    get_all_setups,
    get_setup_performance,
    get_performance_by_symbol,
)

from app.services.trading_setup_monitor import (
    evaluate_active_setups,
)

from app.services.risk_management_service import (
    calculate_risk_management,
)

from app.models.trading_setup_event import (
    TradingSetupEvent,
)


router = APIRouter(
    prefix="/trading-setups",
    tags=["Trading Setups"],
)


@router.post("/")
def create_trading_setup(
    data: dict,
    db: Session = Depends(get_db),
):
    try:
        return create_setup(
            db,
            data,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@router.get("/")
def list_trading_setups(
    db: Session = Depends(get_db),
):
    return get_active_setups(
        db
    )


@router.patch("/{setup_id}/close")
def close_trading_setup(
    setup_id: int,
    db: Session = Depends(get_db),
):
    setup = close_setup(
        db,
        setup_id,
    )

    if not setup:
        raise HTTPException(
            status_code=404,
            detail="Trading setup no encontrado",
        )

    return setup


@router.post("/evaluate")
def evaluate_trading_setups(
    db: Session = Depends(get_db),
):
    return evaluate_active_setups(
        db
    )


@router.get("/history")
def list_trading_setup_history(
    db: Session = Depends(get_db),
):
    return get_all_setups(
        db
    )


@router.get("/performance")
def trading_setup_performance(
    db: Session = Depends(get_db),
):
    return get_setup_performance(
        db
    )


@router.get("/performance/by-symbol")
def trading_setup_performance_by_symbol(
    db: Session = Depends(get_db),
):
    return get_performance_by_symbol(
        db
    )


@router.get("/events")
def get_trading_setup_events(
    db: Session = Depends(get_db),
):
    events = (
        db.query(
            TradingSetupEvent
        )
        .order_by(
            TradingSetupEvent.created_at.desc()
        )
        .all()
    )

    return events


@router.post("/risk-management")
def trading_setup_risk_management(
    data: dict,
):
    try:
        return calculate_risk_management(
            capital=data["capital"],
            risk_percent=data["risk_percent"],
            entry=data["entry"],
            stop_loss=data["stop_loss"],
            take_profit=data["take_profit"],
            quantity=data.get("quantity"),
        )

    except KeyError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required field: {exc.args[0]}",
        )

    except (
        TypeError,
        ValueError,
    ) as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

