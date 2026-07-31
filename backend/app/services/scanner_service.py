from backend.app.indicators.engine import IndicatorEngine
from backend.app.ai.analysis import AIAnalysis
from backend.app.ai.score_engine import AIScoreEngine

WATCHLIST = [
    "AAPL",
    "MSFT",
    "NVDA",
    "AMZN",
    "GOOGL",
    "META",
    "TSLA",
    "NFLX",
    "AMD",
    "BTC-USD",
    "ETH-USD",
]

engine = IndicatorEngine()
analysis_engine = AIAnalysis()
score_engine = AIScoreEngine()


def market_scan():

    results = []

    for symbol in WATCHLIST:

        try:

            df = engine.calculate(symbol)

            analysis = analysis_engine.analyze(df)

            score = score_engine.calculate(analysis)

            last = df.iloc[-1]

            results.append({

                "symbol": symbol,

                "price": round(float(last["Close"]), 2),

                "score": score["score"],

                "signal": score["signal"],

                "trend": (
                    "Bullish"
                    if score["score"] >= 70
                    else "Bearish"
                    if score["score"] <= 30
                    else "Neutral"
                ),

            })

        except Exception as e:

            print(symbol, e)

    results.sort(
        key=lambda x: x["score"],
        reverse=True,
    )

    return results