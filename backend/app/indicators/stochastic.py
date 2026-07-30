from ta.momentum import StochasticOscillator


def calculate(df):

    stoch = StochasticOscillator(
        high=df["High"],
        low=df["Low"],
        close=df["Close"],
    )

    df["STOCH_K"] = stoch.stoch()

    df["STOCH_D"] = stoch.stoch_signal()

    return df