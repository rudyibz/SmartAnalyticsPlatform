from app.indicators.engine import IndicatorEngine
from app.ai.analysis import AIAnalysis
from app.ai.score_engine import AIScoreEngine
from app.ai.recommendation import AIRecommendation


class AnalysisEngine:

    def __init__(self):
        self.indicators = IndicatorEngine()
        self.analysis = AIAnalysis()
        self.score_engine = AIScoreEngine()
        self.recommendation = AIRecommendation()

    def analyze(
        self,
        symbol: str,
        period: str = "6mo",
        interval: str = "1d",
    ):

        # =====================================================
        # 1. CALCULAR INDICADORES
        # =====================================================

        df = self.indicators.calculate(
            symbol=symbol,
            period=period,
            interval=interval,
        )

        # =====================================================
        # 2. ANÁLISIS TÉCNICO
        # =====================================================

        analysis_result = self.analysis.analyze(df)

        # =====================================================
        # 3. SCORE ÚNICO
        # =====================================================

        score_result = self.score_engine.calculate(
            analysis_result
        )

        # =====================================================
        # 4. RECOMENDACIÓN
        # =====================================================

        recommendation_result = self.recommendation.generate(
            {
                **analysis_result,
                **score_result,
            }
        )

        # =====================================================
        # 5. RESPUESTA UNIFICADA
        # =====================================================

        return {
            "symbol": symbol.upper(),

            "price": analysis_result["Close"],

            "score": score_result["score"],

            "signal": score_result["signal"],

            "recommendation": recommendation_result[
                "recommendation"
            ],

            "risk": recommendation_result["risk"],

            "indicators": {
                "RSI": analysis_result["RSI"],
                "MACD": analysis_result["MACD"],
                "MACD_SIGNAL": analysis_result["MACD_SIGNAL"],
                "EMA20": analysis_result["EMA20"],
                "SMA50": analysis_result["SMA50"],
                "ADX": analysis_result["ADX"],
                "ATR": (
                    float(df.iloc[-1]["ATR"])
                    if "ATR" in df.columns
                    else None
                ),
                "VWAP": (
                    float(df.iloc[-1]["VWAP"])
                    if "VWAP" in df.columns
                    else None
                ),
                "BB_UPPER": analysis_result["BB_UPPER"],
                "BB_LOWER": analysis_result["BB_LOWER"],
            },

            "analysis": analysis_result,
        }