from ta.volume import VolumeWeightedAveragePrice


def calculate(df):

    vwap = VolumeWeightedAveragePrice(
        high=df["High"],
        low=df["Low"],
        close=df["Close"],
        volume=df["Volume"],
    )

    df["VWAP"] = vwap.volume_weighted_average_price()

    return df