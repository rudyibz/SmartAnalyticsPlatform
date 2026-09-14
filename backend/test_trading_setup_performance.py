from types import SimpleNamespace

from app.services.trading_setup_service import (
    get_setup_performance,
)


class QueryResult:
    def __init__(self, rows):
        self.rows = rows

    def filter(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
        return self

    def all(self):
        return self.rows


class FakeDB:
    def __init__(self, rows):
        self.rows = rows

    def query(self, model):
        return QueryResult(self.rows)


def make_setup(
    setup_id,
    symbol,
    direction,
    status,
    pnl,
    rr=2.0,
):
    return SimpleNamespace(
        id=setup_id,
        symbol=symbol,
        direction=direction,
        status=status,
        entry=100.0,
        exit_price=105.0 if pnl > 0 else 95.0,
        quantity=1.0,
        risk_reward=rr,
        realized_pnl=pnl,
        closed_at=f"2026-09-{setup_id:02d}T12:00:00",
    )


def test_performance_metrics():
    setups = [
        make_setup(
            1,
            "MSFT",
            "LONG",
            "HIT_TP",
            200,
        ),
        make_setup(
            2,
            "MSFT",
            "LONG",
            "HIT_SL",
            -100,
        ),
        make_setup(
            3,
            "GOLD",
            "SHORT",
            "HIT_TP",
            300,
        ),
    ]

    result = get_setup_performance(
        FakeDB(setups)
    )

    assert result["trades"] == 3
    assert result["winners"] == 2
    assert result["losers"] == 1
    assert result["win_rate"] == 66.67

    assert result["take_profit_trades"] == 2
    assert result["stop_loss_trades"] == 1

    assert result["take_profit_rate"] == 66.67
    assert result["stop_loss_rate"] == 33.33

    assert result["long_trades"] == 2
    assert result["short_trades"] == 1

    assert result["realized_pnl"] == 400
    assert result["average_pnl"] == 133.33

    assert result["gross_profit"] == 500
    assert result["gross_loss"] == 100

    assert result["profit_factor"] == 5.0
    assert result["expectancy"] == 133.33

    assert result["best_trade"] == 300
    assert result["worst_trade"] == -100

    assert result["average_risk_reward"] == 2.0
    assert result["max_drawdown"] == 100

    assert result["equity"][0]["direction"] == "LONG"
    assert result["equity"][0]["status"] == "HIT_TP"
    assert result["equity"][0]["quantity"] == 1.0


def test_empty_performance():
    result = get_setup_performance(
        FakeDB([])
    )

    assert result["trades"] == 0
    assert result["winners"] == 0
    assert result["losers"] == 0
    assert result["win_rate"] == 0
    assert result["take_profit_trades"] == 0
    assert result["stop_loss_trades"] == 0
    assert result["long_trades"] == 0
    assert result["short_trades"] == 0
    assert result["realized_pnl"] == 0
    assert result["profit_factor"] is None
    assert result["average_risk_reward"] is None
    assert result["max_drawdown"] == 0
    assert result["equity"] == []
