from fastapi import APIRouter

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
from app.api.ai_analysis import router as ai_analysis_router
from app.api.score import router as score_router
from app.api.recommendation import router as recommendation_router

api_router = APIRouter()


api_router.include_router(
    users_router,
)

api_router.include_router(
    auth_router,
)

api_router.include_router(
    market_router,
)

api_router.include_router(
    ai_router,
)

api_router.include_router(
    alert_router,
)

api_router.include_router(
    news_router,
)

api_router.include_router(
    scanner_router,
)

api_router.include_router(
    user_watchlist_router,
)

api_router.include_router(
    portfolio_router,
)

api_router.include_router(
    portfolio_trade_router,
)

api_router.include_router(
    analysis_router,
)

api_router.include_router(
    ai_analysis_router,
)

api_router.include_router(
    score_router,
)

api_router.include_router(
    recommendation_router,
)
