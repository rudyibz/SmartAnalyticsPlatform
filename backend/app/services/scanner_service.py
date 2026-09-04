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
            indicators = analysis["indicators"]

            trend = (
                "Bullish"
                if score >= 70
                else "Bearish"
                if score <= 30
                else "Neutral"
            )

            risk = analysis["risk"]

            # =====================================================
            # OPPORTUNITY SCORE
            # =====================================================

            opportunity_score = float(score)

            rsi = indicators.get("RSI")
            macd = indicators.get("MACD")
            adx = indicators.get("ADX")
            ema20 = indicators.get("EMA20")
            sma50 = indicators.get("SMA50")

            # RSI
            if rsi is not None:

                if 40 <= rsi <= 65:
                    opportunity_score += 8

                elif 30 <= rsi < 40:
                    opportunity_score += 5

                elif rsi > 70:
                    opportunity_score -= 8

            # MACD
            if macd is not None:

                if macd > 0:
                    opportunity_score += 6

                else:
                    opportunity_score -= 6

            # ADX
            if adx is not None:

                if adx >= 30:
                    opportunity_score += 6

                elif adx < 15:
                    opportunity_score -= 3

            # EMA20 / SMA50
            if (
                ema20 is not None
                and sma50 is not None
            ):

                if ema20 > sma50:
                    opportunity_score += 5

                else:
                    opportunity_score -= 5

            # Trend
            if trend == "Bullish":
                opportunity_score += 5

            elif trend == "Bearish":
                opportunity_score -= 5

            # Risk
            if risk == "Low":
                opportunity_score += 5

            elif risk == "High":
                opportunity_score -= 8

            opportunity_score = max(
                0,
                min(
                    100,
                    round(opportunity_score),
                ),
            )

            if opportunity_score >= 90:
                opportunity_label = "Excellent"

            elif opportunity_score >= 75:
                opportunity_label = "Strong"

            elif opportunity_score >= 60:
                opportunity_label = "Moderate"

            elif opportunity_score >= 40:
                opportunity_label = "Weak"

            else:
                opportunity_label = "Avoid"

            # =====================================================
            # RESULTADO
            # =====================================================

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

                    "risk": risk,

                    "recommendation": analysis[
                        "recommendation"
                    ],

                    # =============================================
                    # INDICADORES
                    # =============================================

                    "rsi": round(
                        float(rsi),
                        2,
                    ),

                    "macd": round(
                        float(macd),
                        4,
                    ),

                    "adx": round(
                        float(adx),
                        2,
                    ),

                    "ema20": round(
                        float(ema20),
                        2,
                    ),

                    "sma50": round(
                        float(sma50),
                        2,
                    ),

                    # =============================================
                    # OPPORTUNITY
                    # =============================================

                    "opportunity_score": opportunity_score,

                    "opportunity_label": opportunity_label,
                }
            )

        except Exception as exc:

            print(
                f"[SCANNER] Error loading "
                f"{symbol}: {exc}"
            )

    # =============================================================
    # ORDENAR POR OPPORTUNITY SCORE
    # =============================================================

    results.sort(
        key=lambda item: item["opportunity_score"],
        reverse=True,
    )

    return results
