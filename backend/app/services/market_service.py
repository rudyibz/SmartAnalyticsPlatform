import pandas as pd
import yfinance as yf

from backend.app.services.score_service import calculate_score


# ============================================
# PRECIO ACTUAL
# ============================================

def get_price(symbol: str):
    """
    Obtiene el precio actual de un activo.
    """
    ticker = yf.Ticker(symbol)
    info = ticker.fast_info

    return {
        "symbol": symbol.upper(),
        "price": float(info["lastPrice"]),
        "currency": info["currency"],
    }


# ============================================
# HISTÓRICO
# ============================================

def get_history(
    symbol: str,
    period: str = "1mo",
):
    """
    Obtiene el histórico OHLC.
    """
    ticker = yf.Ticker(symbol)
    history = ticker.history(period=period)

    candles = []

    for date, row in history.iterrows():
        candles.append(
            {
                "date": date,
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": float(row["Volume"]),
            }
        )

    return candles


# ============================================
# INDICADORES AUXILIARES
# ============================================

def calculate_macd(df):
    ema12 = df["Close"].ewm(span=12, adjust=False).mean()
    ema26 = df["Close"].ewm(span=26, adjust=False).mean()

    macd = ema12 - ema26
    signal = macd.ewm(span=9, adjust=False).mean()
    histogram = macd - signal

    return macd, signal, histogram


def calculate_bollinger(df):
    sma20 = df["Close"].rolling(20).mean()
    std = df["Close"].rolling(20).std()

    upper = sma20 + (2 * std)
    lower = sma20 - (2 * std)

    return upper, lower


def calculate_atr(df):
    high_low = df["High"] - df["Low"]
    high_close = (df["High"] - df["Close"].shift()).abs()
    low_close = (df["Low"] - df["Close"].shift()).abs()

    tr = pd.concat(
        [high_low, high_close, low_close],
        axis=1,
    ).max(axis=1)

    atr = tr.rolling(14).mean()

    return atr


# ============================================
# INDICADORES PRINCIPALES
# ============================================

def get_indicators(
    symbol: str,
    period: str = "6mo",
):
    """
    Calcula indicadores técnicos.
    """

    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period)

    if df.empty:
        raise ValueError("No hay datos disponibles.")

    # EMA20
    df["EMA20"] = df["Close"].ewm(
        span=20,
        adjust=False,
    ).mean()

    # SMA50
    df["SMA50"] = df["Close"].rolling(
        window=50,
    ).mean()

    # RSI14
    delta = df["Close"].diff()

    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(14).mean()
    avg_loss = loss.rolling(14).mean()

    rs = avg_gain / avg_loss

    df["RSI14"] = 100 - (100 / (1 + rs))

    # MACD
    macd, signal, hist = calculate_macd(df)

    # Bollinger
    upper, lower = calculate_bollinger(df)

    # ATR
    atr = calculate_atr(df)

    last = df.iloc[-1]

    trend = (
        "Bullish"
        if last["EMA20"] > last["SMA50"]
        else "Bearish"
    )

    score = calculate_score(
        price=float(last["Close"]),
        ema20=float(last["EMA20"]),
        sma50=float(last["SMA50"]),
        rsi14=float(last["RSI14"]),
        macd=float(macd.iloc[-1]),
        signal=float(signal.iloc[-1]),
    )

    return {
        "symbol": symbol.upper(),
        "price": round(float(last["Close"]), 2),

        "ema20": round(float(last["EMA20"]), 2),
        "sma50": round(float(last["SMA50"]), 2),

        "rsi14": round(float(last["RSI14"]), 2),

        "macd": round(float(macd.iloc[-1]), 2),
        "signal": round(float(signal.iloc[-1]), 2),
        "histogram": round(float(hist.iloc[-1]), 2),

        "bollinger_upper": round(float(upper.iloc[-1]), 2),
        "bollinger_lower": round(float(lower.iloc[-1]), 2),

        "atr": round(float(atr.iloc[-1]), 2),

        "trend": trend,

        "score": score["score"],
        "recommendation": score["recommendation"],
    }