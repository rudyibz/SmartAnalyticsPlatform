"""
SmartAnalyticsPlatform
core/config.py
"""

from pathlib import Path
from dotenv import load_dotenv
import os

# =====================================================
# RUTAS
# =====================================================

BASE_DIR = Path(__file__).resolve().parents[3]

BACKEND_DIR = BASE_DIR / "backend"
APP_DIR = BACKEND_DIR / "app"

DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = DATA_DIR / "models"
EXPORTS_DIR = DATA_DIR / "exports"
BACKUPS_DIR = DATA_DIR / "backups"

LOGS_DIR = BASE_DIR / "logs"
DOCS_DIR = BASE_DIR / "docs"

for directory in (
    DATA_DIR,
    RAW_DATA_DIR,
    PROCESSED_DATA_DIR,
    MODELS_DIR,
    EXPORTS_DIR,
    BACKUPS_DIR,
    LOGS_DIR,
    DOCS_DIR,
):
    directory.mkdir(parents=True, exist_ok=True)

# =====================================================
# VARIABLES DE ENTORNO
# =====================================================

load_dotenv(BASE_DIR / ".env")

APP_NAME = os.getenv("APP_NAME", "SmartAnalyticsPlatform")
VERSION = os.getenv("VERSION", "1.0.0")

DEBUG = os.getenv("DEBUG", "False").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# =====================================================
# BASE DE DATOS
# =====================================================

DB_FILE = DATA_DIR / "smartanalytics.db"

DATABASE_URL = f"sqlite:///{DB_FILE.as_posix()}"

print("=" * 50)
print("BASE_DIR      :", BASE_DIR)
print("DATABASE FILE :", DB_FILE)
print("DATABASE URL  :", DATABASE_URL)
print("=" * 50)

# =====================================================
# OPENAI
# =====================================================

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# =====================================================
# JWT
# =====================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "CHANGE_THIS_SECRET_IN_PRODUCTION"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)
)

DEFAULT_SYMBOL = os.getenv("DEFAULT_SYMBOL", "EURUSD")
DEFAULT_TIMEFRAME = os.getenv("DEFAULT_TIMEFRAME", "H1")

LOG_FILE = LOGS_DIR / "smartanalytics.log"