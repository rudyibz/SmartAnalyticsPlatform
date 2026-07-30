from ta.momentum import RSIIndicator


def calculate(df, period=14):

    indicator = RSIIndicator(
        close=df["Close"],
        window=period,
    )

    df["RSI"] = indicator.rsi()

    return df