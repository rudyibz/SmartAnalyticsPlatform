from sqlalchemy.orm import Session

from backend.app.models.alert import Alert


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
        symbol=symbol.upper(),
        indicator=indicator.upper(),
        operator=operator,
        target_value=target_value,
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
        .filter(Alert.user_id == user_id)
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
    alert.active = active

    db.commit()
    db.refresh(alert)

    return alert


def delete_alert(
    db: Session,
    alert: Alert,
):
    db.delete(alert)
    db.commit()