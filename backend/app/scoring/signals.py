def buy_sell(score: int):

    if score >= 95:
        return "STRONG BUY"

    if score >= 80:
        return "BUY"

    if score >= 60:
        return "HOLD"

    if score >= 40:
        return "WEAK"

    return "SELL"