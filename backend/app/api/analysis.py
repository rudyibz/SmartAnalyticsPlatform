from fastapi import APIRouter
from app.analysis.engine import AnalysisEngine

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"],
)

engine = AnalysisEngine()


@router.get(
    "/{symbol}",
    operation_id="market_analysis",
)
def analyze_market(symbol: str):
    return engine.analyze(symbol)
