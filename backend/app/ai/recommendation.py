class AIRecommendation:

    def generate(self, analysis: dict):

        score = analysis["score"]

        if score >= 90:
            recommendation = "🔥 Strong Buy"

        elif score >= 75:
            recommendation = "🟢 Buy"

        elif score >= 55:
            recommendation = "🟡 Accumulate"

        elif score >= 45:
            recommendation = "⚪ Hold"

        elif score >= 25:
            recommendation = "🟠 Reduce"

        else:
            recommendation = "🔴 Strong Sell"

        risk = "Medium"

        if analysis["ADX"] > 35:
            risk = "Low"

        if analysis["RSI"] > 75 or analysis["RSI"] < 25:
            risk = "High"

        return {
            "recommendation": recommendation,
            "risk": risk,
            "score": score,
        }