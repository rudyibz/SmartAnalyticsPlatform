import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.models.user import User
from app.models.alert import Alert
from app.models.alert_event import AlertEvent
from app.services import alert_engine


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )

    Base.metadata.create_all(engine)

    SessionLocal = sessionmaker(
        bind=engine,
        autocommit=False,
        autoflush=False,
    )

    session = SessionLocal()

    try:
        yield session
    finally:
        session.close()
        engine.dispose()


def create_test_alert(
    db,
    *,
    symbol="BTC-USD",
    indicator="PRICE",
    operator=">=",
    target_value=78000,
):
    user = User(
        username="test_alert_user",
        email="test_alert_user@example.com",
        hashed_password="test_password",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    alert = Alert(
        user_id=user.id,
        symbol=symbol,
        indicator=indicator,
        operator=operator,
        target_value=target_value,
        active=True,
        triggered=False,
        last_triggered_at=None,
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert


def test_compare_values():
    assert alert_engine.compare_values(78000, ">=", 78000) is True
    assert alert_engine.compare_values(79000, ">=", 78000) is True
    assert alert_engine.compare_values(77000, ">=", 78000) is False

    assert alert_engine.compare_values(79000, ">", 78000) is True
    assert alert_engine.compare_values(78000, ">", 78000) is False

    assert alert_engine.compare_values(78000, "<=", 78000) is True
    assert alert_engine.compare_values(77000, "<=", 78000) is True
    assert alert_engine.compare_values(79000, "<=", 78000) is False

    assert alert_engine.compare_values(77000, "<", 78000) is True
    assert alert_engine.compare_values(78000, "<", 78000) is False

    assert alert_engine.compare_values(78000, "==", 78000) is True
    assert alert_engine.compare_values(78001, "==", 78000) is False


def test_trigger_alert_creates_only_one_event_until_rearmed(db):
    alert = create_test_alert(db)

    result = alert_engine.trigger_alert_with_value(
        db=db,
        alert=alert,
        current_value=78500,
    )

    assert result["triggered"] is True
    assert result["event_created"] is True
    assert result["event_id"] is not None

    db.refresh(alert)

    assert alert.triggered is True

    events = (
        db.query(AlertEvent)
        .filter(AlertEvent.alert_id == alert.id)
        .all()
    )

    assert len(events) == 1

    first_event_id = events[0].id

    result = alert_engine.trigger_alert_with_value(
        db=db,
        alert=alert,
        current_value=79000,
    )

    assert result["triggered"] is True
    assert result["event_created"] is False

    events = (
        db.query(AlertEvent)
        .filter(AlertEvent.alert_id == alert.id)
        .all()
    )

    assert len(events) == 1
    assert events[0].id == first_event_id


def test_trigger_alert_rearms_after_condition_is_false(db):
    alert = create_test_alert(db)

    result = alert_engine.trigger_alert_with_value(
        db=db,
        alert=alert,
        current_value=78500,
    )

    assert result["event_created"] is True

    db.refresh(alert)

    assert alert.triggered is True

    result = alert_engine.trigger_alert_with_value(
        db=db,
        alert=alert,
        current_value=77000,
    )

    assert result["triggered"] is False
    assert result["event_created"] is False

    db.refresh(alert)

    assert alert.triggered is False
    assert alert.last_triggered_at is None

    result = alert_engine.trigger_alert_with_value(
        db=db,
        alert=alert,
        current_value=79000,
    )

    assert result["triggered"] is True
    assert result["event_created"] is True
    assert result["event_id"] is not None

    events = (
        db.query(AlertEvent)
        .filter(AlertEvent.alert_id == alert.id)
        .order_by(AlertEvent.id)
        .all()
    )

    assert len(events) == 2
    assert events[0].current_value == 78500
    assert events[1].current_value == 79000


def test_inactive_alert_does_not_trigger(db):
    alert = create_test_alert(db)

    alert.active = False

    db.commit()
    db.refresh(alert)

    result = alert_engine.trigger_alert_with_value(
        db=db,
        alert=alert,
        current_value=90000,
    )

    assert result["triggered"] is False
    assert result["event_created"] is False
    assert result["reason"] == "alert_inactive"

    events = (
        db.query(AlertEvent)
        .filter(AlertEvent.alert_id == alert.id)
        .all()
    )

    assert len(events) == 0
