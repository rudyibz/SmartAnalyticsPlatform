"""
Sistema de logging profesional.

Utiliza Loguru para registrar:
- Consola
- Archivo rotativo
"""

import sys

from loguru import logger

from app.core.config import LOG_FILE, LOG_LEVEL

logger.remove()

logger.add(
    sys.stdout,
    level=LOG_LEVEL,
    colorize=True,
    enqueue=True,
)

logger.add(
    LOG_FILE,
    level=LOG_LEVEL,
    rotation="10 MB",
    retention="30 days",
    compression="zip",
    enqueue=True,
)

__all__ = ["logger"]