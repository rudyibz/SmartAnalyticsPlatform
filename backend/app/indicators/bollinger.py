from ta.volatility import BollingerBands


def calculate(df):

    bb = BollingerBands(df["Close"])

    df["BB_UPPER"] = (
        bb.bollinger_hband()
    )

    df["BB_MIDDLE"] = (
        bb.bollinger_mavg()
    )

    df["BB_LOWER"] = (
        bb.bollinger_lband()
    )

    return df