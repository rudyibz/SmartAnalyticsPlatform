class AIAnalysis:

    def analyze(self, df):

        last = df.iloc[-1]

        close = float(last["Close"])
        ema20 = float(last["EMA20"])
        sma50 = float(last["SMA50"])
        rsi = float(last["RSI"])
        macd = float(last["MACD"])
        macd_signal = float(last["MACD_SIGNAL"])
        adx = float(last["ADX"])
        bb_upper = float(last["BB_UPPER"])
        bb_lower = float(last["BB_LOWER"])

        score = 0

        # RSI
        if rsi < 30:
            score += 2
        elif rsi > 70:
            score -= 2

        # MACD
        if macd > macd_signal:
            score += 2
        else:
            score -= 2

        # EMA20
        if close > ema20:
            score += 1
        else:
            score -= 1

        # SMA50
        if close > sma50:
            score += 1
        else:
            score -= 1

        # ADX
        if adx > 25:
            score += 1

        # Bollinger Bands
        if close < bb_lower:
            score += 1

        if close > bb_upper:
            score -= 1

        # Señal final
        if score >= 5:
            signal = "STRONG BUY"

        elif score >= 2:
            signal = "BUY"

        elif score <= -5:
            signal = "STRONG SELL"

        elif score <= -2:
            signal = "SELL"

        else:
            signal = "HOLD"

        return {
            "signal": signal,
            "score": score,
            "RSI": round(rsi, 2),
            "MACD": round(macd, 4),
            "ADX": round(adx, 2),
            "EMA20": round(ema20, 2),
            "SMA50": round(sma50, 2),
            "Close": round(close, 2),
            "BB_UPPER": round(bb_upper, 2),
            "BB_LOWER": round(bb_lower, 2),
        }