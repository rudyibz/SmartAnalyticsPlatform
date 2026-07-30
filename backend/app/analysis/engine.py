from backend.app.indicators.engine import IndicatorEngine
from backend.app.scoring.engine import ScoringEngine


class AnalysisEngine:

    def __init__(self):
        self.indicators = IndicatorEngine()
        self.scoring = ScoringEngine()

    def analyze(
        self,
        symbol: str,
        period: str = "6mo",
        interval: str = "1d",
    ):

        df = self.indicators.calculate(
            symbol=symbol,
            period=period,
            interval=interval,
        )

        score = self.scoring.score(df)

        latest = df.iloc[-1]

        return {
            "symbol": symbol.upper(),

            "price": float(latest["Close"]),

            "score": score["score"],

            "signal": score["signal"],

            "details": score["details"],

            "indicators": {

                "RSI": float(latest["RSI"]),

                "MACD": float(latest["MACD"]),

                "EMA20": float(latest["EMA_20"]),

                "EMA50": float(latest["EMA_50"]),

                "SMA20": float(latest["SMA_20"]),

                "SMA50": float(latest["SMA_50"]),

                "ADX": float(latest["ADX"]),

                "ATR": float(latest["ATR"]),

                "VWAP": float(latest["VWAP"]),

            }

        }