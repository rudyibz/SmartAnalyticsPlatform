from ta.volatility import AverageTrueRange


def calculate(df):

    atr = AverageTrueRange(
        high=df["High"],
        low=df["Low"],
        close=df["Close"],
    )

    df["ATR"] = atr.average_true_range()

    return df