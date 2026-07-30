from backend.app.db.base import Base
from backend.app.db.database import engine

from backend.app.models.user import User
from backend.app.models.user_watchlist import UserWatchlist
from backend.app.models.portfolio import Portfolio
from backend.app.models.alert import Alert

def init_database():

    print("===================================")
    print("Tablas detectadas por SQLAlchemy:")
    print(Base.metadata.tables.keys())
    print("===================================")

    Base.metadata.create_all(bind=engine)

    print("Base de datos creada correctamente.")