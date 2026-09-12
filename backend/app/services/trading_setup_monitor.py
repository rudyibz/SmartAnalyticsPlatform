from datetime import datetime
from math import isfinite

from sqlalchemy.orm import Session

from app.models.trading_setup import TradingSetup
from app.models.trading_setup_event import TradingSetupEvent
from app.services.market_service import get_price
from app.core.logger import logger


ACTIVE_STATUSES = ("ACTIVE", "HIT_ENTRY")


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

    return event


def _calculate_pnl(
    setup: TradingSetup,
    exit_price: float,
) -> float:
    quantity = float(setup.quantity or 1.0)

    if setup.direction == "LONG":
        return (
            float(exit_price) - float(setup.entry)
        ) * quantity

    return (
        float(setup.entry) - float(exit_price)
    ) * quantity


def _close_setup(
    db: Session,
    setup: TradingSetup,
    event_type: str,
    exit_price: float,
):
    pnl = _calculate_pnl(
        setup,
        exit_price,
    )

    setup.status = (
        "HIT_TP"
        if event_type == "TAKE_PROFIT"
        else "HIT_SL"
    )

    setup.exit_price = float(exit_price)
    setup.realized_pnl = float(pnl)
    setup.closed_at = datetime.utcnow()

    create_setup_event(
        db=db,
        setup=setup,
        event_type=event_type,
        price=exit_price,
        realized_pnl=pnl,
    )

    logger.info(
        f"SETUP #{setup.id} {setup.symbol} "
        f"{event_type} | "
        f"exit={exit_price:.2f} | "
        f"P/L={pnl:.2f} | "
        f"cantidad={setup.quantity}"
    )


def evaluate_setup(
    db: Session,
    setup: TradingSetup,
):
    if setup.status not in ACTIVE_STATUSES:
        return setup

    try:
        market_data = get_price(setup.symbol)
        current_price = float(market_data["price"])

        if not isfinite(current_price) or current_price <= 0:
            raise ValueError(
                f"Precio inválido recibido: {current_price}"
            )

    except Exception as exc:
        logger.error(
            f"Error evaluando setup #{setup.id} "
            f"{setup.symbol}: {exc}"
        )
        return setup

    changed = False

    if setup.status == "ACTIVE":

        if (
            setup.direction == "LONG"
            and current_price >= setup.entry
        ):
            setup.status = "HIT_ENTRY"

            create_setup_event(
                db=db,
                setup=setup,
                event_type="ENTRY",
                price=current_price,
            )

            changed = True

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
                db=db,
                setup=setup,
                event_type="ENTRY",
                price=current_price,
            )

            changed = True

            logger.info(
                f"SETUP #{setup.id} {setup.symbol} "
                f"ENTRY alcanzado | "
                f"precio={current_price:.2f} | "
                f"cantidad={setup.quantity}"
            )

    elif setup.status == "HIT_ENTRY":

        if setup.direction == "LONG":

            # STOP primero: comportamiento conservador
            if current_price <= setup.stop_loss:
                _close_setup(
                    db,
                    setup,
                    "STOP_LOSS",
                    current_price,
                )
                changed = True

            elif current_price >= setup.take_profit:
                _close_setup(
                    db,
                    setup,
                    "TAKE_PROFIT",
                    current_price,
                )
                changed = True

        elif setup.direction == "SHORT":

            # STOP primero: comportamiento conservador
            if current_price >= setup.stop_loss:
                _close_setup(
                    db,
                    setup,
                    "STOP_LOSS",
                    current_price,
                )
                changed = True

            elif current_price <= setup.take_profit:
                _close_setup(
                    db,
                    setup,
                    "TAKE_PROFIT",
                    current_price,
                )
                changed = True

    if changed:
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
                ACTIVE_STATUSES
            )
        )
        .order_by(
            TradingSetup.id.asc()
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
