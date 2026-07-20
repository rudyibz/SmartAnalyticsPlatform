from backend.app.db.base import Base
from backend.app.db.database import engine

# Importar todos los modelos
from backend.app.models.user import User


def init_database() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_database()
    print("Base de datos creada correctamente.")