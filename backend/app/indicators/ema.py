from ta.trend import EMAIndicator


def calculate(df, window):

    indicator = EMAIndicator(
        close=df["Close"],
        window=window,
    )

    df[f"EMA_{window}"] = indicator.ema_indicator()

    return df
