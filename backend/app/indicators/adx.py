from ta.trend import ADXIndicator


def calculate(df):

    adx = ADXIndicator(
        high=df["High"],
        low=df["Low"],
        close=df["Close"],
    )

    df["ADX"] = adx.adx()

    return df