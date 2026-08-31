# ============================================================
# SmartAnalyticsPlatform
# backend/app/api/alerts.py
# ============================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth_dependencies import get_current_user
from app.models.alert import Alert
from app.models.alert_event import AlertEvent

from app.schemas.alert_schema import (
    AlertCreate,
    AlertResponse,
    AlertUpdate,
    AlertEventResponse,
)
from app.schemas.alert_trigger import AlertTrigger

from app.services.alert_service import (
    create_alert_service,
    delete_alert_service,
    get_user_alerts,
    update_alert_service,
)

from app.services.alert_engine import (
    evaluate_user_alerts,
    trigger_alert_with_value,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
)


# ============================================================
# CREATE ALERT
# ============================================================

@router.post(
    "",
    response_model=AlertResponse,
)
def create(
    data: AlertCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_alert_service(
        db,
        current_user,
        data,
    )


# ============================================================
# LIST USER ALERTS
# ============================================================

@router.get(
    "",
    response_model=list[AlertResponse],
)
def list_alerts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_user_alerts(
        db,
        current_user,
    )


# ============================================================
# EVALUATE USER ALERTS
# ============================================================

@router.get(
    "/evaluate",
)
def evaluate(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Evalúa todas las alertas activas del usuario
    contra los datos actuales del mercado.
    """

    return evaluate_user_alerts(
        db=db,
        user_id=current_user.id,
    )

# ============================================================
# TRIGGER ALERT WITH MARKET VALUE
# ============================================================

@router.post(
    "/{alert_id}/trigger",
)
def trigger(
    alert_id: int,
    data: AlertTrigger,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Evalúa una alerta utilizando un valor de mercado
    que ya ha sido obtenido por el WebSocket.
    """

    alert = (
        db.query(Alert)
        .filter(
            Alert.id == alert_id,
            Alert.user_id == current_user.id,
        )
        .first()
    )

    if alert is None:

        from fastapi import HTTPException

        raise HTTPException(
            status_code=404,
            detail="Alerta no encontrada.",
        )

    return trigger_alert_with_value(
        db=db,
        alert=alert,
        current_value=data.current_value,
    )

# ============================================================
# LIST ALERT EVENTS
# ============================================================

@router.get(
    "/events",
    response_model=list[AlertEventResponse],
)
def list_alert_events(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Devuelve el historial de eventos de alertas
    pertenecientes al usuario autenticado.
    """

    events = (
        db.query(AlertEvent)
        .filter(
            AlertEvent.user_id == current_user.id,
        )
        .order_by(
            AlertEvent.triggered_at.desc(),
        )
        .all()
    )

    return events


# ============================================================
# UPDATE ALERT
# ============================================================

@router.put(
    "/{alert_id}",
    response_model=AlertResponse,
)
def update(
    alert_id: int,
    data: AlertUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return update_alert_service(
        db,
        current_user,
        alert_id,
        data,
    )


# ============================================================
# DELETE ALERT
# ============================================================

@router.delete(
    "/{alert_id}",
)
def delete(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return delete_alert_service(
        db,
        current_user,
        alert_id,
    )