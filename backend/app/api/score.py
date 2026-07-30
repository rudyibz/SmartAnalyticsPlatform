from fastapi import APIRouter

from backend.app.indicators.engine import IndicatorEngine
from backend.app.ai.analysis import AIAnalysis
from backend.app.ai.score_engine import AIScoreEngine
from backend.app.ai.recommendation import AIRecommendation

router = APIRouter(
    prefix="/score",
    tags=["AI Score"],
)

engine = IndicatorEngine()
analysis = AIAnalysis()
score_engine = AIScoreEngine()
recommendation_engine = AIRecommendation()


@router.get("/{symbol}")
def score(symbol: str):

    df = engine.calculate(symbol)

    analysis_result = analysis.analyze(df)

    score_result = score_engine.calculate(analysis_result)

    recommendation = recommendation_engine.generate(
        score_result["score"]
    )

    return {
        "symbol": symbol.upper(),
        **analysis_result,
        **score_result,
        "recommendation": recommendation,
    }