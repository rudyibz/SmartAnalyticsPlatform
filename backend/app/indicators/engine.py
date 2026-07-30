import yfinance as yf

from backend.app.indicators import adx
from backend.app.indicators import atr
from backend.app.indicators import bollinger
from backend.app.indicators import ema
from backend.app.indicators import macd
from backend.app.indicators import rsi
from backend.app.indicators import sma
from backend.app.indicators import stochastic
from backend.app.indicators import vwap


class IndicatorEngine:

    def calculate(
        self,
        symbol: str,
        period: str = "6mo",
        interval: str = "1d",
    ):

        df = yf.download(
            symbol,
            period=period,
            interval=interval,
            auto_adjust=True,
            progress=False,
        )

        if df.empty:
            raise ValueError(f"No data returned for {symbol}")

        # Compatibilidad con las nuevas versiones de yfinance
        if hasattr(df.columns, "levels"):
            df.columns = df.columns.get_level_values(0)

        df = sma.calculate(df, 20)
        df = sma.calculate(df, 50)

        df = ema.calculate(df, 20)
        df = ema.calculate(df, 50)

        df = rsi.calculate(df)

        df = macd.calculate(df)

        df = bollinger.calculate(df)

        df = atr.calculate(df)

        df = adx.calculate(df)

        df = stochastic.calculate(df)

        df = vwap.calculate(df)

        return df