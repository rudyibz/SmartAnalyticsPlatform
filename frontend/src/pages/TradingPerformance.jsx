import { useEffect, useState } from "react";

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

    const equity = Array.isArray(
        performance?.equity
    )
        ? performance.equity
        : [];


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
                    <strong className="equity-positive">
                        +${bestTrade.toFixed(2)}
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
                                {equity.length} operaciones
                            </span>

                            <span>
                                Desde la primera operación cerrada
                            </span>

                        </div>

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


                {symbolPerformance.length === 0 ? (

                    <div className="scanner-empty">

                        No hay operaciones cerradas por activo todavía.

                    </div>

                ) : (

                    <div className="scanner-table-wrapper">

                        <table className="scanner-table">

                            <thead>

                                <tr>

                                    <th>
                                        SYMBOL
                                    </th>

                                    <th>
                                        TRADES
                                    </th>

                                    <th>
                                        WINNERS
                                    </th>

                                    <th>
                                        LOSERS
                                    </th>

                                    <th>
                                        WIN RATE
                                    </th>

                                    <th>
                                        REALIZED P/L
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {symbolPerformance.map(
                                    (item) => {

                                        const itemPnl =
                                            Number(
                                                item.realized_pnl || 0
                                            );


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

