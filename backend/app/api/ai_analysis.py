from fastapi import APIRouter

from backend.app.indicators.engine import IndicatorEngine
from backend.app.ai.analysis import AIAnalysis

router = APIRouter(
    prefix="/analysis",
    tags=["AI Analysis"],
)

engine = IndicatorEngine()
ai = AIAnalysis()


@router.get("/{symbol}")
def analyze(symbol: str):
    df = engine.calculate(symbol)

    signal = ai.analyze(df)

    return {
        "symbol": symbol.upper(),
        "analysis": signal,
    }