class AIScoreEngine:

    def calculate(self, analysis: dict):

        score = 50

        # RSI
        rsi = analysis["RSI"]

        if rsi < 30:
            score += 10

        elif rsi > 70:
            score -= 10

        # MACD
        if analysis["MACD"] > 0:
            score += 8
        else:
            score -= 8

        # ADX
        if analysis["ADX"] > 30:
            score += 5

        # EMA20
        if analysis["Close"] > analysis["EMA20"]:
            score += 6
        else:
            score -= 6

        # SMA50
        if analysis["Close"] > analysis["SMA50"]:
            score += 6
        else:
            score -= 6

        # Bollinger
        if analysis["Close"] < analysis["BB_LOWER"]:
            score += 4

        if analysis["Close"] > analysis["BB_UPPER"]:
            score -= 4

        score = max(0, min(score, 100))

        if score >= 85:
            signal = "STRONG BUY"

        elif score >= 70:
            signal = "BUY"

        elif score >= 45:
            signal = "HOLD"

        elif score >= 25:
            signal = "SELL"

        else:
            signal = "STRONG SELL"

        return {
            "score": score,
            "signal": signal,
        }