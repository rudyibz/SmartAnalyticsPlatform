from datetime import datetime

from sqlalchemy.orm import Session

from app.models.trading_setup import TradingSetup
from app.services.market_service import get_price


def create_setup(db: Session, data: dict):

    symbol = str(data["symbol"]).strip().upper()
    direction = str(data["direction"]).strip().upper()

    entry = float(data["entry"])
    quantity = float(data.get("quantity", 1.0))
    stop_loss = float(data["stop_loss"])
    take_profit = float(data["take_profit"])

    if quantity <= 0:
        raise ValueError("Quantity must be greater than 0")

    existing = (
        db.query(TradingSetup)
        .filter(
            TradingSetup.symbol == symbol,
            TradingSetup.direction == direction,
            TradingSetup.entry == entry,
            TradingSetup.quantity == quantity,
            TradingSetup.stop_loss == stop_loss,
            TradingSetup.take_profit == take_profit,
            TradingSetup.status == "ACTIVE",
        )
        .first()
    )

    if existing:
        return existing

    setup = TradingSetup(
        symbol=symbol,
        direction=direction,
        entry=entry,
        quantity=quantity,
        stop_loss=stop_loss,
        take_profit=take_profit,
        atr=data.get("atr"),
        risk_reward=data.get("risk_reward"),
        opportunity_score=data.get("opportunity_score"),
        opportunity_label=data.get("opportunity_label"),
        status="ACTIVE",
    )

    db.add(setup)
    db.commit()
    db.refresh(setup)

    return setup


def get_active_setups(db: Session):

    return (
        db.query(TradingSetup)
        .filter(
            TradingSetup.status.in_(["ACTIVE", "HIT_ENTRY"])
        )
        .order_by(
            TradingSetup.created_at.desc()
        )
        .all()
    )


def get_all_setups(db: Session):

    return (
        db.query(TradingSetup)
        .order_by(
            TradingSetup.created_at.desc()
        )
        .all()
    )


def close_setup(db: Session, setup_id: int):

    setup = (
        db.query(TradingSetup)
        .filter(
            TradingSetup.id == setup_id
        )
        .first()
    )

    if not setup:
        return None

    setup.status = "CLOSED"
    setup.closed_at = datetime.utcnow()

    db.commit()
    db.refresh(setup)

    return setup


def get_setup_performance(db: Session):

    setups = (
        db.query(TradingSetup)
        .filter(
            TradingSetup.status.in_(["HIT_TP", "HIT_SL"]),
            TradingSetup.realized_pnl.isnot(None),
        )
        .order_by(
            TradingSetup.closed_at.asc()
        )
        .all()
    )

    pnls = [
        float(setup.realized_pnl or 0)
        for setup in setups
    ]

    winners = [
        pnl for pnl in pnls
        if pnl > 0
    ]

    losers = [
        pnl for pnl in pnls
        if pnl < 0
    ]

    total = len(pnls)

    winner_count = len(winners)
    loser_count = len(losers)

    realized_pnl = sum(pnls)

    win_rate = (
        (winner_count / total) * 100
        if total > 0
        else 0
    )

    average_pnl = (
        realized_pnl / total
        if total > 0
        else 0
    )

    average_winner = (
        sum(winners) / winner_count
        if winner_count > 0
        else 0
    )

    average_loser = (
        sum(losers) / loser_count
        if loser_count > 0
        else 0
    )

    gross_profit = sum(winners)
    gross_loss = abs(sum(losers))

    profit_factor = (
        gross_profit / gross_loss
        if gross_loss > 0
        else None
    )

    expectancy = (
        realized_pnl / total
        if total > 0
        else 0
    )

    best_trade = (
        max(pnls)
        if pnls
        else 0
    )

    worst_trade = (
        min(pnls)
        if pnls
        else 0
    )

    cumulative_pnl = 0.0
    peak_equity = 0.0
    max_drawdown = 0.0

    equity = []

    for setup in setups:

        pnl = float(
            setup.realized_pnl or 0
        )

        cumulative_pnl += pnl

        peak_equity = max(
            peak_equity,
            cumulative_pnl
        )

        drawdown = (
            peak_equity - cumulative_pnl
        )

        max_drawdown = max(
            max_drawdown,
            drawdown
        )

        equity.append({
            "id": setup.id,
            "symbol": setup.symbol,
            "closed_at": setup.closed_at,
            "realized_pnl": round(pnl, 2),
            "equity": round(cumulative_pnl, 2),
        })

    return {
        "trades": total,
        "total": total,
        "winners": winner_count,
        "losers": loser_count,
        "win_rate": round(win_rate, 2),
        "realized_pnl": round(realized_pnl, 2),
        "average_pnl": round(average_pnl, 2),
        "average_winner": round(average_winner, 2),
        "average_loser": round(average_loser, 2),
        "gross_profit": round(gross_profit, 2),
        "gross_loss": round(gross_loss, 2),
        "profit_factor": (
            round(profit_factor, 2)
            if profit_factor is not None
            else None
        ),
        "expectancy": round(expectancy, 2),
        "best_trade": round(best_trade, 2),
        "worst_trade": round(worst_trade, 2),
        "max_drawdown": round(max_drawdown, 2),
        "equity": equity,
    }

def get_performance_by_symbol(db: Session):

    setups = (
        db.query(TradingSetup)
        .filter(
            TradingSetup.status.in_(["HIT_TP", "HIT_SL"]),
            TradingSetup.realized_pnl.isnot(None),
        )
        .all()
    )

    grouped = {}

    for setup in setups:

        symbol = setup.symbol

        if symbol not in grouped:
            grouped[symbol] = {
                "symbol": symbol,
                "trades": 0,
                "winners": 0,
                "losers": 0,
                "realized_pnl": 0.0,
            }

        item = grouped[symbol]

        item["trades"] += 1

        pnl = float(
            setup.realized_pnl or 0
        )

        item["realized_pnl"] += pnl

        if pnl > 0:
            item["winners"] += 1
        elif pnl < 0:
            item["losers"] += 1

    for item in grouped.values():

        trades = item["trades"]

        item["realized_pnl"] = round(
            item["realized_pnl"],
            2,
        )

        item["win_rate"] = round(
            (item["winners"] / trades) * 100
            if trades
            else 0,
            2,
        )

    return list(
        grouped.values()
    )


def evaluate_setup(
    db: Session,
    setup: TradingSetup,
):

    try:
        current_price = get_price(
            setup.symbol
        )
    except Exception as exc:
        print(
            f"[TRADING SETUP] Error obteniendo precio "
            f"{setup.symbol}: {exc}"
        )
        return setup

    if current_price is None:
        return setup

    current_price = float(current_price)

    quantity = float(
        setup.quantity or 1.0
    )

    if setup.status == "ACTIVE":

        if setup.direction == "LONG":

            if current_price >= setup.entry:
                setup.status = "HIT_ENTRY"

                print(
                    f"[TRADING SETUP] "
                    f"{setup.symbol} LONG -> HIT_ENTRY "
                    f"@ {current_price} "
                    f"QTY={quantity}"
                )

        elif setup.direction == "SHORT":

            if current_price <= setup.entry:
                setup.status = "HIT_ENTRY"

                print(
                    f"[TRADING SETUP] "
                    f"{setup.symbol} SHORT -> HIT_ENTRY "
                    f"@ {current_price} "
                    f"QTY={quantity}"
                )

    elif setup.status == "HIT_ENTRY":

        if setup.direction == "LONG":

            if current_price >= setup.take_profit:

                setup.status = "HIT_TP"
                setup.exit_price = current_price

                setup.realized_pnl = (
                    current_price - setup.entry
                ) * quantity

                setup.closed_at = datetime.utcnow()

            elif current_price <= setup.stop_loss:

                setup.status = "HIT_SL"
                setup.exit_price = current_price

                setup.realized_pnl = (
                    current_price - setup.entry
                ) * quantity

                setup.closed_at = datetime.utcnow()

        elif setup.direction == "SHORT":

            if current_price <= setup.take_profit:

                setup.status = "HIT_TP"
                setup.exit_price = current_price

                setup.realized_pnl = (
                    setup.entry - current_price
                ) * quantity

                setup.closed_at = datetime.utcnow()

            elif current_price >= setup.stop_loss:

                setup.status = "HIT_SL"
                setup.exit_price = current_price

                setup.realized_pnl = (
                    setup.entry - current_price
                ) * quantity

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

    evaluated = []

    for setup in setups:

        try:

            setup = evaluate_setup(
                db,
                setup,
            )

            evaluated.append(setup)

        except Exception as exc:

            print(
                f"[TRADING SETUP] "
                f"Error evaluando setup "
                f"{setup.id}: {exc}"
            )

    return evaluated

