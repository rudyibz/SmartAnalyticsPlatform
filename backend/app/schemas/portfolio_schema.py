from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PortfolioCreate(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    quantity: float = Field(gt=0)
    buy_price: float = Field(gt=0)


class PortfolioUpdate(BaseModel):
    quantity: float = Field(gt=0)
    buy_price: float = Field(gt=0)


class PortfolioPositionResponse(BaseModel):
    id: int
    user_id: int
    symbol: str
    quantity: float
    buy_price: float
    created_at: datetime

    current_price: float = 0.0
    market_value: float = 0.0
    invested: float = 0.0
    pnl: float = 0.0
    pnl_percent: float = 0.0

    model_config = ConfigDict(
        from_attributes=True
    )


class PortfolioSummary(BaseModel):
    invested: float = 0.0
    market_value: float = 0.0
    pnl: float = 0.0
    pnl_percent: float = 0.0


class PortfolioResponse(BaseModel):
    positions: list[PortfolioPositionResponse]
    summary: PortfolioSummary