from fastapi import APIRouter
from app.indicators.engine import IndicatorEngine
from app.ai.analysis import AIAnalysis

router = APIRouter(
    prefix="/ai-analysis",
    tags=["AI Analysis"],
)

engine = IndicatorEngine()
ai = AIAnalysis()


@router.get(
    "/{symbol}",
    operation_id="ai_analysis",
)
def analyze_with_ai(symbol: str):
    df = engine.calculate(symbol)

    signal = ai.analyze(df)

    return {
        "symbol": symbol.upper(),
        "analysis": signal,
    }
