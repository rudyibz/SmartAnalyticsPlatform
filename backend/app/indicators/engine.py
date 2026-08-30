import yfinance as yf

from app.indicators import adx
from app.indicators import atr
from app.indicators import bollinger
from app.indicators import ema
from app.indicators import macd
from app.indicators import rsi
from app.indicators import sma
from app.indicators import stochastic
from app.indicators import vwap


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