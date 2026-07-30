from ta.trend import EMAIndicator


def calculate(df, window):

    indicator = EMAIndicator(
        close=df["Close"],
        window=window,
    )

    df[f"EMA{window}"] = indicator.ema_indicator()

    return df