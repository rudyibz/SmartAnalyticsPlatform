from fastapi import APIRouter

from backend.app.services.news_service import get_news

router = APIRouter(
    prefix="/news",
    tags=["News"],
)


@router.get("/{symbol}")
def news(symbol: str):

    return get_news(symbol)