from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.dependencies.auth_dependencies import get_current_user

from backend.app.schemas.alert_schema import (
    AlertCreate,
    AlertResponse,
    AlertUpdate,
)

from backend.app.services.alert_service import (
    create_alert_service,
    delete_alert_service,
    get_user_alerts,
    update_alert_service,
)

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
)


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