import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.db.database import SessionLocal
from app.models.alert import Alert
from app.services.alert_engine import trigger_alert_with_value
from app.services.market_service import (
    get_price,
    get_indicators,
)


router = APIRouter()


# ============================================================
# OBTENER VALOR PARA UNA ALERTA
# ============================================================

def get_alert_value(
    indicator: str,
    price_data: dict,
    indicators: dict,
):
    indicator = str(
        indicator
    ).strip().upper()

    if indicator == "PRICE":
        return price_data.get("price")

    if indicator == "RSI":
        return indicators.get("rsi14")

    if indicator == "MACD":
        return indicators.get("macd")

    if indicator == "EMA":
        return indicators.get("ema20")

    return None


# ============================================================
# EVALUAR ALERTAS DEL SÍMBOLO
# ============================================================

def evaluate_symbol_alerts(
    symbol: str,
    price_data: dict,
    indicators: dict,
):
    db = SessionLocal()

    triggered_events = []

    try:

        alerts = (
            db.query(Alert)
            .filter(
                Alert.symbol == symbol,
                Alert.active.is_(True),
            )
            .all()
        )

        for alert in alerts:

            current_value = get_alert_value(
                indicator=alert.indicator,
                price_data=price_data,
                indicators=indicators,
            )

            if current_value is None:
                continue

            try:

                result = trigger_alert_with_value(
                    db=db,
                    alert=alert,
                    current_value=current_value,
                )

                if result.get("event_created"):

                    triggered_events.append(
                        {
                            "alert_id": result.get(
                                "alert_id"
                            ),
                            "user_id": alert.user_id,
                            "symbol": symbol,
                            "indicator": result.get(
                                "indicator"
                            ),
                            "operator": result.get(
                                "operator"
                            ),
                            "target_value": result.get(
                                "target_value"
                            ),
                            "current_value": result.get(
                                "current_value"
                            ),
                            "event_id": result.get(
                                "event_id"
                            ),
                        }
                    )

            except Exception as alert_error:

                print(
                    f"[WS] Error evaluando alerta "
                    f"{alert.id}: "
                    f"{alert_error}"
                )

        return triggered_events

    finally:

        db.close()


# ============================================================
# WEBSOCKET MARKET
# ============================================================

@router.websocket(
    "/ws/market/{symbol}"
)
async def websocket_market(
    websocket: WebSocket,
    symbol: str,
):

    await websocket.accept()

    symbol = str(
        symbol
    ).strip().upper()

    print(
        f"[WS] Cliente conectado: {symbol}"
    )

    try:

        while True:

            try:

                # =========================================
                # PRECIO
                # =========================================

                price_data = get_price(
                    symbol
                )

                if price_data is None:

                    payload = {
                        "symbol": symbol,
                        "price": None,
                        "error": "No market data",
                    }

                elif isinstance(
                    price_data,
                    dict,
                ):

                    payload = {
                        "symbol": symbol,
                        **price_data,
                    }

                else:

                    payload = {
                        "symbol": symbol,
                        "price": price_data,
                    }

                # =========================================
                # INDICADORES
                # =========================================

                indicators = {}

                try:

                    indicators = get_indicators(
                        symbol
                    )

                    if isinstance(
                        indicators,
                        dict,
                    ):

                        payload["rsi14"] = (
                            indicators.get(
                                "rsi14"
                            )
                        )

                        payload["macd"] = (
                            indicators.get(
                                "macd"
                            )
                        )

                        payload["ema20"] = (
                            indicators.get(
                                "ema20"
                            )
                        )

                    else:

                        indicators = {}

                        payload["rsi14"] = None
                        payload["macd"] = None
                        payload["ema20"] = None

                except Exception as indicator_error:

                    print(
                        f"[WS] Error indicadores "
                        f"{symbol}: "
                        f"{indicator_error}"
                    )

                    indicators = {}

                    payload["rsi14"] = None
                    payload["macd"] = None
                    payload["ema20"] = None

                # =========================================
                # EVALUAR ALERTAS
                # =========================================

                triggered_events = []

                try:

                    if isinstance(
                        price_data,
                        dict,
                    ):

                        triggered_events = (
                            evaluate_symbol_alerts(
                                symbol=symbol,
                                price_data=price_data,
                                indicators=indicators,
                            )
                        )

                except Exception as alert_error:

                    print(
                        f"[WS] Error motor alertas "
                        f"{symbol}: "
                        f"{alert_error}"
                    )

                # =========================================
                # INFORMACIÓN DE ALERTAS DISPARADAS
                # =========================================

                payload["alerts_triggered"] = (
                    len(triggered_events) > 0
                )

                payload["alert_events"] = (
                    triggered_events
                )

                # =========================================
                # LOG
                # =========================================

                print(
                    f"[WS] {symbol}: "
                    f"price={payload.get('price')} "
                    f"rsi14={payload.get('rsi14')} "
                    f"macd={payload.get('macd')} "
                    f"ema20={payload.get('ema20')} "
                    f"alerts={len(triggered_events)}"
                )

                # =========================================
                # ENVIAR DATOS
                # =========================================

                await websocket.send_json(
                    payload
                )

            except WebSocketDisconnect:

                raise

            except Exception as exc:

                error_message = str(
                    exc
                )

                print(
                    f"[WS] Error obteniendo "
                    f"datos de {symbol}: "
                    f"{error_message}"
                )

                try:

                    await websocket.send_json(
                        {
                            "symbol": symbol,
                            "price": None,
                            "rsi14": None,
                            "macd": None,
                            "ema20": None,
                            "alerts_triggered": False,
                            "alert_events": [],
                            "error": error_message,
                        }
                    )

                except Exception:

                    break

                # =========================================
                # RATE LIMIT
                # =========================================

                if (
                    "rate"
                    in error_message.lower()
                    or "too many"
                    in error_message.lower()
                    or "429"
                    in error_message
                ):

                    print(
                        f"[WS] Rate limit detectado "
                        f"para {symbol}. "
                        f"Esperando 15 segundos."
                    )

                    await asyncio.sleep(
                        15
                    )

                    continue

            # =============================================
            # INTERVALO DEL WEBSOCKET
            # =============================================

            await asyncio.sleep(
                2
            )

    except WebSocketDisconnect:

        print(
            f"[WS] Cliente desconectado: {symbol}"
        )

    except Exception as exc:

        print(
            f"[WS] Error conexión "
            f"{symbol}: {exc}"
        )

    finally:

        print(
            f"[WS] Conexión finalizada: {symbol}"
        )