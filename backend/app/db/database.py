from pathlib import Path
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import DATABASE_URL

# =====================================================
# Crear carpeta automáticamente
# =====================================================

db_path = DATABASE_URL.replace("sqlite:///", "")

Path(os.path.dirname(db_path)).mkdir(
    parents=True,
    exist_ok=True,
)

# =====================================================
# Engine
# =====================================================

engine = create_engine(
    DATABASE_URL,
    echo=False,
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()