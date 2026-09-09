from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from app.db.base import Base


class TradingSetup(Base):

    __tablename__ = "trading_setups"

    id = Column(Integer, primary_key=True, index=True)

    symbol = Column(String, nullable=False, index=True)
    direction = Column(String, nullable=False)

    entry = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False, default=1.0)
    stop_loss = Column(Float, nullable=False)
    take_profit = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=True)
    realized_pnl = Column(Float, nullable=True)

    atr = Column(Float, nullable=True)
    risk_reward = Column(Float, nullable=True)

    opportunity_score = Column(Float, nullable=True)
    opportunity_label = Column(String, nullable=True)

    status = Column(String, nullable=False, default="ACTIVE")

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    closed_at = Column(
        DateTime,
        nullable=True
    )
