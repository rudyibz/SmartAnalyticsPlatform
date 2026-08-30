# ============================================================
# SmartAnalyticsPlatform
# backend/app/models/alert_event.py
# ============================================================

from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.base import Base


class AlertEvent(Base):

    __tablename__ = "alert_events"

    # ========================================================
    # ID
    # ========================================================

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ========================================================
    # ALERTA
    # ========================================================

    alert_id: Mapped[int] = mapped_column(
        ForeignKey("alerts.id"),
        nullable=False,
        index=True,
    )

    # ========================================================
    # USUARIO
    # ========================================================

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # ========================================================
    # ACTIVO
    # ========================================================

    symbol: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )

    # ========================================================
    # INDICADOR
    # ========================================================

    indicator: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    # ========================================================
    # CONDICIÓN
    # ========================================================

    operator: Mapped[str] = mapped_column(
        String(5),
        nullable=False,
    )

    # ========================================================
    # VALOR OBJETIVO
    # ========================================================

    target_value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    # ========================================================
    # VALOR ACTUAL
    # ========================================================

    current_value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    # ========================================================
    # FECHA DEL EVENTO
    # ========================================================

    triggered_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    # ========================================================
    # RELACIONES
    # ========================================================

    alert = relationship(
        "Alert",
    )

    user = relationship(
        "User",
    )

    # ========================================================
    # REPRESENTACIÓN
    # ========================================================

    def __repr__(self):
        return (
            f"<AlertEvent("
            f"id={self.id}, "
            f"alert_id={self.alert_id}, "
            f"symbol='{self.symbol}', "
            f"indicator='{self.indicator}', "
            f"current_value={self.current_value}, "
            f"target_value={self.target_value}"
            f")>"
        )