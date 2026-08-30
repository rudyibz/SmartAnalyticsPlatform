import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

function normalizeHistory(history) {
    if (!Array.isArray(history)) {
        return [];
    }

    return history
        .map((item) => {
            const date =
                item.date ??
                item.datetime ??
                item.timestamp ??
                item.time ??
                "";

            const close =
                item.close ??
                item.Close ??
                item.price ??
                0;

            return {
                date: String(date).slice(0, 10),
                close: Number(close),
            };
        })
        .filter((item) =>
            Number.isFinite(item.close)
        );
}

export default function TradingChart({
    symbol = "AAPL",
    history = [],
    marketData = null,
    loading = false,
}) {
    const historicalData =
        normalizeHistory(history);

    const realtimePrice =
        Number(marketData?.price);

    const hasRealtimePrice =
        Number.isFinite(realtimePrice);

    const data = [...historicalData];

    if (hasRealtimePrice) {
        const today =
            new Date()
                .toISOString()
                .slice(0, 10);

        const last =
            data[data.length - 1];

        if (last?.date === today) {
            data[data.length - 1] = {
                ...last,
                close: realtimePrice,
            };
        } else {
            data.push({
                date: today,
                close: realtimePrice,
            });
        }
    }

    return (
        <section className="trading-chart">

            <div className="trading-chart-header">

                <div>
                    <h2>
                        {symbol} — Price Chart
                    </h2>

                    <span>
                        {hasRealtimePrice
                            ? "Mercado en tiempo real"
                            : "Histórico de mercado"}
                    </span>
                </div>

                {hasRealtimePrice && (
                    <strong>
                        {realtimePrice.toFixed(2)} USD
                    </strong>
                )}

            </div>

            {loading ? (
                <div className="chart-empty">
                    Cargando gráfico...
                </div>
            ) : data.length === 0 ? (
                <div className="chart-empty">
                    No hay datos históricos disponibles.
                </div>
            ) : (
                <div
                    style={{
                        width: "100%",
                        height: 360,
                    }}
                >
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <AreaChart
                            data={data}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="date"
                            />

                            <YAxis
                                domain={[
                                    "auto",
                                    "auto",
                                ]}
                            />

                            <Tooltip />

                            <Area
                                type="monotone"
                                dataKey="close"
                                name="Precio"
                                strokeWidth={2}
                                fillOpacity={0.15}
                                isAnimationActive={false}
                            />

                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

        </section>
    );
}