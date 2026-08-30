from typing import Optional

from pydantic import BaseModel


class WatchlistCreate(BaseModel):

    symbol: str


class WatchlistResponse(BaseModel):

    id: int
    symbol: str

    price: Optional[float] = None
    signal: Optional[str] = None
    score: Optional[float] = None
    recommendation: Optional[str] = None
    risk: Optional[str] = None

    class Config:
        from_attributes = True
