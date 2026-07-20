"""
SmartAnalyticsPlatform
Punto de entrada principal de la aplicación.
"""
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from backend.app.api.router import api_router
from backend.app.core.config import APP_NAME, VERSION
from backend.app.core.exceptions import (
    SmartAnalyticsException,
    UserAlreadyExistsError,
    InvalidCredentialsError,
)
from backend.app.core.logger import logger
from backend.app.db.init_db import init_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando SmartAnalyticsPlatform...")

    init_database()

    logger.success("Base de datos inicializada correctamente")

    yield

    logger.info("Cerrando SmartAnalyticsPlatform...")


app = FastAPI(
    title=APP_NAME,
    version=VERSION,
    description="Plataforma profesional de análisis financiero, IA y trading.",
    lifespan=lifespan,
)

# =====================================================
# GLOBAL EXCEPTION HANDLERS
# =====================================================

@app.exception_handler(UserAlreadyExistsError)
async def user_exists_exception_handler(
    request: Request,
    exc: UserAlreadyExistsError,
):
    return JSONResponse(
        status_code=409,
        content={
            "detail": exc.message,
        },
    )


@app.exception_handler(InvalidCredentialsError)
async def invalid_credentials_exception_handler(
    request: Request,
    exc: InvalidCredentialsError,
):
    return JSONResponse(
        status_code=401,
        content={
            "detail": exc.message,
        },
    )


@app.exception_handler(SmartAnalyticsException)
async def smartanalytics_exception_handler(
    request: Request,
    exc: SmartAnalyticsException,
):
    return JSONResponse(
        status_code=400,
        content={
            "detail": exc.message,
        },
    )

# =====================================================
# API
# =====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(
    api_router,
    prefix="/api/v1",
)

# =====================================================
# ENDPOINTS
# =====================================================

@app.get("/", tags=["Sistema"])
async def root():
    return {
        "application": APP_NAME,
        "version": VERSION,
        "status": "running",
    }


@app.get("/health", tags=["Sistema"])
async def health():
    return {
        "status": "ok",
        "database": "connected",
    }