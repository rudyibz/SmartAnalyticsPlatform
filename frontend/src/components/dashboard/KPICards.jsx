export default function KPICards({
    data,
    loading = false,
}) {
    const {
        price,
        marketData,
        marketAnalysis,
        score,
        recommendation,
        portfolio,
        wsConnected,
    } = data || {};

    if (loading) {
        return (
            <section className="kpi-grid">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div
                        className="kpi-card"
                        key={item}
                    >
                        <span>Cargando...</span>
                        <strong>—</strong>
                    </div>
                ))}
            </section>
        );
    }

    // =========================================================
    // PRECIO
    // =========================================================

    const currentPrice =
        marketData?.price ??
        price?.price ??
        price?.current_price ??
        price?.close ??
        marketAnalysis?.price ??
        0;

    // =========================================================
    // SCORE IA
    // =========================================================

    const scoreValue =
        score?.score ??
        marketAnalysis?.score ??
        0;

    // =========================================================
    // TENDENCIA
    // =========================================================

    const trend =
        marketAnalysis?.trend ??
        score?.signal ??
        score?.trend ??
        "N/A";

    // =========================================================
    // RIESGO
    // =========================================================

    const risk =
        recommendation?.risk ??
        marketAnalysis?.risk ??
        "N/A";

    // =========================================================
    // VALOR CARTERA
    // =========================================================

    const portfolioValue = Array.isArray(portfolio)
        ? portfolio.reduce(
              (total, position) => {
                  const value =
                      Number(
                          position.market_value ??
                              position.value ??
                              position.total_value ??
                              0
                      );

                  return total + value;
              },
              0
          )
        : 0;

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <section className="kpi-grid">

            <div className="kpi-card">
                <span>Precio actual</span>

                <strong>
                    {Number(currentPrice).toFixed(2)}
                </strong>

                <small>
                    {marketData?.currency ||
                        price?.currency ||
                        "USD"}
                </small>
            </div>

            <div className="kpi-card">
                <span>Score IA</span>

                <strong>
                    {Number(scoreValue).toFixed(0)}
                </strong>
            </div>

            <div className="kpi-card">
                <span>Tendencia</span>

                <strong>
                    {String(trend)}
                </strong>
            </div>

            <div className="kpi-card">
                <span>Riesgo</span>

                <strong>
                    {String(risk)}
                </strong>
            </div>

            <div className="kpi-card">
                <span>Valor cartera</span>

                <strong>
                    {portfolioValue.toFixed(2)}
                </strong>
            </div>

            <div className="kpi-card">
                <span>Mercado</span>

                <strong>
                    {wsConnected
                        ? "ONLINE"
                        : "OFFLINE"}
                </strong>
            </div>

        </section>
    );
}