from fastapi import APIRouter

from app.indicators.engine import IndicatorEngine
from app.ai.analysis import AIAnalysis
from app.ai.score_engine import AIScoreEngine
from app.ai.recommendation import AIRecommendation

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

    # Calcula indicadores
    df = engine.calculate(symbol)

    # Análisis IA
    analysis_result = analysis.analyze(df)

    # Score IA
    score_result = score_engine.calculate(analysis_result)

    # Recomendación IA (necesita score + RSI + ADX)
    recommendation_result = recommendation_engine.generate({
        **analysis_result,
        **score_result,
    })

    # Respuesta final
    return {
        "symbol": symbol.upper(),
        **analysis_result,
        **score_result,
        **recommendation_result,
    }