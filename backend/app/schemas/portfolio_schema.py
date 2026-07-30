from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PortfolioCreate(BaseModel):
    symbol: str
    quantity: float
    buy_price: float


class PortfolioUpdate(BaseModel):
    quantity: float
    buy_price: float


class PortfolioResponse(BaseModel):
    id: int
    user_id: int
    symbol: str
    quantity: float
    buy_price: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)