from backend.app.indicators.engine import IndicatorEngine

engine = IndicatorEngine()

df = engine.calculate("AAPL")

print(df.tail())