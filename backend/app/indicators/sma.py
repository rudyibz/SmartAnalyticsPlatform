from ta.trend import SMAIndicator


def calculate(df, window):

    indicator = SMAIndicator(
        close=df["Close"],
        window=window,
    )

    df[f"SMA_{window}"] = indicator.sma_indicator()

    return df
