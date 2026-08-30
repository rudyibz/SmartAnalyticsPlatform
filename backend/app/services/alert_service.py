# ============================================================
# SmartAnalyticsPlatform
# backend/app/services/alert_service.py
# ============================================================

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud.alert_crud import (
    create_alert,
    delete_alert,
    get_alert,
    get_alerts,
    update_alert,
)
from app.schemas.alert_schema import AlertCreate, AlertUpdate


# ============================================================
# CREATE
# ============================================================

def create_alert_service(
    db: Session,
    current_user,
    data: AlertCreate,
):
    return create_alert(
        db=db,
        user_id=current_user.id,
        symbol=data.symbol,
        indicator=data.indicator,
        operator=data.operator,
        target_value=data.target_value,
    )


# ============================================================
# LIST USER ALERTS
# ============================================================

def get_user_alerts(
    db: Session,
    current_user,
):
    return get_alerts(
        db=db,
        user_id=current_user.id,
    )


# ============================================================
# UPDATE
# ============================================================

def update_alert_service(
    db: Session,
    current_user,
    alert_id: int,
    data: AlertUpdate,
):
    alert = get_alert(
        db=db,
        alert_id=alert_id,
        user_id=current_user.id,
    )

    if alert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada.",
        )

    return update_alert(
        db=db,
        alert=alert,
        active=data.active,
    )


# ============================================================
# DELETE
# ============================================================

def delete_alert_service(
    db: Session,
    current_user,
    alert_id: int,
):
    alert = get_alert(
        db=db,
        alert_id=alert_id,
        user_id=current_user.id,
    )

    if alert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada.",
        )

    delete_alert(
        db=db,
        alert=alert,
    )

    return {
        "message": "Alerta eliminada correctamente.",
    }
