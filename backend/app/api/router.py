from fastapi import APIRouter

from backend.app.api.users import router as users_router
from backend.app.api.auth import router as auth_router
from backend.app.api.market import router as market_router
from backend.app.api.ai import router as ai_router
from backend.app.api.alert import router as alert_router
api_router = APIRouter()

api_router.include_router(users_router)
api_router.include_router(auth_router)
api_router.include_router(market_router)
api_router.include_router(ai_router)
from backend.app.api.user_watchlist import router as watchlist_router

api_router.include_router(watchlist_router)
from backend.app.api.portfolio import router as portfolio_router

api_router.include_router(portfolio_router)
api_router.include_router(alert_router)
from backend.app.api.analysis import router as analysis_router

api_router.include_router(analysis_router)
from backend.app.api.ai_analysis import router as ai_analysis_router

api_router.include_router(ai_analysis_router)
from backend.app.api.score import router as score_router

api_router.include_router(score_router)
from backend.app.api.recommendation import router as recommendation_router
api_router.include_router(recommendation_router)