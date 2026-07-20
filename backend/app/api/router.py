from fastapi import APIRouter

from backend.app.api.users import router as users_router
from backend.app.api.auth import router as auth_router
from backend.app.api.market import router as market_router

api_router = APIRouter()

api_router.include_router(users_router)
api_router.include_router(auth_router)
api_router.include_router(market_router)