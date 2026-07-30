from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from backend.app.db.session import get_db

from backend.app.dependencies.auth_dependencies import (
    get_current_user,
)

from backend.app.schemas.user_watchlist_schema import (
    WatchlistCreate,
    WatchlistResponse,
)

from backend.app.services.user_watchlist_service import (
    add_symbol_service,
    list_watchlist_service,
    delete_symbol_service,
)

router = APIRouter(
    prefix="/watchlist",
    tags=["Watchlist"],
)


@router.post(
    "/",
    response_model=WatchlistResponse,
)
def add_symbol(
    data: WatchlistCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return add_symbol_service(
        db,
        current_user.id,
        data.symbol,
    )


@router.get(
    "/",
    response_model=list[WatchlistResponse],
)
def get_watchlist(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return list_watchlist_service(
        db,
        current_user.id,
    )


@router.delete(
    "/{symbol}",
)
def delete_symbol(
    symbol: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    delete_symbol_service(
        db,
        current_user.id,
        symbol,
    )

    return {
        "message": "Deleted"
    }