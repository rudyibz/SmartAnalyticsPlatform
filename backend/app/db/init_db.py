from app.db.base import Base
from app.db.database import engine

# Importar modelos
from app.models.user import User
from app.models.user_watchlist import UserWatchlist
from app.models.portfolio import Portfolio
from app.models.alert import Alert


def init_database():

    print("=" * 50)
    print("Tablas detectadas:")
    print(Base.metadata.tables.keys())
    print("=" * 50)

    Base.metadata.create_all(bind=engine)

    print("Base de datos inicializada correctamente.")