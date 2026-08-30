# ============================================================
# SmartAnalyticsPlatform
# backend/app/services/alert_engine.py
# ============================================================

from sqlalchemy.orm import Session

# ============================================================
# CARGAR MODELOS
# ============================================================

from app.models.user import User
from app.models.alert import Alert
from app.models.alert_event import AlertEvent

# ============================================================
# SERVICIOS DE MERCADO
# ============================================================

from app.services.market_service import (
    get_price,
    get_indicators,
)


# ============================================================
# COMPARADOR
# ============================================================

def compare_values(
    current_value: float,
    operator: str,
    target_value: float,
) -> bool:

    if operator == ">=":
        return current_value >= target_value

    if operator == ">":
        return current_value > target_value

    if operator == "<=":
        return current_value <= target_value

    if operator == "<":
        return current_value < target_value

    if operator == "==":
        return current_value == target_value

    return False


# ============================================================
# OBTENER VALOR DEL INDICADOR
# ============================================================

def get_indicator_value(
    symbol: str,
    indicator: str,
) -> float:

    symbol = str(
        symbol
    ).strip().upper()

    indicator = str(
        indicator
    ).strip().upper()

    # ========================================================
    # PRICE
    # ========================================================

    if indicator == "PRICE":

        market_data = get_price(
            symbol
        )

        return float(
            market_data["price"]
        )

    # ========================================================
    # INDICADORES TÉCNICOS
    # ========================================================

    if indicator in {
        "RSI",
        "MACD",
        "EMA",
    }:

        data = get_indicators(
            symbol
        )

        if indicator == "RSI":

            value = data.get(
                "rsi14"
            )

        elif indicator == "MACD":

            value = data.get(
                "macd"
            )

        elif indicator == "EMA":

            value = data.get(
                "ema20"
            )

        else:

            value = None

        if value is None:

            raise ValueError(
                f"No se pudo obtener "
                f"el indicador {indicator} "
                f"para {symbol}."
            )

        return float(
            value
        )

    # ========================================================
    # NO SOPORTADO
    # ========================================================

    raise ValueError(
        f"Indicador no soportado: "
        f"{indicator}"
    )


# ============================================================
# BUSCAR ÚLTIMO EVENTO
# ============================================================

def get_last_alert_event(
    db: Session,
    alert: Alert,
):

    return (
        db.query(AlertEvent)
        .filter(
            AlertEvent.alert_id == alert.id,
        )
        .order_by(
            AlertEvent.triggered_at.desc()
        )
        .first()
    )


# ============================================================
# CREAR EVENTO
# ============================================================

def create_alert_event(
    db: Session,
    alert: Alert,
    current_value: float,
) -> AlertEvent:

    event = AlertEvent(
        alert_id=alert.id,
        user_id=alert.user_id,
        symbol=str(
            alert.symbol
        ).strip().upper(),
        indicator=str(
            alert.indicator
        ).strip().upper(),
        operator=str(
            alert.operator
        ).strip(),
        target_value=float(
            alert.target_value
        ),
        current_value=float(
            current_value
        ),
    )

    db.add(
        event
    )

    db.commit()

    db.refresh(
        event
    )

    return event

# ============================================================
# EVALUAR UNA ALERTA
# ============================================================

def evaluate_alert(
    alert: Alert,
    db: Session | None = None,
) -> dict:

    symbol = str(
        alert.symbol
    ).strip().upper()

    indicator = str(
        alert.indicator
    ).strip().upper()

    operator = str(
        alert.operator
    ).strip()

    target_value = float(
        alert.target_value
    )

    # ========================================================
    # OBTENER VALOR ACTUAL
    # ========================================================

    try:

        current_value = get_indicator_value(
            symbol=symbol,
            indicator=indicator,
        )

    except Exception as exc:

        return {
            "alert_id": alert.id,
            "symbol": symbol,
            "indicator": indicator,
            "operator": operator,
            "target_value": target_value,
            "current_value": None,
            "triggered": bool(
                alert.triggered
            ),
            "supported": False,
            "active": bool(
                alert.active
            ),
            "event_created": False,
            "event_id": None,
            "error": str(
                exc
            ),
        }

    # ========================================================
    # EVALUAR CONDICIÓN
    # ========================================================

    triggered_now = compare_values(
        current_value=current_value,
        operator=operator,
        target_value=target_value,
    )

    # Estado anterior guardado en la alerta
    triggered_before = bool(
        alert.triggered
    )

    event_created = False
    event_id = None

    # ========================================================
    # TRANSICIÓN: FALSE → TRUE
    # ========================================================

    if (
        triggered_now
        and not triggered_before
        and db is not None
    ):

        event = create_alert_event(
            db=db,
            alert=alert,
            current_value=current_value,
        )

        alert.triggered = True
        alert.last_triggered_at = (
            event.triggered_at
        )

        db.commit()
        db.refresh(alert)

        event_created = True
        event_id = event.id

    # ========================================================
    # TRANSICIÓN: TRUE → FALSE
    # ========================================================

    elif (
        not triggered_now
        and triggered_before
        and db is not None
    ):

        alert.triggered = False
        alert.last_triggered_at = None

        db.commit()
        db.refresh(alert)

    # ========================================================
    # PRIMERA EVALUACIÓN SIN DB
    # ========================================================

    elif (
        triggered_now
        and not triggered_before
        and db is None
    ):

        pass

    # ========================================================
    # RESULTADO
    # ========================================================

    return {
        "alert_id": alert.id,
        "symbol": symbol,
        "indicator": indicator,
        "operator": operator,
        "target_value": target_value,
        "current_value": current_value,
        "triggered": triggered_now,
        "supported": True,
        "active": bool(
            alert.active
        ),
        "event_created": event_created,
        "event_id": event_id,
    }


# ============================================================
# EVALUAR ALERTAS DE UN USUARIO
# ============================================================

def evaluate_user_alerts(
    db: Session,
    user_id: int,
) -> list[dict]:

    alerts = (
        db.query(Alert)
        .filter(
            Alert.user_id == user_id,
            Alert.active.is_(True),
        )
        .order_by(
            Alert.id.desc()
        )
        .all()
    )

    results = []

    for alert in alerts:

        try:

            result = evaluate_alert(
                alert=alert,
                db=db,
            )

            results.append(
                result
            )

        except Exception as exc:

            results.append(
                {
                    "alert_id": alert.id,
                    "symbol": alert.symbol,
                    "indicator": alert.indicator,
                    "operator": alert.operator,
                    "target_value": float(
                        alert.target_value
                    ),
                    "current_value": None,
                    "triggered": False,
                    "supported": False,
                    "active": bool(
                        alert.active
                    ),
                    "event_created": False,
                    "event_id": None,
                    "error": str(
                        exc
                    ),
                }
            )

    return results