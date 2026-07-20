from backend.app.db.base import Base
from backend.app.db.database import engine

# Importar TODOS los modelos aquí
from backend.app.models.user import User

print("===================================")
print("Tablas detectadas por SQLAlchemy:")
print(Base.metadata.tables.keys())
print("===================================")

Base.metadata.create_all(bind=engine)

print("Base de datos creada correctamente.")