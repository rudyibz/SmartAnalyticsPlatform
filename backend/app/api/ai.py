from fastapi import APIRouter

from backend.app.services.analysis_service import analyze_market
from backend.app.ai.openai_service import ask_ai

router = APIRouter(
    prefix="/ai",
    tags=["Artificial Intelligence"],
)


@router.get("/analysis/{symbol}")
def ai_analysis(
    symbol: str,
    period: str = "6mo",
):
    # Obtener análisis técnico
    market = analyze_market(symbol, period)

    prompt = f"""
You are a professional financial analyst.

Analyze this market information.

Symbol: {market["symbol"]}
Price: {market["price"]}
Trend: {market["trend"]}
Score: {market["score"]}
Recommendation: {market["recommendation"]}
Confidence: {market["confidence"]}
Risk: {market["risk"]}

Write:

1. Trend
2. Momentum
3. Risk
4. Trading recommendation
5. Final conclusion

Maximum 200 words.
"""

    # Intentar usar OpenAI
    analysis = ask_ai(prompt)

    # Si OpenAI falla (sin cuota, sin API Key, etc.)
    if analysis is None:

        analysis = f"""
# Technical Analysis

## Trend
{market['trend']}

## Momentum
Current market score: {market['score']}

## Risk
Risk level: {market['risk']}

## Recommendation
{market['recommendation']}

## Confidence
{market['confidence']}

## Summary
{market['summary']}
"""

    return {
        "symbol": market["symbol"],
        "analysis": analysis,
    }