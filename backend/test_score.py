from app.indicators.engine import IndicatorEngine
from app.scoring.engine import ScoringEngine

indicator = IndicatorEngine()
scoring = ScoringEngine()

df = indicator.calculate("AAPL")

result = scoring.score(df)

print(result)