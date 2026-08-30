from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth_dependencies import (
    get_current_user,
)

from app.schemas.portfolio_schema import (
    PortfolioCreate,
    PortfolioResponse,
    PortfolioUpdate,
)

from app.services.portfolio_service import (
    create_portfolio_position,
    delete_portfolio_position,
    get_user_portfolio,
    update_portfolio_position,
)


router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"],
)


@router.post(
    "",
)
def create(
    data: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_portfolio_position(
        db=db,
        user=current_user,
        data=data,
    )


@router.get(
    "",
    response_model=PortfolioResponse,
)
def get_portfolio_data(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_user_portfolio(
        db=db,
        user=current_user,
    )


@router.put(
    "/{position_id}",
)
def update(
    position_id: int,
    data: PortfolioUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return update_portfolio_position(
        db=db,
        user=current_user,
        position_id=position_id,
        data=data,
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
        db=db,
        user=current_user,
        position_id=position_id,
    )