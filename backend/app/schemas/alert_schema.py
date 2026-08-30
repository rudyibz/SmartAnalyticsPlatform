# ============================================================
# SmartAnalyticsPlatform
# backend/app/schemas/alert_schema.py
# ============================================================

from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


# ============================================================
# CREATE
# ============================================================

class AlertCreate(BaseModel):

    symbol: str = Field(
        min_length=1,
        max_length=20,
    )

    indicator: str = Field(
        min_length=1,
        max_length=50,
    )

    operator: str = Field(
        min_length=1,
        max_length=5,
    )

    target_value: float


# ============================================================
# UPDATE
# ============================================================

class AlertUpdate(BaseModel):

    active: bool


# ============================================================
# RESPONSE
# ============================================================

class AlertResponse(BaseModel):

    id: int

    user_id: int

    symbol: str

    indicator: str

    operator: str

    target_value: float

    active: bool

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# ALERT EVENT RESPONSE
# ============================================================

class AlertEventResponse(BaseModel):

    id: int

    alert_id: int

    user_id: int

    symbol: str

    indicator: str

    operator: str

    target_value: float

    current_value: float

    triggered_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )