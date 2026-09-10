from datetime import datetime

from sqlalchemy.orm import Session

from app.models.trading_setup import TradingSetup
from app.models.trading_setup_event import TradingSetupEvent
from app.services.market_service import get_price
from app.core.logger import logger


def create_setup_event(
    db: Session,
    setup: TradingSetup,
    event_type: str,
    price: float,
    realized_pnl: float | None = None,
):
    event = TradingSetupEvent(
        setup_id=setup.id,
        symbol=setup.symbol,
        event_type=event_type,
        direction=setup.direction,
        price=float(price),
        quantity=float(setup.quantity or 1.0),
        realized_pnl=realized_pnl,
        created_at=datetime.utcnow(),
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


def evaluate_setup(
    db: Session,
    setup: TradingSetup,
):
    if setup.status not in ("ACTIVE", "HIT_ENTRY"):
        return setup

    try:
        market_data = get_price(setup.symbol)
        current_price = float(market_data["price"])
    except Exception as exc:
        logger.error(
            f"Error evaluando setup #{setup.id} "
            f"{setup.symbol}: {exc}"
        )
        return setup

    if setup.status == "ACTIVE":

        if (
            setup.direction == "LONG"
            and current_price >= setup.entry
        ):
            setup.status = "HIT_ENTRY"

            create_setup_event(
                db,
                setup,
                "ENTRY",
                current_price,
            )

            logger.info(
                f"SETUP #{setup.id} {setup.symbol} "
                f"ENTRY alcanzado | "
                f"precio={current_price:.2f} | "
                f"cantidad={setup.quantity}"
            )

        elif (
            setup.direction == "SHORT"
            and current_price <= setup.entry
        ):
            setup.status = "HIT_ENTRY"

            create_setup_event(
                db,
                setup,
                "ENTRY",
                current_price,
            )

            logger.info(
                f"SETUP #{setup.id} {setup.symbol} "
                f"ENTRY alcanzado | "
                f"precio={current_price:.2f} | "
                f"cantidad={setup.quantity}"
            )

    elif setup.status == "HIT_ENTRY":

        if setup.direction == "LONG":

            if current_price >= setup.take_profit:

                setup.status = "HIT_TP"
                setup.exit_price = current_price

                setup.realized_pnl = (
                    current_price - setup.entry
                ) * setup.quantity

                setup.closed_at = datetime.utcnow()

                create_setup_event(
                    db,
                    setup,
                    "TAKE_PROFIT",
                    current_price,
                    setup.realized_pnl,
                )

                logger.info(
                    f"SETUP #{setup.id} {setup.symbol} "
                    f"TAKE PROFIT alcanzado | "
                    f"exit={current_price:.2f} | "
                    f"P/L={setup.realized_pnl:.2f} | "
                    f"cantidad={setup.quantity}"
                )

            elif current_price <= setup.stop_loss:

                setup.status = "HIT_SL"
                setup.exit_price = current_price

                setup.realized_pnl = (
                    current_price - setup.entry
                ) * setup.quantity

                setup.closed_at = datetime.utcnow()

                create_setup_event(
                    db,
                    setup,
                    "STOP_LOSS",
                    current_price,
                    setup.realized_pnl,
                )

                logger.info(
                    f"SETUP #{setup.id} {setup.symbol} "
                    f"STOP LOSS alcanzado | "
                    f"exit={current_price:.2f} | "
                    f"P/L={setup.realized_pnl:.2f} | "
                    f"cantidad={setup.quantity}"
                )

        elif setup.direction == "SHORT":

            if current_price <= setup.take_profit:

                setup.status = "HIT_TP"
                setup.exit_price = current_price

                setup.realized_pnl = (
                    setup.entry - current_price
                ) * setup.quantity

                setup.closed_at = datetime.utcnow()

                create_setup_event(
                    db,
                    setup,
                    "TAKE_PROFIT",
                    current_price,
                    setup.realized_pnl,
                )

                logger.info(
                    f"SETUP #{setup.id} {setup.symbol} "
                    f"TAKE PROFIT alcanzado | "
                    f"exit={current_price:.2f} | "
                    f"P/L={setup.realized_pnl:.2f} | "
                    f"cantidad={setup.quantity}"
                )

            elif current_price >= setup.stop_loss:

                setup.status = "HIT_SL"
                setup.exit_price = current_price

                setup.realized_pnl = (
                    setup.entry - current_price
                ) * setup.quantity

                setup.closed_at = datetime.utcnow()

                create_setup_event(
                    db,
                    setup,
                    "STOP_LOSS",
                    current_price,
                    setup.realized_pnl,
                )

                logger.info(
                    f"SETUP #{setup.id} {setup.symbol} "
                    f"STOP LOSS alcanzado | "
                    f"exit={current_price:.2f} | "
                    f"P/L={setup.realized_pnl:.2f} | "
                    f"cantidad={setup.quantity}"
                )

    db.commit()
    db.refresh(setup)

    return setup


def evaluate_active_setups(db: Session):
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
