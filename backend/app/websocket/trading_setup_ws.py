import asyncio

from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
)

from app.db.database import SessionLocal
from app.models.trading_setup import TradingSetup
from app.models.trading_setup_event import (
    TradingSetupEvent,
)


router = APIRouter()


@router.websocket(
    "/ws/trading-setups"
)
async def websocket_trading_setups(
    websocket: WebSocket,
):

    await websocket.accept()

    print(
        "[WS SETUPS] Cliente conectado"
    )

    last_event_id = 0

    try:

        while True:

            db = SessionLocal()

            try:

                active_setups = (
                    db.query(TradingSetup)
                    .filter(
                        TradingSetup.status.in_(
                            [
                                "ACTIVE",
                                "HIT_ENTRY",
                            ]
                        )
                    )
                    .order_by(
                        TradingSetup.id.asc()
                    )
                    .all()
                )

                new_events = (
                    db.query(TradingSetupEvent)
                    .filter(
                        TradingSetupEvent.id
                        > last_event_id
                    )
                    .order_by(
                        TradingSetupEvent.id.asc()
                    )
                    .all()
                )

                setup_payload = []

                for setup in active_setups:

                    setup_payload.append(
                        {
                            "id": setup.id,
                            "symbol": setup.symbol,
                            "direction": setup.direction,
                            "entry": setup.entry,
                            "stop_loss": setup.stop_loss,
                            "take_profit": setup.take_profit,
                            "quantity": setup.quantity,
                            "risk_reward": setup.risk_reward,
                            "status": setup.status,
                            "atr": setup.atr,
                            "opportunity_score": (
                                setup.opportunity_score
                            ),
                            "opportunity_label": (
                                setup.opportunity_label
                            ),
                        }
                    )

                event_payload = []

                for event in new_events:

                    event_payload.append(
                        {
                            "id": event.id,
                            "setup_id": event.setup_id,
                            "symbol": event.symbol,
                            "event_type": event.event_type,
                            "direction": event.direction,
                            "price": event.price,
                            "quantity": event.quantity,
                            "realized_pnl": (
                                event.realized_pnl
                            ),
                            "created_at": (event.created_at.isoformat() if event.created_at else None),
                        }
                    )

                    last_event_id = max(
                        last_event_id,
                        event.id,
                    )

                await websocket.send_json(
                    {
                        "type": "TRADING_SETUP_UPDATE",
                        "setups": setup_payload,
                        "events": event_payload,
                    }
                )

            except Exception as exc:

                print(
                    f"[WS SETUPS] Error: {exc}"
                )

                try:

                    await websocket.send_json(
                        {
                            "type": "TRADING_SETUP_ERROR",
                            "setups": [],
                            "events": [],
                            "error": str(exc),
                        }
                    )

                except Exception:

                    break

            finally:

                db.close()

            await asyncio.sleep(2)

    except WebSocketDisconnect:

        print(
            "[WS SETUPS] Cliente desconectado"
        )

    except Exception as exc:

        print(
            f"[WS SETUPS] Error conexión: {exc}"
        )

    finally:

        print(
            "[WS SETUPS] Conexión finalizada"
        )
