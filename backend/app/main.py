"""
SmartAnalyticsPlatform
Punto de entrada principal de la aplicación.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import APP_NAME, VERSION

from app.core.exceptions import (
    SmartAnalyticsException,
    UserAlreadyExistsError,
    InvalidCredentialsError,
)

from app.core.logger import logger

from app.db.init_db import init_database

from app.websocket.market_ws import router as websocket_router

from app.api.users import router as users_router
from app.api.auth import router as auth_router
from app.api.market import router as market_router
from app.api.ai import router as ai_router
from app.api.alerts import router as alert_router
from app.api.news import router as news_router
from app.api.scanner import router as scanner_router
from app.api.user_watchlist import router as user_watchlist_router
from app.api.portfolio import router as portfolio_router
from app.api.portfolio_trade import router as portfolio_trade_router
from app.api.analysis import router as analysis_router
from app.api.score import router as score_router
from app.api.recommendation import router as recommendation_router


@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info(
        "Iniciando SmartAnalyticsPlatform..."
    )

    init_database()

    logger.success(
        "Base de datos inicializada correctamente"
    )

    yield

    logger.info(
        "Cerrando SmartAnalyticsPlatform..."
    )


app = FastAPI(
    title=APP_NAME,
    version=VERSION,
    description=(
        "Plataforma profesional de análisis financiero, "
        "IA y trading."
    ),
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
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =====================================================
# API ROUTERS
# =====================================================

API_PREFIX = "/api/v1"


app.include_router(
    users_router,
    prefix=API_PREFIX,
)


app.include_router(
    auth_router,
    prefix=API_PREFIX,
)


app.include_router(
    market_router,
    prefix=API_PREFIX,
)


app.include_router(
    ai_router,
    prefix=API_PREFIX,
)


app.include_router(
    alert_router,
    prefix=API_PREFIX,
)


app.include_router(
    news_router,
    prefix=API_PREFIX,
)


app.include_router(
    scanner_router,
    prefix=API_PREFIX,
)


app.include_router(
    user_watchlist_router,
    prefix=API_PREFIX,
)


app.include_router(
    portfolio_router,
    prefix=API_PREFIX,
)


app.include_router(
    portfolio_trade_router,
    prefix=API_PREFIX,
)


app.include_router(
    analysis_router,
    prefix=API_PREFIX,
)

app.include_router(
    score_router,
    prefix=API_PREFIX,
)


app.include_router(
    recommendation_router,
    prefix=API_PREFIX,
)


# =====================================================
# WEBSOCKET
# =====================================================

app.include_router(
    websocket_router,
)


# =====================================================
# SYSTEM ENDPOINTS
# =====================================================

@app.get(
    "/",
    tags=["Sistema"],
)
async def root():

    return {
        "application": APP_NAME,
        "version": VERSION,
        "status": "running",
    }


@app.get(
    "/health",
    tags=["Sistema"],
)
async def health():

    return {
        "status": "ok",
        "database": "connected",
    }