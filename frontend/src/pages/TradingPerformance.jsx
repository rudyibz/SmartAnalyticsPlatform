import {
    useEffect,
    useState,
} from "react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

import {
    getTradingSetupPerformance,
    getTradingSetupPerformanceBySymbol,
} from "../services/api";


export default function TradingPerformance() {

    const [performance, setPerformance] = useState(null);
    const [symbolPerformance, setSymbolPerformance] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    async function loadPerformance() {

        try {

            setError("");

            const [
                performanceData,
                symbolData,
            ] = await Promise.all([
                getTradingSetupPerformance(),
                getTradingSetupPerformanceBySymbol(),
            ]);

            setPerformance(performanceData);

            setSymbolPerformance(
                Array.isArray(symbolData)
                    ? symbolData
                    : []
            );

        } catch (err) {

            console.error(err);

            setError(
                err?.message ||
                "No se pudo cargar la performance."
            );

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {

        loadPerformance();

        const interval = setInterval(
            loadPerformance,
            30000
        );

        return () => clearInterval(interval);

    }, []);


    if (loading) {

        return (
            <main className="scanner-page">

                <div className="scanner-header">

                    <h1>
                        TRADING PERFORMANCE
                    </h1>

                    <p>
                        Cargando estadísticas...
                    </p>

                </div>

            </main>
        );
    }


    if (error) {

        return (
            <main className="scanner-page">

                <div className="scanner-header">

                    <h1>
                        TRADING PERFORMANCE
                    </h1>

                    <p className="error-message">
                        {error}
                    </p>

                </div>

            </main>
        );
    }


const pnl = Number(
    performance?.realized_pnl || 0
);

const averagePnl = Number(
    performance?.average_pnl || 0
);

const averageWinner = Number(
    performance?.average_winner || 0
);

const averageLoser = Number(
    performance?.average_loser || 0
);

const profitFactor = performance?.profit_factor;

const expectancy = Number(
    performance?.expectancy || 0
);

const bestTrade = Number(
    performance?.best_trade || 0
);

const worstTrade = Number(
    performance?.worst_trade || 0
);

const maxDrawdown = Number(
    performance?.max_drawdown || 0
);

const takeProfitTrades = Number(
    performance?.take_profit_trades || 0
);

const stopLossTrades = Number(
    performance?.stop_loss_trades || 0
);

const takeProfitRate = Number(
    performance?.take_profit_rate || 0
);

const stopLossRate = Number(
    performance?.stop_loss_rate || 0
);

const longTrades = Number(
    performance?.long_trades || 0
);

const shortTrades = Number(
    performance?.short_trades || 0
);

const averageRiskReward =
    performance?.average_risk_reward !== null &&
    performance?.average_risk_reward !== undefined
        ? Number(performance.average_risk_reward)
        : null;

const equity = Array.isArray(
    performance?.equity
)
    ? performance.equity
    : [];

const equityChartData = equity.map(
(item, index) => ({
    trade: index + 1,
    pnl: Number(
        item.realized_pnl || 0
    ),
    equity: Number(
        item.equity || 0
    ),
    })
);

const symbolChartData =
    symbolPerformance.map(
        (item) => ({
            symbol: item.symbol,
            pnl: Number(
                item.realized_pnl || 0
            ),
            trades: Number(
                item.trades || 0
            ),
            winRate: Number(
                item.win_rate || 0
            ),
        })
    );
const directionChartData = [
    {
        name: "LONG",
        trades: longTrades,
    },
    {
        name: "SHORT",
        trades: shortTrades,
    },
];

const outcomeChartData = [
    {
        name: "TAKE PROFIT",
        trades: takeProfitTrades,
    },
    {
        name: "STOP LOSS",
        trades: stopLossTrades,
    },
];


    return (

        <main className="scanner-page">


            {/* =================================
                HEADER
            ================================= */}

            <div className="scanner-header">

                <div>

                    <h1>
                        TRADING PERFORMANCE
                    </h1>

                    <p>
                        Rendimiento histórico de los trading setups
                    </p>

                </div>


                <button
                    className="scanner-refresh"
                    onClick={loadPerformance}
                >
                    ↻ Actualizar
                </button>

            </div>


            {/* =================================
                SUMMARY
            ================================= */}

            <div className="scanner-summary">

                <div className="scanner-summary-card">

                    <span>
                        TRADES
                    </span>

                    <strong>
                        {performance?.total || 0}
                    </strong>

                </div>


                <div className="scanner-summary-card">

                    <span>
                        WINNERS
                    </span>

                    <strong>
                        {performance?.winners || 0}
                    </strong>

                </div>


                <div className="scanner-summary-card">

                    <span>
                        LOSERS
                    </span>

                    <strong>
                        {performance?.losers || 0}
                    </strong>

                </div>


                <div className="scanner-summary-card">

                    <span>
                        WIN RATE
                    </span>

                    <strong>
                        {Number(
                            performance?.win_rate || 0
                        ).toFixed(1)}
                        %
                    </strong>

                </div>


                <div className="scanner-summary-card">

                    <span>
                        REALIZED P/L
                    </span>

                    <strong
                        className={
                            pnl >= 0
                                ? "equity-positive"
                                : "equity-negative"
                        }
                    >
                        {pnl >= 0 ? "+" : ""}
                        ${pnl.toFixed(2)}
                    </strong>

                </div>


                <div className="scanner-summary-card">

                    <span>
                        AVERAGE P/L
                    </span>

                    <strong
                        className={
                            averagePnl >= 0
                                ? "equity-positive"
                                : "equity-negative"
                        }
                    >
                        {averagePnl >= 0 ? "+" : ""}
                        ${averagePnl.toFixed(2)}
                    </strong>

                </div>

            </div>

                        {/* =================================
                ADVANCED METRICS
            ================================= */}

            <div className="scanner-summary">

                <div className="scanner-summary-card">
                    <span>AVERAGE WINNER</span>
                    <strong className="equity-positive">
                        +${averageWinner.toFixed(2)}
                    </strong>
                </div>

                <div className="scanner-summary-card">
                    <span>AVERAGE LOSER</span>
                    <strong className="equity-negative">
                        ${averageLoser.toFixed(2)}
                    </strong>
                </div>

                <div className="scanner-summary-card">
                    <span>PROFIT FACTOR</span>
                    <strong>
                        {profitFactor !== null &&
                        profitFactor !== undefined
                            ? Number(profitFactor).toFixed(2)
                            : "—"}
                    </strong>
                </div>

                <div className="scanner-summary-card">
                    <span>EXPECTANCY</span>
                    <strong
                        className={
                            expectancy >= 0
                                ? "equity-positive"
                                : "equity-negative"
                        }
                    >
                        {expectancy >= 0 ? "+" : ""}
                        ${expectancy.toFixed(2)}
                    </strong>
                </div>

                <div className="scanner-summary-card">
                    <span>BEST TRADE</span>
                    <strong
                        className={
                            bestTrade >= 0
                                ? "equity-positive"
                                : "equity-negative"
                        }
                    >
                        {bestTrade >= 0 ? "+" : ""}
                        ${bestTrade.toFixed(2)}
                    </strong>
                </div>

                <div className="scanner-summary-card">
                    <span>WORST TRADE</span>
                    <strong className="equity-negative">
                        ${worstTrade.toFixed(2)}
                    </strong>
                </div>

                <div className="scanner-summary-card">
                    <span>MAX DRAWDOWN</span>
                    <strong className="equity-negative">
                        -${maxDrawdown.toFixed(2)}
                    </strong>
                </div>

            </div>
            {/* =================================
    OUTCOME & DIRECTION
================================= */}

<div className="scanner-summary">

    <div className="scanner-summary-card">
        <span>TAKE PROFIT</span>
        <strong className="equity-positive">
            {takeProfitTrades}
        </strong>
    </div>

    <div className="scanner-summary-card">
        <span>TP RATE</span>
        <strong className="equity-positive">
            {takeProfitRate.toFixed(1)}%
        </strong>
    </div>

    <div className="scanner-summary-card">
        <span>STOP LOSS</span>
        <strong className="equity-negative">
            {stopLossTrades}
        </strong>
    </div>

    <div className="scanner-summary-card">
        <span>SL RATE</span>
        <strong className="equity-negative">
            {stopLossRate.toFixed(1)}%
        </strong>
    </div>

    <div className="scanner-summary-card">
        <span>LONG</span>
        <strong>
            {longTrades}
        </strong>
    </div>

    <div className="scanner-summary-card">
        <span>SHORT</span>
        <strong>
            {shortTrades}
        </strong>
    </div>

    <div className="scanner-summary-card">
        <span>AVG RISK / REWARD</span>
        <strong>
            {averageRiskReward !== null
                ? averageRiskReward.toFixed(2)
                : "—"}
        </strong>
    </div>

</div>


            {/* =================================
                EQUITY CURVE
            ================================= */}

            <section className="scanner-section">

                <div className="scanner-section-header">

                    <h2>
                        EQUITY CURVE
                    </h2>

                </div>


                {equity.length === 0 ? (

                    <div className="scanner-empty">

                        No hay operaciones cerradas todavía.

                    </div>

                ) : (

                    <div className="equity-chart-container">

                        <div className="equity-chart-header">

                            <div>

                                <span>
                                    ACCUMULATED REALIZED P/L
                                </span>

                                <strong
                                    className={
                                        pnl >= 0
                                            ? "equity-positive"
                                            : "equity-negative"
                                    }
                                >
                                    {pnl >= 0 ? "+" : ""}
                                    ${pnl.toFixed(2)}
                                </strong>

                            </div>

                        </div>


                        <div className="equity-chart">

                            {(() => {

                                const values =
                                    equity.map(
                                        item =>
                                            Number(
                                                item.equity || 0
                                            )
                                    );


                                const min =
                                    Math.min(
                                        0,
                                        ...values
                                    );


                                const max =
                                    Math.max(
                                        0,
                                        ...values
                                    );


                                const range =
                                    max - min || 1;


                                const width = 900;
                                const height = 320;

                                const paddingX = 40;
                                const paddingY = 30;


                                const chartWidth =
                                    width -
                                    paddingX * 2;


                                const chartHeight =
                                    height -
                                    paddingY * 2;


                                const points =
                                    equity.map(
                                        (item, index) => {

                                            const x =
                                                paddingX +
                                                (
                                                    index /
                                                    Math.max(
                                                        equity.length - 1,
                                                        1
                                                    )
                                                ) *
                                                chartWidth;


                                            const value =
                                                Number(
                                                    item.equity || 0
                                                );


                                            const y =
                                                paddingY +
                                                (
                                                    (max - value) /
                                                    range
                                                ) *
                                                chartHeight;


                                            return {
                                                x,
                                                y,
                                                value,
                                            };

                                        }
                                    );


                                const polyline =
                                    points
                                        .map(
                                            point =>
                                                `${point.x},${point.y}`
                                        )
                                        .join(" ");


                                const zeroY =
                                    paddingY +
                                    (
                                        (max - 0) /
                                        range
                                    ) *
                                    chartHeight;


                                return (

                                    <svg
                                        viewBox={`0 0 ${width} ${height}`}
                                        preserveAspectRatio="none"
                                        className="equity-svg"
                                    >

                                        <line
                                            x1={paddingX}
                                            y1={zeroY}
                                            x2={
                                                width -
                                                paddingX
                                            }
                                            y2={zeroY}
                                            className="equity-zero-line"
                                        />


                                        <polyline
                                            points={polyline}
                                            className={
                                                pnl >= 0
                                                    ? "equity-line positive"
                                                    : "equity-line negative"
                                            }
                                        />


                                        {points.map(
                                            (
                                                point,
                                                index
                                            ) => (

                                                <circle
                                                    key={index}
                                                    cx={point.x}
                                                    cy={point.y}
                                                    r="5"
                                                    className={
                                                        point.value >= 0
                                                            ? "equity-point positive"
                                                            : "equity-point negative"
                                                    }
                                                />

                                            )
                                        )}

                                    </svg>

                                );

                            })()}

                        </div>


                        <div className="equity-chart-footer">

                            <span>
                                {equity.length === 1
                                        ? "1 operación"
                                        : `${equity.length} operaciones`}
                            </span>

                            <span>
                                Desde la primera operación cerrada
                            </span>

                        </div>

                    </div>

                )}

            </section>

            {/* =================================
    P&L CHART
================================= */}

<section className="scanner-section">

    <div className="scanner-section-header">

        <h2>
            P&L PERFORMANCE
        </h2>

    </div>


    {equityChartData.length === 0 ? (

        <div className="scanner-empty">
            No hay datos suficientes para mostrar el gráfico.
        </div>

    ) : (

        <div className="equity-chart-container">

            <ResponsiveContainer
                width="100%"
                height={320}
            >

                <LineChart
                    data={equityChartData}
                    margin={{
                        top: 20,
                        right: 20,
                        left: 10,
                        bottom: 10,
                    }}
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="trade"
                        tickFormatter={
                            (value) =>
                                `#${value}`
                        }
                    />

                    <YAxis
                        tickFormatter={(value) =>
                            `$${Number(value).toFixed(0)}`
                        }
                    />

                    <Line
                        type="monotone"
                        dataKey="equity"
                        strokeWidth={3}
                        dot={false}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    )}

</section>


            {/* =================================
                CLOSED TRADES
            ================================= */}

            <section className="scanner-section">

                <div className="scanner-section-header">

                    <h2>
                        CLOSED TRADES
                    </h2>

                </div>


                {equity.length === 0 ? (

                    <div className="scanner-empty">

                        No hay operaciones cerradas todavía.

                    </div>

                ) : (

                    <div className="scanner-table-wrapper">

                        <table className="scanner-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        SYMBOL
                                    </th>

                                    <th>
                                        DIRECTION
                                    </th>

                                    <th>
                                        QUANTITY
                                    </th>

                                    <th>
                                        STATUS
                                    </th>

                                    <th>
                                        REALIZED P/L
                                    </th>

                                    <th>
                                        CUMULATIVE P/L
                                    </th>

                                    <th>
                                        CLOSED
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {equity.map(
                                    (trade) => {

                                        const tradePnl =
                                            Number(
                                                trade.realized_pnl || 0
                                            );


                                        const cumulative =
                                            Number(
                                                trade.equity || 0
                                            );


                                        return (

                                            <tr
                                                key={trade.id}
                                            >

                                                <td>
                                                    #{trade.id}
                                                </td>


                                                <td>

                                                    <strong>
                                                        {trade.symbol}
                                                    </strong>

                                                </td>
                                                <td>
                                                    <strong>
                                                        {trade.direction || "—"}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {trade.quantity ?? "—"}
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            trade.status ===
                                                            "HIT_TP"
                                                                ? "status-badge hit-tp"
                                                                : "status-badge hit-sl"
                                                        }
                                                    >
                                                        {trade.status}
                                                    </span>

                                                </td>


                                                <td>

                                                    <strong
                                                        className={
                                                            tradePnl >= 0
                                                                ? "equity-positive"
                                                                : "equity-negative"
                                                        }
                                                    >
                                                        {tradePnl >= 0
                                                            ? "+"
                                                            : ""}
                                                        $
                                                        {tradePnl.toFixed(2)}
                                                    </strong>

                                                </td>


                                                <td>

                                                    <strong
                                                        className={
                                                            cumulative >= 0
                                                                ? "equity-positive"
                                                                : "equity-negative"
                                                        }
                                                    >
                                                        {cumulative >= 0
                                                            ? "+"
                                                            : ""}
                                                        $
                                                        {cumulative.toFixed(2)}
                                                    </strong>

                                                </td>


                                                <td>

                                                    {trade.closed_at
                                                        ? new Date(
                                                            trade.closed_at
                                                        ).toLocaleString()
                                                        : "—"}

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =================================
                PERFORMANCE BY ASSET
            ================================= */}

            <section className="scanner-section">

                <div className="scanner-section-header">

                    <h2>
                        PERFORMANCE BY ASSET
                    </h2>

                </div>
{/* =================================
    P&L BY ASSET
================================= */}

<section className="scanner-section">

    <div className="scanner-section-header">

        <h2>
            P&L BY ASSET
        </h2>

    </div>


    {symbolChartData.length === 0 ? (

        <div className="scanner-empty">
            No hay datos suficientes para mostrar el gráfico.
        </div>

    ) : (

        <div className="equity-chart-container">

            <ResponsiveContainer
                width="100%"
                height={320}
            >

                <BarChart
                    data={symbolChartData}
                    margin={{
                        top: 20,
                        right: 20,
                        left: 10,
                        bottom: 10,
                    }}
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="symbol"
                    />

                    <YAxis
                        tickFormatter={(value) =>
                            `$${Number(value).toFixed(0)}`
                        }
                    />

                    <Bar
                        dataKey="pnl"
                        name="Realized P/L"
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    )}

</section>

{/* =================================
    LONG VS SHORT
================================= */}

<section className="scanner-section">

    <div className="scanner-section-header">

        <h2>
            LONG VS SHORT
        </h2>

    </div>


    <div className="equity-chart-container">

        <ResponsiveContainer
            width="100%"
            height={300}
        >

            <BarChart
                data={directionChartData}
                margin={{
                    top: 20,
                    right: 20,
                    left: 10,
                    bottom: 10,
                }}
            >

                <CartesianGrid
                    strokeDasharray="3 3"
                />

                <XAxis
                    dataKey="name"
                />

                <YAxis
                    allowDecimals={false}
                />

                <Tooltip />

                <Bar
                    dataKey="trades"
                    name="Trades"
                />

            </BarChart>

        </ResponsiveContainer>

    </div>

</section>
{/* =================================
    TAKE PROFIT VS STOP LOSS
================================= */}

<section className="scanner-section">

    <div className="scanner-section-header">

        <h2>
            TAKE PROFIT VS STOP LOSS
        </h2>

    </div>


    <div className="equity-chart-container">

        <ResponsiveContainer
            width="100%"
            height={300}
        >

            <BarChart
                data={outcomeChartData}
                margin={{
                    top: 20,
                    right: 20,
                    left: 10,
                    bottom: 10,
                }}
            >

                <CartesianGrid
                    strokeDasharray="3 3"
                />

                <XAxis
                    dataKey="name"
                />

                <YAxis
                    allowDecimals={false}
                />

                <Tooltip />

                <Bar
                    dataKey="trades"
                    name="Trades"
                />

            </BarChart>

        </ResponsiveContainer>

    </div>

</section>
                {symbolPerformance.length === 0 ? (

                    <div className="scanner-empty">

                        No hay operaciones cerradas por activo todavía.

                    </div>

                ) : (

                    <div className="scanner-table-wrapper">

                        <table className="scanner-table">

                            <thead>

                                    <tr>

                                        <th>SYMBOL</th>

                                        <th>TRADES</th>

                                        <th>WIN RATE</th>

                                        <th>LONG</th>

                                        <th>SHORT</th>

                                        <th>TP</th>

                                        <th>SL</th>

                                        <th>AVG P/L</th>

                                        <th>PROFIT FACTOR</th>

                                        <th>AVG R/R</th>

                                        <th>REALIZED P/L</th>

                                    </tr>

                                </thead>


                            <tbody>

                                {symbolPerformance.map(
                                    (item) => {

                                        const itemPnl =
                                            Number(
                                                item.realized_pnl || 0
                                            );
                                        const itemAveragePnl =
                                            Number(
                                                item.average_pnl || 0
                                            );

                                        const itemProfitFactor =
                                            item.profit_factor !== null &&
                                            item.profit_factor !== undefined
                                                ? Number(item.profit_factor)
                                                : null;

                                        const itemAverageRiskReward =
                                            item.average_risk_reward !== null &&
                                            item.average_risk_reward !== undefined
                                                ? Number(item.average_risk_reward)
                                                : null;


                                        return (

                                            <tr
                                                key={item.symbol}
                                            >

                                                <td>

                                                    <strong>
                                                        {item.symbol}
                                                    </strong>

                                                </td>


                                                <td>
                                                    {item.trades}
                                                </td>


                                                <td>
                                                    {item.winners}
                                                </td>


                                                <td>
                                                    {item.losers}
                                                </td>


                                                <td>

                                                    {Number(
                                                        item.win_rate || 0
                                                    ).toFixed(1)}
                                                    %

                                                </td>


                                                <td>

                                                    <strong
                                                        className={
                                                            itemPnl >= 0
                                                                ? "equity-positive"
                                                                : "equity-negative"
                                                        }
                                                    >
                                                        {itemPnl >= 0
                                                            ? "+"
                                                            : ""}
                                                        $
                                                        {itemPnl.toFixed(2)}
                                                    </strong>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </main>
    );
}

