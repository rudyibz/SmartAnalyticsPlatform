import "./MarketOverview.css";

export default function MarketOverview({
    data,
    loading = false,
}) {
    if (loading) {
        return (
            <section className="market-overview">
                <div className="market-overview-header">
                    <div>
                        <h2>Market Overview</h2>
                        <span>—</span>
                    </div>

                    <div>
                        <strong>—</strong>
                    </div>
                </div>

                <p>
                    Cargando información de mercado...
                </p>
            </section>
        );
    }

    const {
        symbol,
        price,
        marketData,
        indicators,
        marketAnalysis,
        score,
        recommendation,
        wsConnected,
    } = data || {};

    // =========================================================
    // PRECIO EN TIEMPO REAL
    // =========================================================

    const currentPrice =
        marketData?.price ??
        price?.price ??
        price?.current_price ??
        price?.close ??
        marketAnalysis?.price ??
        0;

    const currency =
        marketData?.currency ??
        price?.currency ??
        "USD";

    // =========================================================
    // VARIACIÓN
    // =========================================================

    const change =
        price?.change ??
        price?.change_percent ??
        price?.percentage_change ??
        marketData?.change ??
        0;

    // =========================================================
    // INDICADORES
    // =========================================================

    const rsi =
        indicators?.rsi ??
        indicators?.RSI ??
        "N/A";

    const macd =
        indicators?.macd ??
        indicators?.MACD ??
        "N/A";

    const ema =
        indicators?.ema ??
        indicators?.EMA ??
        "N/A";

    // =========================================================
    // ANÁLISIS
    // =========================================================

    const trend =
        marketAnalysis?.trend ??
        score?.signal ??
        score?.trend ??
        "N/A";

    const recommendationText =
        recommendation?.recommendation ??
        marketAnalysis?.recommendation ??
        score?.recommendation ??
        "N/A";

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <section className="market-overview">

            <div className="market-overview-header">

                <div>
                    <h2>
                        Market Overview
                    </h2>

                    <span>
                        {symbol || "AAPL"}
                    </span>
                </div>

                <div>
                    <strong>
                        {Number(currentPrice).toFixed(2)}
                    </strong>

                    <small>
                        {currency}
                    </small>

                    <small>
                        {Number(change).toFixed(2)}
                    </small>
                </div>

            </div>

            <div className="market-overview-grid">

                <div>
                    <span>RSI</span>

                    <strong>
                        {String(rsi)}
                    </strong>
                </div>

                <div>
                    <span>MACD</span>

                    <strong>
                        {String(macd)}
                    </strong>
                </div>

                <div>
                    <span>EMA</span>

                    <strong>
                        {String(ema)}
                    </strong>
                </div>

                <div>
                    <span>Tendencia</span>

                    <strong>
                        {String(trend)}
                    </strong>
                </div>

                <div>
                    <span>Recomendación</span>

                    <strong>
                        {String(
                            recommendationText
                        )}
                    </strong>
                </div>

                <div>
                    <span>Mercado</span>

                    <strong>
                        {wsConnected
                            ? "ONLINE"
                            : "OFFLINE"}
                    </strong>
                </div>

            </div>

        </section>
    );
}