from fastapi import APIRouter
router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"],
)
from fastapi import Depends
from sqlalchemy.orm import Session

from backend.app.db.database import get_db

from backend.app.dependencies.auth_dependencies import (
    get_current_user,
)

from backend.app.schemas.portfolio_schema import (
    PortfolioCreate,
    PortfolioResponse,
    PortfolioUpdate,
)

from backend.app.services.portfolio_service import (
    create_portfolio_position,
    delete_portfolio_position,
    get_user_portfolio,
    update_portfolio_position,
)

@router.post(
    "",
    response_model=PortfolioResponse,
)
def create_position(
    data: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_portfolio_position(
        db,
        current_user,
        data,
    )


@router.get(
    "",
    response_model=list[PortfolioResponse],
)
def portfolio(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_user_portfolio(
        db,
        current_user,
    )


@router.put(
    "/{position_id}",
    response_model=PortfolioResponse,
)
def update(
    position_id: int,
    data: PortfolioUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return update_portfolio_position(
        db,
        current_user,
        position_id,
        data,
    )


@router.delete(
    "/{position_id}",
)
def delete(
    position_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return delete_portfolio_position(
        db,
        current_user,
        position_id,
    )