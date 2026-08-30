import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.market_service import (
    get_price,
    get_indicators,
)


router = APIRouter()


@router.websocket("/ws/market/{symbol}")
async def websocket_market(
    websocket: WebSocket,
    symbol: str,
):
    await websocket.accept()

    symbol = str(symbol).strip().upper()

    print(
        f"[WS] Cliente conectado: {symbol}"
    )

    try:

        while True:

            try:

                # =========================================
                # PRECIO
                # =========================================

                price_data = get_price(symbol)

                if price_data is None:

                    payload = {
                        "symbol": symbol,
                        "price": None,
                        "error": "No market data",
                    }

                elif isinstance(price_data, dict):

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

                try:

                    indicators = get_indicators(symbol)

                    if isinstance(indicators, dict):

                        payload["rsi14"] = indicators.get(
                            "rsi14"
                        )

                        payload["macd"] = indicators.get(
                            "macd"
                        )

                        payload["ema20"] = indicators.get(
                            "ema20"
                        )

                    else:

                        payload["rsi14"] = None
                        payload["macd"] = None
                        payload["ema20"] = None

                except Exception as indicator_error:

                    print(
                        f"[WS] Error indicadores "
                        f"{symbol}: "
                        f"{indicator_error}"
                    )

                    payload["rsi14"] = None
                    payload["macd"] = None
                    payload["ema20"] = None

                # =========================================
                # LOG
                # =========================================

                print(
                    f"[WS] {symbol}: "
                    f"price={payload.get('price')} "
                    f"rsi14={payload.get('rsi14')} "
                    f"macd={payload.get('macd')} "
                    f"ema20={payload.get('ema20')}"
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

                error_message = str(exc)

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
                            "error": error_message,
                        }
                    )

                except Exception:

                    break

                # =========================================
                # RATE LIMIT
                # =========================================

                if (
                    "rate" in error_message.lower()
                    or "too many" in error_message.lower()
                    or "429" in error_message
                ):

                    print(
                        f"[WS] Rate limit detectado "
                        f"para {symbol}. "
                        f"Esperando 15 segundos."
                    )

                    await asyncio.sleep(15)

                    continue

            await asyncio.sleep(2)

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
