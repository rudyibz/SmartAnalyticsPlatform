export default function AIAnalysis({
    symbol = "AAPL",
    analysis = null,
    score = null,
    recommendation = null,
    loading = false,
}) {
    if (loading) {
        return (
            <section className="ai-analysis-card">
                <div className="ai-analysis-header">
                    <div>
                        <span className="ai-badge">
                            AI
                        </span>

                        <h2>
                            AI Market Analysis
                        </h2>

                        <p>
                            Analizando {symbol}...
                        </p>
                    </div>
                </div>

                <div className="ai-analysis-grid">
                    {[1, 2, 3, 4, 5, 6].map(
                        (item) => (
                            <div key={item}>
                                <span>—</span>
                                <strong>—</strong>
                            </div>
                        )
                    )}
                </div>
            </section>
        );
    }

    // =========================================================
    // TREND
    // =========================================================

    const trend =
        analysis?.trend ??
        score?.trend ??
        score?.signal ??
        "N/A";

    // =========================================================
    // SCORE
    // =========================================================

    const rawScore =
        score?.score ??
        analysis?.score ??
        null;

    const scoreValue =
        rawScore !== null &&
        rawScore !== undefined &&
        Number.isFinite(Number(rawScore))
            ? Number(rawScore).toFixed(0)
            : "N/A";

    // =========================================================
    // SIGNAL
    // =========================================================

    const signal =
        score?.signal ??
        analysis?.signal ??
        recommendation?.signal ??
        "N/A";

    // =========================================================
    // RISK
    // =========================================================

    const risk =
        recommendation?.risk ??
        analysis?.risk ??
        score?.risk ??
        "N/A";

    // =========================================================
    // CONFIDENCE
    // =========================================================

    const confidence =
        recommendation?.confidence ??
        analysis?.confidence ??
        score?.confidence ??
        "N/A";

    // =========================================================
    // RECOMMENDATION
    // =========================================================

    const recommendationText =
        recommendation?.recommendation ??
        recommendation?.action ??
        analysis?.recommendation ??
        score?.recommendation ??
        "N/A";

    // =========================================================
    // SUMMARY
    // =========================================================

    const summary =
        analysis?.summary ??
        analysis?.description ??
        analysis?.message ??
        recommendation?.summary ??
        "No hay resumen disponible.";

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <section className="ai-analysis-card">

            <div className="ai-analysis-header">

                <div>

                    <span className="ai-badge">
                        AI
                    </span>

                    <h2>
                        AI Market Analysis
                    </h2>

                    <p>
                        {symbol}
                    </p>

                </div>

            </div>

            <div className="ai-analysis-grid">

                <div>
                    <span>Trend</span>

                    <strong>
                        {String(trend)}
                    </strong>
                </div>

                <div>
                    <span>Score</span>

                    <strong>
                        {scoreValue}
                    </strong>
                </div>

                <div>
                    <span>Signal</span>

                    <strong>
                        {String(signal)}
                    </strong>
                </div>

                <div>
                    <span>Risk</span>

                    <strong>
                        {String(risk)}
                    </strong>
                </div>

                <div>
                    <span>Confidence</span>

                    <strong>
                        {String(confidence)}
                    </strong>
                </div>

                <div>
                    <span>Recommendation</span>

                    <strong>
                        {String(
                            recommendationText
                        )}
                    </strong>
                </div>

            </div>

            <div className="ai-analysis-summary">

                <h3>
                    AI Summary
                </h3>

                <p>
                    {String(summary)}
                </p>

            </div>

        </section>
    );
}