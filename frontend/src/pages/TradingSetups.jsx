import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    getTradingSetups,
    getTradingSetupHistory,
    closeTradingSetup,
    getTradingSetupEvents,
} from "../services/api";


export default function TradingSetups() {

    const [setups, setSetups] = useState([]);
    const [history, setHistory] = useState([]);
    const [events, setEvents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [closingId, setClosingId] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);


    // ============================================================
    // LOAD DATA
    // ============================================================

    const loadData = useCallback(
        async () => {

            try {

                const [
                    setupsData,
                    historyData,
                    eventsData,
                ] = await Promise.all([
                    getTradingSetups(),
                    getTradingSetupHistory(),
                    getTradingSetupEvents(),
                ]);

                setSetups(
                    Array.isArray(setupsData)
                        ? setupsData
                        : []
                );

                setHistory(
                    Array.isArray(historyData)
                        ? historyData
                        : []
                );

                setEvents(
                    Array.isArray(eventsData)
                        ? eventsData
                        : []
                );

                setError("");

            } catch (err) {

                console.error(
                    "[TRADING SETUPS] Load error:",
                    err
                );

                setError(
                    err?.message ||
                    "Error cargando trading setups."
                );

            } finally {

                setLoading(false);

            }

        },
        []
    );


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadData();

    }, [loadData]);


    // ============================================================
    // WEBSOCKET
    // ============================================================

    useEffect(() => {

        let websocket = null;
        let reconnectTimer = null;
        let mounted = true;


        function connectWebSocket() {

            if (!mounted) {
                return;
            }


            const protocol =
                window.location.protocol === "https:"
                    ? "wss:"
                    : "ws:";


            const host =
                window.location.hostname ||
                "localhost";


            websocket = new WebSocket(
                `${protocol}//${host}:8010/ws/trading-setups`
            );


            websocket.onopen = () => {

                console.log(
                    "[WS SETUPS] Conectado"
                );

                if (mounted) {
                    setWsConnected(true);
                }

            };


            websocket.onmessage = (
                message
            ) => {

                try {

                    const data =
                        JSON.parse(
                            message.data
                        );


                    if (
                        data.type !==
                        "TRADING_SETUP_UPDATE"
                    ) {
                        return;
                    }


                    if (
                        Array.isArray(
                            data.setups
                        )
                    ) {

                        setSetups(
                            data.setups
                        );

                    }


                    if (
                        Array.isArray(
                            data.events
                        ) &&
                        data.events.length > 0
                    ) {

                        setEvents(
                            (previous) => {

                                const map =
                                    new Map();


                                previous.forEach(
                                    (event) => {

                                        map.set(
                                            event.id,
                                            event
                                        );

                                    }
                                );


                                data.events.forEach(
                                    (event) => {

                                        map.set(
                                            event.id,
                                            event
                                        );

                                    }
                                );


                                return Array.from(
                                    map.values()
                                )
                                    .sort(
                                        (
                                            a,
                                            b
                                        ) =>
                                            new Date(
                                                b.created_at
                                            ) -
                                            new Date(
                                                a.created_at
                                            )
                                    );

                            }
                        );


                        console.log(
                            "[WS SETUPS] Nuevos eventos:",
                            data.events
                        );

                        loadData();

                    }

                } catch (err) {

                    console.error(
                        "[WS SETUPS] Message error:",
                        err
                    );

                }

            };


            websocket.onerror = (
                wsError
            ) => {

                console.error(
                    "[WS SETUPS] Error:",
                    wsError
                );

            };


            websocket.onclose = () => {

                console.log(
                    "[WS SETUPS] Desconectado"
                );

                if (mounted) {
                    setWsConnected(false);
                }


                reconnectTimer =
                    setTimeout(
                        connectWebSocket,
                        5000
                    );

            };

        }


        connectWebSocket();


        return () => {

            mounted = false;

            if (reconnectTimer) {
                clearTimeout(
                    reconnectTimer
                );
            }


            if (websocket) {
                websocket.close();
            }

        };

    }, [loadData]);


    // ============================================================
    // CLOSE SETUP
    // ============================================================

    async function handleCloseSetup(
        setupId
    ) {

        if (!setupId) {
            return;
        }

        setClosingId(setupId);

        try {

            await closeTradingSetup(
                setupId
            );

            await loadData();

        } catch (err) {

            console.error(
                "[TRADING SETUPS] Close error:",
                err
            );

            setError(
                err?.message ||
                "No se pudo cerrar el setup."
            );

        } finally {

            setClosingId(null);

        }

    }


    // ============================================================
    // SUMMARY
    // ============================================================

    const total =
        setups.length;


    const active =
        setups.filter(
            (setup) =>
                setup.status === "ACTIVE"
        ).length;


    const hitEntry =
        setups.filter(
            (setup) =>
                setup.status === "HIT_ENTRY"
        ).length;


    const hitTp =
        setups.filter(
            (setup) =>
                setup.status === "HIT_TP"
        ).length;


    const hitSl =
        setups.filter(
            (setup) =>
                setup.status === "HIT_SL"
        ).length;


    const closed =
        setups.filter(
            (setup) =>
                setup.status === "CLOSED"
        ).length;


    // ============================================================
    // HELPERS
    // ============================================================

    function formatPrice(
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        const number =
            Number(value);

        if (!Number.isFinite(number)) {
            return "—";
        }

        return `$${number.toFixed(2)}`;

    }


    function formatPnl(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {
            return "—";
        }

        const number =
            Number(value);

        if (!Number.isFinite(number)) {
            return "—";
        }

        return (
            <>
                {number >= 0 ? "+" : ""}
                ${number.toFixed(2)}
            </>
        );

    }


    function pnlClass(
        value
    ) {

        const number =
            Number(value || 0);

        return number >= 0
            ? "equity-positive"
            : "equity-negative";

    }


    function statusClass(
        status
    ) {

        switch (status) {

            case "ACTIVE":
                return "status-badge";

            case "HIT_ENTRY":
                return "status-badge hit-entry";

            case "HIT_TP":
                return "status-badge hit-tp";

            case "HIT_SL":
                return "status-badge hit-sl";

            case "CLOSED":
                return "status-badge";

            default:
                return "status-badge";

        }

    }


    function eventClass(
        eventType
    ) {

        switch (eventType) {

            case "ENTRY":
                return "status-badge hit-entry";

            case "TAKE_PROFIT":
                return "status-badge hit-tp";

            case "STOP_LOSS":
                return "status-badge hit-sl";

            default:
                return "status-badge";

        }

    }


    function formatDate(
        value
    ) {

        if (!value) {
            return "—";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }

        return date.toLocaleString();

    }


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <main className="scanner-page">

                <div className="scanner-header">

                    <div>

                        <h1>
                            TRADING SETUPS
                        </h1>

                        <p>
                            Gestión y seguimiento automático
                            de setups de trading
                        </p>

                    </div>

                </div>


                <div className="scanner-empty">

                    Cargando trading setups...

                </div>

            </main>

        );

    }


    // ============================================================
    // ERROR
    // ============================================================

    if (error) {

        return (

            <main className="scanner-page">

                <div className="scanner-header">

                    <div>

                        <h1>
                            TRADING SETUPS
                        </h1>

                        <p className="error-message">
                            {error}
                        </p>

                    </div>


                    <button
                        className="scanner-refresh"
                        onClick={loadData}
                    >
                        ↻ Reintentar
                    </button>

                </div>

            </main>

        );

    }


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <main className="scanner-page">


            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="scanner-header">

                <div>

                    <h1>
                        TRADING SETUPS
                    </h1>

                    <p>
                        Gestión y seguimiento automático
                        de setups de trading
                    </p>

                </div>


                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >

                    <span
                        className={
                            wsConnected
                                ? "status-badge hit-entry"
                                : "status-badge"
                        }
                    >
                        {wsConnected
                            ? "● LIVE"
                            : "○ OFFLINE"}
                    </span>


                    <button
                        className="scanner-refresh"
                        onClick={loadData}
                    >
                        ↻ Actualizar
                    </button>

                </div>

            </div>


            {/* ====================================================
                SUMMARY
            ==================================================== */}

            <div className="scanner-summary">

                <div className="scanner-summary-card">
                    <span>TOTAL</span>
                    <strong>{total}</strong>
                </div>

                <div className="scanner-summary-card">
                    <span>ACTIVE</span>
                    <strong>{active}</strong>
                </div>

                <div className="scanner-summary-card">
                    <span>HIT ENTRY</span>
                    <strong>{hitEntry}</strong>
                </div>

                <div className="scanner-summary-card">
                    <span>TAKE PROFIT</span>
                    <strong>{hitTp}</strong>
                </div>

                <div className="scanner-summary-card">
                    <span>STOP LOSS</span>
                    <strong>{hitSl}</strong>
                </div>

                <div className="scanner-summary-card">
                    <span>CLOSED</span>
                    <strong>{closed}</strong>
                </div>

            </div>


            {/* ====================================================
                CURRENT SETUPS
            ==================================================== */}

            <section className="scanner-section">

                <div className="scanner-section-header">

                    <h2>
                        CURRENT SETUPS
                    </h2>

                </div>


                {setups.length === 0 ? (

                    <div className="scanner-empty">

                        No hay trading setups registrados.

                    </div>

                ) : (

                    <div className="scanner-table-wrapper">

                        <table className="scanner-table">

                            <thead>

                                <tr>

                                    <th>ID</th>
                                    <th>SYMBOL</th>
                                    <th>DIRECTION</th>
                                    <th>ENTRY</th>
                                    <th>STOP LOSS</th>
                                    <th>TAKE PROFIT</th>
                                    <th>QUANTITY</th>
                                    <th>R/R</th>
                                    <th>STATUS</th>
                                    <th>P/L</th>
                                    <th>ACTION</th>

                                </tr>

                            </thead>


                            <tbody>

                                {setups.map(
                                    (setup) => {

                                        const pnl =
                                            Number(
                                                setup.realized_pnl || 0
                                            );


                                        return (

                                            <tr
                                                key={setup.id}
                                            >

                                                <td>
                                                    #{setup.id}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {setup.symbol}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {setup.direction}
                                                </td>

                                                <td>
                                                    {formatPrice(
                                                        setup.entry
                                                    )}
                                                </td>

                                                <td>
                                                    {formatPrice(
                                                        setup.stop_loss
                                                    )}
                                                </td>

                                                <td>
                                                    {formatPrice(
                                                        setup.take_profit
                                                    )}
                                                </td>

                                                <td>
                                                    {setup.quantity}
                                                </td>

                                                <td>
                                                    {setup.risk_reward !==
                                                        null &&
                                                    setup.risk_reward !==
                                                        undefined
                                                        ? `1:${Number(
                                                              setup.risk_reward
                                                          ).toFixed(2)}`
                                                        : "—"}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            statusClass(
                                                                setup.status
                                                            )
                                                        }
                                                    >
                                                        {setup.status}
                                                    </span>

                                                </td>

                                                <td>

                                                    {setup.realized_pnl ===
                                                        null ||
                                                    setup.realized_pnl ===
                                                        undefined
                                                        ? "—"
                                                        : (
                                                            <strong
                                                                className={
                                                                    pnlClass(
                                                                        pnl
                                                                    )
                                                                }
                                                            >
                                                                {formatPnl(
                                                                    pnl
                                                                )}
                                                            </strong>
                                                        )}

                                                </td>

                                                <td>

                                                    {(
                                                        setup.status ===
                                                            "ACTIVE" ||
                                                        setup.status ===
                                                            "HIT_ENTRY"
                                                    ) ? (

                                                        <button
                                                            className="scanner-refresh"
                                                            disabled={
                                                                closingId ===
                                                                setup.id
                                                            }
                                                            onClick={() =>
                                                                handleCloseSetup(
                                                                    setup.id
                                                                )
                                                            }
                                                        >
                                                            {closingId ===
                                                            setup.id
                                                                ? "Cerrando..."
                                                                : "Cerrar"}
                                                        </button>

                                                    ) : (

                                                        "—"

                                                    )}

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


            {/* ====================================================
                SETUP EVENTS
            ==================================================== */}

            <section className="scanner-section">

                <div className="scanner-section-header">

                    <h2>
                        SETUP EVENTS
                    </h2>

                </div>


                <div
                    style={{
                        marginBottom: "20px",
                        opacity: 0.7,
                    }}
                >
                    Eventos generados automáticamente por el monitor.
                </div>


                {events.length === 0 ? (

                    <div className="scanner-empty">
                        No hay eventos de trading registrados.
                    </div>

                ) : (

                    <div className="scanner-table-wrapper">

                        <table className="scanner-table">

                            <thead>

                                <tr>

                                    <th>ID</th>
                                    <th>SETUP</th>
                                    <th>SYMBOL</th>
                                    <th>EVENT</th>
                                    <th>DIRECTION</th>
                                    <th>PRICE</th>
                                    <th>QUANTITY</th>
                                    <th>P/L</th>
                                    <th>DATE</th>

                                </tr>

                            </thead>


                            <tbody>

                                {events.map(
                                    (event) => {

                                        const pnl =
                                            Number(
                                                event.realized_pnl || 0
                                            );


                                        return (

                                            <tr
                                                key={event.id}
                                            >

                                                <td>
                                                    #{event.id}
                                                </td>

                                                <td>
                                                    #{event.setup_id}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {event.symbol}
                                                    </strong>
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            eventClass(
                                                                event.event_type
                                                            )
                                                        }
                                                    >
                                                        {event.event_type}
                                                    </span>

                                                </td>

                                                <td>
                                                    {event.direction}
                                                </td>

                                                <td>
                                                    {formatPrice(
                                                        event.price
                                                    )}
                                                </td>

                                                <td>
                                                    {event.quantity}
                                                </td>

                                                <td>

                                                    {event.realized_pnl ===
                                                        null ||
                                                    event.realized_pnl ===
                                                        undefined
                                                        ? "—"
                                                        : (
                                                            <strong
                                                                className={
                                                                    pnlClass(
                                                                        pnl
                                                                    )
                                                                }
                                                            >
                                                                {formatPnl(
                                                                    pnl
                                                                )}
                                                            </strong>
                                                        )}

                                                </td>

                                                <td>
                                                    {formatDate(
                                                        event.created_at
                                                    )}
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


            {/* ====================================================
                HISTORY
            ==================================================== */}

            <section className="scanner-section">

                <div className="scanner-section-header">

                    <h2>
                        SETUP HISTORY
                    </h2>

                </div>


                {history.length === 0 ? (

                    <div className="scanner-empty">

                        No hay histórico de trading setups.

                    </div>

                ) : (

                    <div className="scanner-table-wrapper">

                        <table className="scanner-table">

                            <thead>

                                <tr>

                                    <th>ID</th>
                                    <th>SYMBOL</th>
                                    <th>DIRECTION</th>
                                    <th>ENTRY</th>
                                    <th>EXIT</th>
                                    <th>QUANTITY</th>
                                    <th>STATUS</th>
                                    <th>REALIZED P/L</th>
                                    <th>CLOSED</th>

                                </tr>

                            </thead>


                            <tbody>

                                {history.map(
                                    (setup) => {

                                        const pnl =
                                            Number(
                                                setup.realized_pnl || 0
                                            );


                                        return (

                                            <tr
                                                key={setup.id}
                                            >

                                                <td>
                                                    #{setup.id}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {setup.symbol}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {setup.direction}
                                                </td>

                                                <td>
                                                    {formatPrice(
                                                        setup.entry
                                                    )}
                                                </td>

                                                <td>
                                                    {formatPrice(
                                                        setup.exit_price
                                                    )}
                                                </td>

                                                <td>
                                                    {setup.quantity}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            statusClass(
                                                                setup.status
                                                            )
                                                        }
                                                    >
                                                        {setup.status}
                                                    </span>

                                                </td>

                                                <td>

                                                    {setup.realized_pnl ===
                                                        null ||
                                                    setup.realized_pnl ===
                                                        undefined
                                                        ? "—"
                                                        : (
                                                            <strong
                                                                className={
                                                                    pnlClass(
                                                                        pnl
                                                                    )
                                                                }
                                                            >
                                                                {formatPnl(
                                                                    pnl
                                                                )}
                                                            </strong>
                                                        )}

                                                </td>

                                                <td>
                                                    {formatDate(
                                                        setup.closed_at
                                                    )}
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