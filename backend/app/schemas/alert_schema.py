from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AlertCreate(BaseModel):
    symbol: str
    indicator: str
    operator: str
    target_value: float


class AlertUpdate(BaseModel):
    active: bool


class AlertResponse(BaseModel):
    id: int
    user_id: int
    symbol: str
    indicator: str
    operator: str
    target_value: float
    active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)