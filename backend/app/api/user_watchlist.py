from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth_dependencies import get_current_user

from app.schemas.user_watchlist_schema import (
    WatchlistCreate,
    WatchlistResponse,
)

from app.services.user_watchlist_service import (
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
        data.symbol.upper(),
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
    symbol = symbol.upper()

    deleted = delete_symbol_service(
        db,
        current_user.id,
        symbol,
    )

    if deleted:
        return {
            "message": "Deleted",
            "symbol": symbol,
        }

    return {
        "message": "Symbol not found",
        "symbol": symbol,
    }