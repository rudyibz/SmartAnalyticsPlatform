from sqlalchemy.orm import Session

from app.models.alert import Alert


def create_alert(
    db: Session,
    user_id: int,
    symbol: str,
    indicator: str,
    operator: str,
    target_value: float,
):
    alert = Alert(
        user_id=user_id,
        symbol=str(symbol).strip().upper(),
        indicator=str(indicator).strip().upper(),
        operator=str(operator).strip(),
        target_value=float(target_value),
        active=True,
        triggered=False,
        last_triggered_at=None,
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert


def get_alerts(
    db: Session,
    user_id: int,
):
    return (
        db.query(Alert)
        .filter(
            Alert.user_id == user_id
        )
        .order_by(
            Alert.id.desc()
        )
        .all()
    )


def get_alert(
    db: Session,
    alert_id: int,
    user_id: int,
):
    return (
        db.query(Alert)
        .filter(
            Alert.id == alert_id,
            Alert.user_id == user_id,
        )
        .first()
    )


def update_alert(
    db: Session,
    alert: Alert,
    active: bool,
):
    alert.active = bool(active)

    if not alert.active:
        alert.triggered = False
        alert.last_triggered_at = None

    db.commit()
    db.refresh(alert)

    return alert


def delete_alert(
    db: Session,
    alert: Alert,
):
    db.delete(alert)
    db.commit()

    return True
