from ta.trend import MACD


def calculate(df):

    macd = MACD(df["Close"])

    df["MACD"] = macd.macd()

    df["MACD_SIGNAL"] = (
        macd.macd_signal()
    )

    df["MACD_HIST"] = (
        macd.macd_diff()
    )

    return df