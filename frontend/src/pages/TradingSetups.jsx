
import { useEffect, useState } from "react";
import {
    getTradingSetupHistory,
    closeTradingSetup,
} from "../services/api";

export default function TradingSetups() {

    const [setups, setSetups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const stats = {
        total: setups.length,

        active: setups.filter(
            (setup) => setup.status === "ACTIVE"
        ).length,

        hitEntry: setups.filter(
            (setup) => setup.status === "HIT_ENTRY"
        ).length,

        hitTP: setups.filter(
            (setup) => setup.status === "HIT_TP"
        ).length,

        hitSL: setups.filter(
            (setup) => setup.status === "HIT_SL"
        ).length,

        closed: setups.filter(
            (setup) => setup.status === "CLOSED"
        ).length,

        wins: setups.filter(
            (setup) => setup.status === "HIT_TP"
        ).length,

        losses: setups.filter(
            (setup) => setup.status === "HIT_SL"
        ).length,
    };

    const completedTrades = stats.wins + stats.losses;

    const winRate =
        completedTrades > 0
            ? ((stats.wins / completedTrades) * 100).toFixed(1)
            : "—";

    const realizedPnL = setups.reduce(
        (total, setup) => {
            if (
                setup.realized_pnl !== null &&
                setup.realized_pnl !== undefined
            ) {
                return total + Number(setup.realized_pnl);
            }

            return total;
        },
        0
    );

    async function loadSetups() {
        try {
            setLoading(true);
            setError("");

            const data = await getTradingSetupHistory();

            setSetups(
                Array.isArray(data)
                    ? data
                    : data?.data || []
            );

        } catch (err) {
            console.error(err);

            setError(
                err?.message ||
                "No se pudieron cargar los setups."
            );

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSetups();

        const interval = setInterval(() => {
            loadSetups();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    async function handleCloseSetup(setupId) {
        try {
            await closeTradingSetup(setupId);
            await loadSetups();

        } catch (err) {
            console.error(err);

            alert(
                err?.message ||
                "No se pudo cerrar el setup."
            );
        }
    }

    return (

        <main className="scanner-page">

            <div className="scanner-header">

                <div>

                    <h1>
                        Trading Setups
                    </h1>

                    <p>
                        Historial de oportunidades detectadas por el Scanner.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={loadSetups}
                    disabled={loading}
                >
                    {loading ? "Cargando..." : "Actualizar"}
                </button>

            </div>

            {error && (
                <div className="scanner-error">
                    {error}
                </div>
            )}

            {!loading && !error && setups.length > 0 && (

                <div className="scanner-summary">

                    <div className="scanner-summary-card">
                        <span>TOTAL</span>
                        <strong>{stats.total}</strong>
                    </div>

                    <div className="scanner-summary-card">
                        <span>ACTIVE</span>
                        <strong>{stats.active}</strong>
                    </div>

                    <div className="scanner-summary-card">
                        <span>HIT ENTRY</span>
                        <strong>{stats.hitEntry}</strong>
                    </div>

                    <div className="scanner-summary-card">
                        <span>TAKE PROFIT</span>
                        <strong>{stats.hitTP}</strong>
                    </div>

                    <div className="scanner-summary-card">
                        <span>STOP LOSS</span>
                        <strong>{stats.hitSL}</strong>
                    </div>

                    <div className="scanner-summary-card">
                        <span>CLOSED</span>
                        <strong>{stats.closed}</strong>
                    </div>

                    <div className="scanner-summary-card">
                        <span>WIN RATE</span>
                        <strong>
                            {winRate === "—"
                                ? "—"
                                : `${winRate}%`}
                        </strong>
                    </div>

                    <div className="scanner-summary-card">
                        <span>REALIZED P/L</span>
                        <strong
                            className={
                                realizedPnL > 0
                                    ? "positive"
                                    : realizedPnL < 0
                                        ? "negative"
                                        : ""
                            }
                        >
                            {realizedPnL >= 0 ? "+" : ""}
                            ${realizedPnL.toFixed(2)}
                        </strong>
                    </div>

                </div>
            )}

            {!loading && !error && setups.length === 0 && (

                <div className="scanner-empty">
                    No hay trading setups registrados todavía.
                </div>

            )}

            {!loading && !error && setups.length > 0 && (

                <div className="scanner-table-wrapper">

                    <table className="scanner-table">

                        <thead>

                            <tr>

                                <th>Symbol</th>
                                <th>Direction</th>
                                <th>Quantity</th>
                                <th>Entry</th>
                                <th>Stop Loss</th>
                                <th>Take Profit</th>
                                <th>P/L TP</th>
                                <th>P/L SL</th>
                                <th>Exit</th>
                                <th>Realized P/L</th>
                                <th>R/R</th>
                                <th>ATR</th>
                                <th>Score</th>
                                <th>Opportunity</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {setups.map((setup) => {

                                const entry = Number(setup.entry || 0);
                                const stopLoss = Number(setup.stop_loss || 0);
                                const takeProfit = Number(setup.take_profit || 0);
                                const quantity = Number(setup.quantity || 1);

                                const profitPerUnit =
                                    setup.direction === "LONG"
                                        ? takeProfit - entry
                                        : entry - takeProfit;

                                const lossPerUnit =
                                    setup.direction === "LONG"
                                        ? entry - stopLoss
                                        : stopLoss - entry;

                                const profit = profitPerUnit * quantity;
                                const loss = lossPerUnit * quantity;

                                const realized =
                                    setup.realized_pnl !== null &&
                                    setup.realized_pnl !== undefined
                                        ? Number(setup.realized_pnl)
                                        : null;

                                return (

                                    <tr key={setup.id}>

                                        <td>
                                            <strong>
                                                {setup.symbol}
                                            </strong>
                                        </td>

                                        <td>
                                            {setup.direction === "LONG"
                                                ? "🟢 LONG"
                                                : "🔴 SHORT"}
                                        </td>

                                        <td>
                                            <strong>
                                                {quantity}
                                            </strong>
                                        </td>

                                        <td>
                                            ${entry.toFixed(2)}
                                        </td>

                                        <td>
                                            ${stopLoss.toFixed(2)}
                                        </td>

                                        <td>
                                            ${takeProfit.toFixed(2)}
                                        </td>

                                        <td>
                                            <strong className="positive">
                                                +${profit.toFixed(2)}
                                            </strong>
                                        </td>

                                        <td>
                                            <strong className="negative">
                                                -${loss.toFixed(2)}
                                            </strong>
                                        </td>

                                        <td>
                                            {setup.exit_price !== null &&
                                            setup.exit_price !== undefined
                                                ? `$${Number(
                                                    setup.exit_price
                                                ).toFixed(2)}`
                                                : "-"}
                                        </td>

                                        <td>

                                            {realized !== null
                                                ? (
                                                    <strong
                                                        className={
                                                            realized > 0
                                                                ? "positive"
                                                                : realized < 0
                                                                    ? "negative"
                                                                    : ""
                                                        }
                                                    >
                                                        {realized >= 0 ? "+" : ""}
                                                        ${realized.toFixed(2)}
                                                    </strong>
                                                )
                                                : "-"}

                                        </td>

                                        <td>
                                            {setup.risk_reward !== null &&
                                            setup.risk_reward !== undefined
                                                ? `1 : ${Number(
                                                    setup.risk_reward
                                                ).toFixed(2)}`
                                                : "-"}
                                        </td>

                                        <td>
                                            <strong>
                                                {setup.atr !== null &&
                                                setup.atr !== undefined
                                                    ? Number(
                                                        setup.atr
                                                    ).toFixed(4)
                                                    : "-"}
                                            </strong>
                                        </td>

                                        <td>
                                            <strong>
                                                {setup.opportunity_score !== null &&
                                                setup.opportunity_score !== undefined
                                                    ? Number(
                                                        setup.opportunity_score
                                                    ).toFixed(0)
                                                    : "-"}
                                            </strong>
                                        </td>

                                        <td>
                                            <strong>
                                                {setup.opportunity_label || "-"}
                                            </strong>
                                        </td>

                                        <td>

                                            <span
                                                className={`setup-status ${String(
                                                    setup.status || ""
                                                ).toLowerCase()}`}
                                            >
                                                {setup.status}
                                            </span>

                                        </td>

                                        <td>
                                            {setup.created_at
                                                ? new Date(
                                                    setup.created_at
                                                ).toLocaleString()
                                                : "-"}
                                        </td>

                                        <td>

                                            {setup.status === "ACTIVE" && (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCloseSetup(
                                                            setup.id
                                                        )
                                                    }
                                                >
                                                    Cerrar
                                                </button>

                                            )}

                                            {setup.status === "HIT_ENTRY" && (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCloseSetup(
                                                            setup.id
                                                        )
                                                    }
                                                >
                                                    Cerrar
                                                </button>

                                            )}

                                            {setup.status !== "ACTIVE" &&
                                            setup.status !== "HIT_ENTRY" && (
                                                "-"
                                            )}

                                        </td>

                                    </tr>

                                );

                            })}

                        </tbody>

                    </table>

                </div>

            )}

        </main>

    );
    
}
