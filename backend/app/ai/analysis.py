class AIAnalysis:

    def analyze(self, df):

        if df is None or df.empty:
            raise ValueError(
                "No hay datos suficientes para realizar el análisis."
            )

        required_columns = [
            "Close",
            "EMA_20",
            "SMA_50",
            "RSI",
            "MACD",
            "MACD_SIGNAL",
            "ADX",
            "BB_UPPER",
            "BB_LOWER",
        ]

        missing = [
            column
            for column in required_columns
            if column not in df.columns
        ]

        if missing:
            raise ValueError(
                f"Faltan indicadores necesarios para el análisis: {missing}"
            )

        last = df.iloc[-1]

        close = float(last["Close"])
        ema20 = float(last["EMA_20"])
        sma50 = float(last["SMA_50"])
        rsi = float(last["RSI"])
        macd = float(last["MACD"])
        macd_signal = float(last["MACD_SIGNAL"])
        adx = float(last["ADX"])
        bb_upper = float(last["BB_UPPER"])
        bb_lower = float(last["BB_LOWER"])

        return {
            "RSI": round(rsi, 2),
            "MACD": round(macd, 4),
            "MACD_SIGNAL": round(macd_signal, 4),
            "ADX": round(adx, 2),
            "EMA20": round(ema20, 2),
            "SMA50": round(sma50, 2),
            "Close": round(close, 2),
            "BB_UPPER": round(bb_upper, 2),
            "BB_LOWER": round(bb_lower, 2),
        }