def calculate_score(
    price: float,
    ema20: float,
    sma50: float,
    rsi14: float,
    macd: float,
    signal: float,
):
    """
    Calcula un score técnico.
    """

    score = 0

    # Tendencia
    if ema20 > sma50:
        score += 20

    # Precio
    if price > ema20:
        score += 20

    if price > sma50:
        score += 20

    # RSI
    if 50 <= rsi14 <= 70:
        score += 20

    # MACD
    if macd > signal:
        score += 20

    # Señal final
    if score >= 80:
        recommendation = "BUY"
    elif score >= 50:
        recommendation = "HOLD"
    else:
        recommendation = "SELL"

    return {
        "score": score,
        "recommendation": recommendation,
    }