from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.auth_schema import (
    LoginRequest,
    Token,
)
from backend.app.services.auth_service import login_service

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ==========================================
# Login para Frontend (JSON)
# ==========================================

@router.post(
    "/login",
    response_model=Token,
)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    return login_service(
        db,
        credentials.email,
        credentials.password,
    )


# ==========================================
# Login OAuth2 para Swagger
# ==========================================

@router.post(
    "/token",
    response_model=Token,
)
def login_oauth(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    return login_service(
        db,
        form_data.username,   # aquí se escribe el email
        form_data.password,
    )