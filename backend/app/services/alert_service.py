from fastapi import HTTPException

from backend.app.crud.alert_crud import (
    create_alert,
    delete_alert,
    get_alert,
    get_alerts,
    update_alert,
)


def create_alert_service(
    db,
    user,
    data,
):
    return create_alert(
        db=db,
        user_id=user.id,
        symbol=data.symbol,
        indicator=data.indicator,
        operator=data.operator,
        target_value=data.target_value,
    )


def get_user_alerts(
    db,
    user,
):
    return get_alerts(
        db=db,
        user_id=user.id,
    )


def update_alert_service(
    db,
    user,
    alert_id,
    data,
):
    alert = get_alert(
        db=db,
        alert_id=alert_id,
        user_id=user.id,
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    return update_alert(
        db=db,
        alert=alert,
        active=data.active,
    )


def delete_alert_service(
    db,
    user,
    alert_id,
):
    alert = get_alert(
        db=db,
        alert_id=alert_id,
        user_id=user.id,
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    delete_alert(
        db=db,
        alert=alert,
    )

    return {
        "message": "Alert deleted"
    }