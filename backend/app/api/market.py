from typing import List

from fastapi import APIRouter

from backend.app.schemas.market_schema import (
    PriceResponse,
    CandleResponse,
)

from backend.app.services.market_service import (
    get_price,
    get_history,
    get_indicators,
)

from backend.app.services.analysis_service import (
    analyze_market,
)

router = APIRouter(
    prefix="/market",
    tags=["Market"],
)


# ============================================
# PRECIO
# ============================================

@router.get(
    "/price/{symbol}",
    response_model=PriceResponse,
)
def market_price(symbol: str):
    return get_price(symbol)


# ============================================
# HISTÓRICO
# ============================================

@router.get(
    "/history/{symbol}",
    response_model=List[CandleResponse],
)
def market_history(
    symbol: str,
    period: str = "1mo",
):
    return get_history(
        symbol,
        period,
    )


# ============================================
# INDICADORES
# ============================================

@router.get(
    "/indicators/{symbol}",
    tags=["Market"],
)
def market_indicators(
    symbol: str,
    period: str = "6mo",
):
    return get_indicators(
        symbol,
        period,
    )


# ============================================
# ANÁLISIS
# ============================================

@router.get(
    "/analyze/{symbol}",
    tags=["Market"],
)
def market_analysis(
    symbol: str,
    period: str = "6mo",
):
    return analyze_market(
        symbol,
        period,
    )