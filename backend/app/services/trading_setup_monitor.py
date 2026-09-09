from datetime import datetime

from sqlalchemy.orm import Session

from app.models.trading_setup import TradingSetup
from app.services.market_service import get_price


def evaluate_setup(
    db: Session,
    setup: TradingSetup,
):
    if setup.status not in ("ACTIVE", "HIT_ENTRY"):
        return setup

    try:
        market_data = get_price(setup.symbol)
        current_price = float(market_data["price"])
    except Exception:
        return setup

    # ==========================================
    # ENTRY
    # ==========================================

    if setup.status == "ACTIVE":

        if (
            setup.direction == "LONG"
            and current_price >= setup.entry
        ):
            setup.status = "HIT_ENTRY"

        elif (
            setup.direction == "SHORT"
            and current_price <= setup.entry
        ):
            setup.status = "HIT_ENTRY"

    # ==========================================
    # TP / SL
    # ==========================================

    elif setup.status == "HIT_ENTRY":

        if setup.direction == "LONG":

            if current_price >= setup.take_profit:

                setup.status = "HIT_TP"
                setup.exit_price = current_price
                setup.realized_pnl = (
                    current_price - setup.entry
                ) * setup.quantity
                setup.closed_at = datetime.utcnow()

            elif current_price <= setup.stop_loss:

                setup.status = "HIT_SL"
                setup.exit_price = current_price
                setup.realized_pnl = (
                    current_price - setup.entry
                ) * setup.quantity
                setup.closed_at = datetime.utcnow()

        elif setup.direction == "SHORT":

            if current_price <= setup.take_profit:

                setup.status = "HIT_TP"
                setup.exit_price = current_price
                setup.realized_pnl = (
                    setup.entry - current_price
                ) * setup.quantity
                setup.closed_at = datetime.utcnow()

            elif current_price >= setup.stop_loss:

                setup.status = "HIT_SL"
                setup.exit_price = current_price
                setup.realized_pnl = (
                    setup.entry - current_price
                ) * setup.quantity
                setup.closed_at = datetime.utcnow()

    db.commit()
    db.refresh(setup)

    return setup


def evaluate_active_setups(
    db: Session,
):
    setups = (
        db.query(TradingSetup)
        .filter(
            TradingSetup.status.in_(
                ["ACTIVE", "HIT_ENTRY"]
            )
        )
        .all()
    )

    results = []

    for setup in setups:

        results.append(
            evaluate_setup(
                db,
                setup,
            )
        )

    return results