from app.services.market_service import get_indicators


def analyze_market(
    symbol: str,
    period: str = "6mo",
):
    """
    Genera un análisis técnico del activo.
    """

    data = get_indicators(symbol, period)

    recommendation = data["recommendation"]
    score = data["score"]

    if score >= 80:
        confidence = "High"
        risk = "Low"

    elif score >= 50:
        confidence = "Medium"
        risk = "Medium"

    else:
        confidence = "Low"
        risk = "High"

    summary = (
        f"{symbol.upper()} presenta una tendencia "
        f"{data['trend']}. "
        f"El RSI es {data['rsi14']}, "
        f"el MACD es {data['macd']} y "
        f"la recomendación actual es "
        f"{recommendation}."
    )

    return {
    "symbol": symbol.upper(),
    "price": data["price"],

    "trend": data["trend"],

    "rsi14": data["rsi14"],
    "macd": data["macd"],
    "signal": data["signal"],

    "score": score,
    "recommendation": recommendation,

    "confidence": confidence,
    "risk": risk,

    "summary": summary,
}