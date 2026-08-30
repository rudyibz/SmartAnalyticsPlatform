from fastapi import APIRouter

from app.schemas.market_schema import (
    PriceResponse,
    CandleResponse,
)

from app.services.market_service import (
    get_price,
    get_history,
    get_indicators,
)

from app.services.analysis_service import (
    analyze_market,
)


router = APIRouter(
    prefix="/market",
    tags=["Market"],
)


# ============================================================
# PRICE
# ============================================================

@router.get(
    "/price/{symbol}",
    response_model=PriceResponse,
)
def market_price(
    symbol: str,
):
    return get_price(
        symbol.upper()
    )


# ============================================================
# HISTORY
# ============================================================

@router.get(
    "/history/{symbol}",
    response_model=list[CandleResponse],
)
def market_history(
    symbol: str,
    period: str = "1mo",
):
    return get_history(
        symbol.upper(),
        period,
    )


# ============================================================
# INDICATORS
# ============================================================

@router.get(
    "/indicators/{symbol}",
)
def market_indicators(
    symbol: str,
    period: str = "6mo",
):
    return get_indicators(
        symbol.upper(),
        period,
    )


# ============================================================
# MARKET ANALYSIS
# ============================================================

@router.get(
    "/analyze/{symbol}",
)
def market_analysis(
    symbol: str,
    period: str = "6mo",
):
    return analyze_market(
        symbol.upper(),
        period,
    )