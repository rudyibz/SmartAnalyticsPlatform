from fastapi import APIRouter

from app.services.scanner_service import (
    market_scan,
)


router = APIRouter(
    prefix="/scanner",
    tags=["Scanner"],
)


@router.get("")
def scanner():

    return market_scan()
