from datetime import datetime

from pydantic import BaseModel


class PriceResponse(BaseModel):
    symbol: str
    price: float
    currency: str


class CandleResponse(BaseModel):
    date: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    
class IndicatorResponse(BaseModel):
    symbol: str
    price: float
    ema20: float
    sma50: float
    rsi14: float
    trend: str