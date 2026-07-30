from fastapi import APIRouter

from backend.app.indicators.engine import IndicatorEngine
from backend.app.ai.analysis import AIAnalysis
from backend.app.ai.score_engine import AIScoreEngine
from backend.app.ai.recommendation import AIRecommendation

router = APIRouter(
    prefix="/recommendation",
    tags=["AI Recommendation"],
)

engine = IndicatorEngine()
analysis = AIAnalysis()
score_engine = AIScoreEngine()
recommendation_engine = AIRecommendation()


@router.get("/{symbol}")
def recommendation(symbol: str):

    # Calcula indicadores
    df = engine.calculate(symbol)

    # Analiza indicadores
    analysis_result = analysis.analyze(df)

    # Calcula score IA
    score_result = score_engine.calculate(analysis_result)

    # Une ambos diccionarios
    data = {**analysis_result, **score_result}

    # Genera recomendación
    return recommendation_engine.generate(data)