from fastapi import APIRouter

from backend.app.analysis.engine import AnalysisEngine

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"],
)

engine = AnalysisEngine()


@router.get("/{symbol}")
def analyze(symbol: str):

    return engine.analyze(symbol)