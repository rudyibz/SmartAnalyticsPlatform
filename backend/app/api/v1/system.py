from fastapi import APIRouter

from app.core.config import APP_NAME
from app.core.config import VERSION

router = APIRouter()


@router.get("/")
async def system():

    return {

        "application": APP_NAME,

        "version": VERSION,

        "environment": "development"

    }