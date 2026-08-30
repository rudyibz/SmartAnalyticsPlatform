from app.analysis.engine import AnalysisEngine


WATCHLIST = [
    "AAPL",
    "MSFT",
    "NVDA",
    "META",
    "AMZN",
    "GOOGL",
    "TSLA",
    "AMD",
    "NFLX",
    "BTC-USD",
    "ETH-USD",
]


analysis_engine = AnalysisEngine()


def market_scan():

    results = []

    for symbol in WATCHLIST:

        try:

            analysis = analysis_engine.analyze(symbol)

            score = analysis["score"]

            trend = (
                "Bullish"
                if score >= 70
                else "Bearish"
                if score <= 30
                else "Neutral"
            )

            results.append(
                {
                    "symbol": symbol,

                    "price": round(
                        float(analysis["price"]),
                        2,
                    ),

                    "score": score,

                    "signal": analysis["signal"],

                    "trend": trend,

                    "risk": analysis["risk"],

                    "recommendation": (
                        analysis["recommendation"]
                    ),
                }
            )

        except Exception as exc:

            print(
                f"[SCANNER] Error loading "
                f"{symbol}: {exc}"
            )

    results.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return results