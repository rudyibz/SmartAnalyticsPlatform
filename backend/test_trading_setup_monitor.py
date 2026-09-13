from types import SimpleNamespace

from app.services import trading_setup_monitor


def make_setup(
    setup_id=100,
    symbol="TEST",
    direction="LONG",
    entry=100.0,
    stop_loss=95.0,
    take_profit=110.0,
    quantity=2.0,
    status="ACTIVE",
):
    return SimpleNamespace(
        id=setup_id,
        symbol=symbol,
        direction=direction,
        entry=entry,
        stop_loss=stop_loss,
        take_profit=take_profit,
        quantity=quantity,
        status=status,
        exit_price=None,
        realized_pnl=None,
        closed_at=None,
    )


class FakeDB:
    def __init__(self):
        self.events = []
        self.commits = 0
        self.refreshes = 0

    def add(self, event):
        self.events.append(event)

    def commit(self):
        self.commits += 1

    def refresh(self, obj):
        self.refreshes += 1


def fake_market(price):
    def _get_price(symbol):
        return {
            "symbol": symbol,
            "price": price,
        }

    return _get_price


def test_long_entry():
    db = FakeDB()
    setup = make_setup(
        direction="LONG",
        entry=100,
        status="ACTIVE",
    )

    trading_setup_monitor.get_price = fake_market(101)

    result = trading_setup_monitor.evaluate_setup(
        db,
        setup,
    )

    assert result.status == "HIT_ENTRY"
    assert len(db.events) == 1
    assert db.events[0].event_type == "ENTRY"
    assert db.events[0].price == 101
    assert db.commits == 1


def test_long_take_profit():
    db = FakeDB()
    setup = make_setup(
        direction="LONG",
        entry=100,
        stop_loss=95,
        take_profit=110,
        quantity=2,
        status="HIT_ENTRY",
    )

    trading_setup_monitor.get_price = fake_market(112)

    result = trading_setup_monitor.evaluate_setup(
        db,
        setup,
    )

    assert result.status == "HIT_TP"
    assert result.exit_price == 112
    assert result.realized_pnl == 24
    assert len(db.events) == 1
    assert db.events[0].event_type == "TAKE_PROFIT"


def test_long_stop_loss():
    db = FakeDB()
    setup = make_setup(
        direction="LONG",
        entry=100,
        stop_loss=95,
        take_profit=110,
        quantity=2,
        status="HIT_ENTRY",
    )

    trading_setup_monitor.get_price = fake_market(94)

    result = trading_setup_monitor.evaluate_setup(
        db,
        setup,
    )

    assert result.status == "HIT_SL"
    assert result.exit_price == 94
    assert result.realized_pnl == -12
    assert len(db.events) == 1
    assert db.events[0].event_type == "STOP_LOSS"


def test_short_take_profit():
    db = FakeDB()
    setup = make_setup(
        direction="SHORT",
        entry=100,
        stop_loss=105,
        take_profit=90,
        quantity=2,
        status="HIT_ENTRY",
    )

    trading_setup_monitor.get_price = fake_market(88)

    result = trading_setup_monitor.evaluate_setup(
        db,
        setup,
    )

    assert result.status == "HIT_TP"
    assert result.exit_price == 88
    assert result.realized_pnl == 24
    assert len(db.events) == 1
    assert db.events[0].event_type == "TAKE_PROFIT"


def test_short_stop_loss():
    db = FakeDB()
    setup = make_setup(
        direction="SHORT",
        entry=100,
        stop_loss=105,
        take_profit=90,
        quantity=2,
        status="HIT_ENTRY",
    )

    trading_setup_monitor.get_price = fake_market(106)

    result = trading_setup_monitor.evaluate_setup(
        db,
        setup,
    )

    assert result.status == "HIT_SL"
    assert result.exit_price == 106
    assert result.realized_pnl == -12
    assert len(db.events) == 1
    assert db.events[0].event_type == "STOP_LOSS"


def test_stop_loss_has_priority_when_price_is_beyond_both_levels():
    db = FakeDB()
    setup = make_setup(
        direction="LONG",
        entry=100,
        stop_loss=95,
        take_profit=105,
        quantity=1,
        status="HIT_ENTRY",
    )

    trading_setup_monitor.get_price = fake_market(94)

    result = trading_setup_monitor.evaluate_setup(
        db,
        setup,
    )

    assert result.status == "HIT_SL"
    assert db.events[0].event_type == "STOP_LOSS"


def test_invalid_price_does_not_change_setup():
    db = FakeDB()
    setup = make_setup(
        direction="LONG",
        status="ACTIVE",
    )

    trading_setup_monitor.get_price = fake_market(0)

    result = trading_setup_monitor.evaluate_setup(
        db,
        setup,
    )

    assert result.status == "ACTIVE"
    assert len(db.events) == 0
    assert db.commits == 0
