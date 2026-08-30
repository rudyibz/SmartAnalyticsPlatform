import time

import pandas as pd
import yfinance as yf

from app.services.score_service import calculate_score


# ============================================
# CACHE DE PRECIOS
# ============================================

PRICE_CACHE = {}

PRICE_CACHE_TTL = 10
# ============================================
# NORMALIZACIÓN DE SÍMBOLOS MARKET
# ============================================

def normalize_market_symbol(symbol: str) -> str:
    """
    Convierte los símbolos internos de Smart Analytics
    a símbolos compatibles con Yahoo Finance.
    """

    normalized = str(
        symbol
    ).strip().upper()

    symbol_map = {
        "GOLD": "GC=F",
    }

    return symbol_map.get(
        normalized,
        normalized,
    )


# ============================================
# PRECIO ACTUAL
# ============================================

# ============================================
# PRECIO ACTUAL
# ============================================

def get_price(symbol: str):
    """
    Obtiene el precio actual de un activo.

    Los símbolos internos de Smart Analytics
    se convierten al símbolo real de mercado.

    Utiliza una caché corta para evitar realizar
    peticiones excesivas al proveedor externo.
    """

    internal_symbol = str(
        symbol
    ).strip().upper()

    market_symbol = normalize_market_symbol(
        internal_symbol
    )

    now = time.time()

    cached = PRICE_CACHE.get(
        internal_symbol
    )

    # ========================================
    # CACHE VÁLIDA
    # ========================================

    if cached is not None:

        cached_time = cached.get(
            "timestamp",
            0,
        )

        if (
            now - cached_time
            < PRICE_CACHE_TTL
        ):

            return cached["data"]

    # ========================================
    # PETICIÓN AL MERCADO
    # ========================================

    ticker = yf.Ticker(
        market_symbol
    )

    info = ticker.fast_info

    price = float(
        info["lastPrice"]
    )

    currency = info.get(
        "currency",
        "USD",
    )

    data = {
        "symbol": internal_symbol,
        "market_symbol": market_symbol,
        "price": price,
        "currency": currency,
    }

    # ========================================
    # GUARDAR CACHE
    # ========================================

    PRICE_CACHE[
        internal_symbol
    ] = {
        "timestamp": now,
        "data": data,
    }

    return data


# ============================================
# HISTÓRICO
# ============================================

def get_history(
    symbol: str,
    period: str = "6mo",
):
    """
    Devuelve el histórico OHLC junto con
    indicadores técnicos.
    """

    market_symbol = normalize_market_symbol(
        symbol
    )

    ticker = yf.Ticker(
        market_symbol
    )

    df = ticker.history(
        period=period
    )

    df = df.dropna(subset=["Close"])
    if df.empty:
        return []

    # ==========================
    # EMA20
    # ==========================

    df["EMA20"] = df["Close"].ewm(
        span=20,
        adjust=False,
    ).mean()

    # ==========================
    # SMA50
    # ==========================

    df["SMA50"] = df["Close"].rolling(
        window=50,
    ).mean()

    # ==========================
    # EMA200
    # ==========================

    df["EMA200"] = df["Close"].ewm(
        span=200,
        adjust=False,
    ).mean()

    # ==========================
    # RSI14
    # ==========================

    delta = df["Close"].diff()

    gain = delta.clip(
        lower=0
    )

    loss = -delta.clip(
        upper=0
    )

    avg_gain = gain.rolling(
        14
    ).mean()

    avg_loss = loss.rolling(
        14
    ).mean()

    rs = avg_gain / avg_loss

    df["RSI14"] = (
        100
        - (
            100
            / (
                1 + rs
            )
        )
    )

    # ==========================
    # MACD
    # ==========================

    ema12 = df["Close"].ewm(
        span=12,
        adjust=False,
    ).mean()

    ema26 = df["Close"].ewm(
        span=26,
        adjust=False,
    ).mean()

    df["MACD"] = (
        ema12 - ema26
    )

    df["Signal"] = (
        df["MACD"]
        .ewm(
            span=9,
            adjust=False,
        )
        .mean()
    )

    df["Histogram"] = (
        df["MACD"]
        - df["Signal"]
    )

    # ==========================
    # BOLLINGER
    # ==========================

    sma20 = df["Close"].rolling(
        20
    ).mean()

    std20 = df["Close"].rolling(
        20
    ).std()

    df["BB_UPPER"] = (
        sma20
        + (
            2 * std20
        )
    )

    df["BB_LOWER"] = (
        sma20
        - (
            2 * std20
        )
    )

    # ==========================
    # ATR
    # ==========================

    high_low = (
        df["High"]
        - df["Low"]
    )

    high_close = (
        df["High"]
        - df["Close"].shift()
    ).abs()

    low_close = (
        df["Low"]
        - df["Close"].shift()
    ).abs()

    tr = pd.concat(
        [
            high_low,
            high_close,
            low_close,
        ],
        axis=1,
    ).max(
        axis=1
    )

    df["ATR"] = tr.rolling(
        14
    ).mean()

    candles = []

    for date, row in df.iterrows():

        candles.append(
            {
                "date": date,

                "open": float(
                    row["Open"]
                ),

                "high": float(
                    row["High"]
                ),

                "low": float(
                    row["Low"]
                ),

                "close": float(
                    row["Close"]
                ),

                "volume": float(
                    row["Volume"]
                ),

                "ema20": (
                    None
                    if pd.isna(
                        row["EMA20"]
                    )
                    else round(
                        float(
                            row["EMA20"]
                        ),
                        2,
                    )
                ),

                "sma50": (
                    None
                    if pd.isna(
                        row["SMA50"]
                    )
                    else round(
                        float(
                            row["SMA50"]
                        ),
                        2,
                    )
                ),

                "ema200": (
                    None
                    if pd.isna(
                        row["EMA200"]
                    )
                    else round(
                        float(
                            row["EMA200"]
                        ),
                        2,
                    )
                ),

                "rsi14": (
                    None
                    if pd.isna(
                        row["RSI14"]
                    )
                    else round(
                        float(
                            row["RSI14"]
                        ),
                        2,
                    )
                ),

                "macd": (
                    None
                    if pd.isna(
                        row["MACD"]
                    )
                    else round(
                        float(
                            row["MACD"]
                        ),
                        2,
                    )
                ),

                "signal": (
                    None
                    if pd.isna(
                        row["Signal"]
                    )
                    else round(
                        float(
                            row["Signal"]
                        ),
                        2,
                    )
                ),

                "histogram": (
                    None
                    if pd.isna(
                        row["Histogram"]
                    )
                    else round(
                        float(
                            row["Histogram"]
                        ),
                        2,
                    )
                ),

                "bollinger_upper": (
                    None
                    if pd.isna(
                        row["BB_UPPER"]
                    )
                    else round(
                        float(
                            row["BB_UPPER"]
                        ),
                        2,
                    )
                ),

                "bollinger_lower": (
                    None
                    if pd.isna(
                        row["BB_LOWER"]
                    )
                    else round(
                        float(
                            row["BB_LOWER"]
                        ),
                        2,
                    )
                ),

                "atr": (
                    None
                    if pd.isna(
                        row["ATR"]
                    )
                    else round(
                        float(
                            row["ATR"]
                        ),
                        2,
                    )
                ),
            }
        )

    return candles


# ============================================
# INDICADORES AUXILIARES
# ============================================

def calculate_macd(df):

    ema12 = (
        df["Close"]
        .ewm(
            span=12,
            adjust=False,
        )
        .mean()
    )

    ema26 = (
        df["Close"]
        .ewm(
            span=26,
            adjust=False,
        )
        .mean()
    )

    macd = (
        ema12 - ema26
    )

    signal = (
        macd
        .ewm(
            span=9,
            adjust=False,
        )
        .mean()
    )

    histogram = (
        macd - signal
    )

    return (
        macd,
        signal,
        histogram,
    )


def calculate_bollinger(df):

    sma20 = (
        df["Close"]
        .rolling(20)
        .mean()
    )

    std = (
        df["Close"]
        .rolling(20)
        .std()
    )

    upper = (
        sma20
        + (
            2 * std
        )
    )

    lower = (
        sma20
        - (
            2 * std
        )
    )

    return (
        upper,
        lower,
    )


def calculate_atr(df):

    high_low = (
        df["High"]
        - df["Low"]
    )

    high_close = (
        df["High"]
        - df["Close"].shift()
    ).abs()

    low_close = (
        df["Low"]
        - df["Close"].shift()
    ).abs()

    tr = pd.concat(
        [
            high_low,
            high_close,
            low_close,
        ],
        axis=1,
    ).max(
        axis=1
    )

    atr = (
        tr
        .rolling(14)
        .mean()
    )

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

    market_symbol = normalize_market_symbol(
        symbol
    )

    ticker = yf.Ticker(
        market_symbol
    )

    df = ticker.history(
        period=period
    )

    df = df.dropna(subset=["Close"])
    if df.empty:
        raise ValueError(
            "No hay datos disponibles."
        )

    # ==========================
    # EMA20
    # ==========================

    df["EMA20"] = (
        df["Close"]
        .ewm(
            span=20,
            adjust=False,
        )
        .mean()
    )

    # ==========================
    # SMA50
    # ==========================

    df["SMA50"] = (
        df["Close"]
        .rolling(
            window=50,
        )
        .mean()
    )

    # ==========================
    # RSI14
    # ==========================

    delta = (
        df["Close"]
        .diff()
    )

    gain = (
        delta
        .clip(
            lower=0
        )
    )

    loss = (
        -delta
        .clip(
            upper=0
        )
    )

    avg_gain = (
        gain
        .rolling(14)
        .mean()
    )

    avg_loss = (
        loss
        .rolling(14)
        .mean()
    )

    rs = (
        avg_gain
        / avg_loss
    )

    df["RSI14"] = (
        100
        - (
            100
            / (
                1 + rs
            )
        )
    )

    # ==========================
    # MACD
    # ==========================

    macd, signal, hist = (
        calculate_macd(df)
    )

    # ==========================
    # BOLLINGER
    # ==========================

    upper, lower = (
        calculate_bollinger(df)
    )

    # ==========================
    # ATR
    # ==========================

    atr = (
        calculate_atr(df)
    )

    last = df.iloc[-1]

    trend = (
        "Bullish"
        if last["EMA20"]
        > last["SMA50"]
        else "Bearish"
    )

    score = calculate_score(
        price=float(
            last["Close"]
        ),
        ema20=float(
            last["EMA20"]
        ),
        sma50=float(
            last["SMA50"]
        ),
        rsi14=float(
            last["RSI14"]
        ),
        macd=float(
            macd.iloc[-1]
        ),
        signal=float(
            signal.iloc[-1]
        ),
    )

    return {
        "symbol": symbol.upper(),

        "price": round(
            float(
                last["Close"]
            ),
            2,
        ),

        "ema20": round(
            float(
                last["EMA20"]
            ),
            2,
        ),

        "sma50": round(
            float(
                last["SMA50"]
            ),
            2,
        ),

        "rsi14": round(
            float(
                last["RSI14"]
            ),
            2,
        ),

        "macd": round(
            float(
                macd.iloc[-1]
            ),
            2,
        ),

        "signal": round(
            float(
                signal.iloc[-1]
            ),
            2,
        ),

        "histogram": round(
            float(
                hist.iloc[-1]
            ),
            2,
        ),

        "bollinger_upper": round(
            float(
                upper.iloc[-1]
            ),
            2,
        ),

        "bollinger_lower": round(
            float(
                lower.iloc[-1]
            ),
            2,
        ),

        "atr": round(
            float(
                atr.iloc[-1]
            ),
            2,
        ),

        "trend": trend,

        "score": score[
            "score"
        ],

        "recommendation": score[
            "recommendation"
        ],
    }
