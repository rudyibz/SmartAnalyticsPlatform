from backend.app.scoring.weights import WEIGHTS
from backend.app.scoring.signals import buy_sell


class ScoringEngine:

    def score(self, df):

        row = df.iloc[-1]

        score = 0

        details = {}

        # RSI
        if row["RSI"] < 30:
            score += WEIGHTS["RSI"]
            details["RSI"] = WEIGHTS["RSI"]
        else:
            details["RSI"] = 0

        # MACD
        if row["MACD"] > row["MACD_SIGNAL"]:
            score += WEIGHTS["MACD"]
            details["MACD"] = WEIGHTS["MACD"]
        else:
            details["MACD"] = 0

        # EMA
        if row["EMA_20"] > row["EMA_50"]:
            score += WEIGHTS["EMA"]
            details["EMA"] = WEIGHTS["EMA"]
        else:
            details["EMA"] = 0

        # SMA
        if row["SMA_20"] > row["SMA_50"]:
            score += WEIGHTS["SMA"]
            details["SMA"] = WEIGHTS["SMA"]
        else:
            details["SMA"] = 0

        # ADX
        if row["ADX"] > 25:
            score += WEIGHTS["ADX"]
            details["ADX"] = WEIGHTS["ADX"]
        else:
            details["ADX"] = 0

        # VWAP
        if row["Close"] > row["VWAP"]:
            score += WEIGHTS["VWAP"]
            details["VWAP"] = WEIGHTS["VWAP"]
        else:
            details["VWAP"] = 0

        # Bollinger
        if row["Close"] < row["BB_LOWER"]:
            score += WEIGHTS["BOLLINGER"]
            details["BOLLINGER"] = WEIGHTS["BOLLINGER"]
        else:
            details["BOLLINGER"] = 0

        # Stochastic
        if row["STOCH_K"] < 20:
            score += WEIGHTS["STOCHASTIC"]
            details["STOCHASTIC"] = WEIGHTS["STOCHASTIC"]
        else:
            details["STOCHASTIC"] = 0

        return {
            "score": score,
            "signal": buy_sell(score),
            "details": details,
        }