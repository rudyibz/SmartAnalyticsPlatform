import asyncio

from app.db.database import SessionLocal
from app.services.trading_setup_monitor import (
    evaluate_active_setups,
)
from app.core.logger import logger


MONITOR_INTERVAL = 30


def _run_monitor_cycle():
    db = SessionLocal()

    try:
        results = evaluate_active_setups(db)

        if results:
            logger.info(
                f"Trading Setup Monitor: "
                f"{len(results)} setup(s) evaluado(s)."
            )

    except Exception as exc:
        logger.error(
            f"Error en Trading Setup Monitor: "
            f"{exc}"
        )

    finally:
        db.close()


async def trading_setup_monitor():
    logger.info(
        "Trading Setup Monitor iniciado."
    )

    try:
        while True:

            await asyncio.to_thread(
                _run_monitor_cycle
            )

            await asyncio.sleep(
                MONITOR_INTERVAL
            )

    except asyncio.CancelledError:
        logger.info(
            "Trading Setup Monitor detenido."
        )
        raise
