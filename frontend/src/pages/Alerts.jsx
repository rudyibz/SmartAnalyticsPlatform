import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getAlerts,
    getAlertEvents,
    evaluateAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
} from "../api/api";

import {
    useMarketContext,
} from "../context/MarketContext";


export default function Alerts() {

    const {
    symbol,
    marketData,
    wsConnected,
} = useMarketContext();


    // =========================================================
    // STATE
    // =========================================================

    const [
        alerts,
        setAlerts,
    ] = useState([]);


    const [
        evaluations,
        setEvaluations,
    ] = useState({});


    const [
        events,
        setEvents,
    ] = useState([]);


    const [
        form,
        setForm,
    ] = useState({

        symbol:
            symbol ||
            "AAPL",

        indicator:
            "price",

        operator:
            ">=",

        target_value:
            "",

    });


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        evaluating,
        setEvaluating,
    ] = useState(false);


    const [
        saving,
        setSaving,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
    message,
    setMessage,
] = useState("");

// =========================================================
// REAL-TIME ALERT STATE
// =========================================================

const triggeredAlertsRef =
    useRef({});

const notificationTimerRef =
    useRef(null);

const [
    alertNotification,
    setAlertNotification,
] = useState(null);

// =========================================================
// ALERT SOUND
// =========================================================

function playAlertSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        const audioContext =
            new AudioContext();
            if (audioContext.state === "suspended") {
    audioContext.resume();
}

        const oscillator =
            audioContext.createOscillator();

        const gainNode =
            audioContext.createGain();

        oscillator.type =
            "sine";

        oscillator.frequency.setValueAtTime(
            880,
            audioContext.currentTime
        );

        gainNode.gain.setValueAtTime(
            0.0001,
            audioContext.currentTime
        );

        gainNode.gain.exponentialRampToValueAtTime(
            0.25,
            audioContext.currentTime + 0.02
        );

        gainNode.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + 0.5
        );

        oscillator.connect(
            gainNode
        );

        gainNode.connect(
            audioContext.destination
        );

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.5
        );

    } catch (err) {

        console.warn(
            "[ALERTS] SOUND ERROR:",
            err
        );

    }
}

// =========================================================
// BROWSER NOTIFICATION
// =========================================================

async function showBrowserNotification({
    symbol,
    indicator,
    operator,
    target,
    currentValue,
}) {

    try {

        // Navegador sin soporte
        if (
            typeof window === "undefined" ||
            !("Notification" in window)
        ) {
            return;
        }

        // Solicitar permiso
        if (
            Notification.permission === "default"
        ) {

            const permission =
                await Notification.requestPermission();

            if (
                permission !== "granted"
            ) {
                return;
            }

        }

        // Permiso no concedido
        if (
            Notification.permission !== "granted"
        ) {
            return;
        }

        const formattedCurrent =
            Number(currentValue).toLocaleString(
                "es-ES",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                }
            );

        const formattedTarget =
            Number(target).toLocaleString(
                "es-ES",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                }
            );

        new Notification(
            `🚨 Alerta ${symbol}`,
            {
                body:
                    `${indicator} ${operator} ${formattedTarget}\n` +
                    `Valor actual: ${formattedCurrent}`,
                tag:
                    `smartanalytics-alert-${symbol}-${indicator}`,
            }
        );

    } catch (err) {

        console.warn(
            "[ALERTS] BROWSER NOTIFICATION ERROR:",
            err
        );

    }

}
// =========================================================
// FORMAT CURRENT VALUE
// =========================================================

function formatCurrentValue(
    evaluation
) {

        if (
            !evaluation ||
            evaluation.current_value === null ||
            evaluation.current_value === undefined
        ) {

            return null;

        }


        const value =
            Number(
                evaluation.current_value
            );


        if (
            !Number.isFinite(value)
        ) {

            return null;

        }


        return value.toLocaleString(
    "es-ES",
    {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    }
);

    }

// =========================================================
// FORMAT MARKET VALUE
// =========================================================

function formatMarketValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return null;

    }

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {

        return null;

    }

    return number.toLocaleString(
        "es-ES",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
        }
    );
}

    // =========================================================
    // LOAD ALERTS
    // =========================================================

    async function loadAlerts() {

        setLoading(true);
        setError("");

        try {

            const data =
                await getAlerts();

            setAlerts(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "[ALERTS] Load error:",
                err
            );

            setError(
                err?.message ||
                "No se pudieron cargar las alertas."
            );

        } finally {

            setLoading(false);

        }
    }


    // =========================================================
    // LOAD EVENTS
    // =========================================================

    async function loadEvents() {

        try {

            const data =
                await getAlertEvents();

            setEvents(
                Array.isArray(data)
                    ? data
                    : data
                        ? [data]
                        : []
            );

        } catch (err) {

            console.error(
                "[ALERTS] Events error:",
                err
            );

            setEvents([]);

        }
    }


    // =========================================================
    // EVALUATE ALERTS
    // =========================================================

    async function evaluateCurrentAlerts() {

        setEvaluating(true);
        setError("");

        try {

            const data =
                await evaluateAlerts();


            const results =
                Array.isArray(data)
                    ? data
                    : data
                        ? [data]
                        : [];


            const mapped = {};


            results.forEach(
                (result) => {

                    if (
                        result &&
                        result.alert_id !== undefined
                    ) {

                        mapped[
                            result.alert_id
                        ] = result;

                    }

                }
            );


            setEvaluations(
                mapped
            );


            await loadEvents();


            return results;

        } catch (err) {

            console.error(
                "[ALERTS] Evaluation error:",
                err
            );

            setError(
                err?.message ||
                "No se pudieron evaluar las alertas."
            );

            return [];

        } finally {

            setEvaluating(false);

        }
    }


    // =========================================================
    // REFRESH
    // =========================================================

    async function handleRefresh() {

        setMessage("");
        setError("");

        try {

            await loadAlerts();

            await evaluateCurrentAlerts();

            await loadEvents();

        } catch (err) {

            console.error(
                "[ALERTS] Refresh error:",
                err
            );

        }

    }


    // =========================================================
    // UPDATE SYMBOL FROM MARKET CONTEXT
    // =========================================================

    useEffect(() => {

        setForm(
            (current) => ({

                ...current,

                symbol:
                    symbol ||
                    current.symbol ||
                    "AAPL",

            })
        );

    }, [symbol]);

// =========================================================
// =========================================================
// REAL-TIME MARKET VALUE
// =========================================================

useEffect(() => {

    if (!marketData) {
        return;
    }

    const currentPrice = marketData.price;

    if (
        currentPrice === null ||
        currentPrice === undefined
    ) {
        console.warn(
            "[ALERTS] MARKET DATA INVALID:",
            marketData
        );

        return;
    }

    const price = Number(currentPrice);

    if (
        !Number.isFinite(price) ||
        price <= 0
    ) {
        console.warn(
            "[ALERTS] INVALID MARKET PRICE:",
            {
                marketData,
                price,
            }
        );

        return;
    }

    const currentSymbol =
        String(symbol || "")
            .trim()
            .toUpperCase();

    const supportedIndicators = [
        "PRICE",
        "RSI",
        "MACD",
        "EMA",
    ];

    const nextEvaluations = {};
    
    alerts.forEach((alert) => {

        const alertSymbol =
            String(alert.symbol || "")
                .trim()
                .toUpperCase();

        const indicator =
            String(alert.indicator || "")
                .trim()
                .toUpperCase();

        const operator =
            String(alert.operator || "")
                .trim();

        const target =
            Number(alert.target_value);

        console.log(
            "[ALERTS] CHECK:",
            {
                id: alert.id,
                alertSymbol,
                currentSymbol,
                indicator,
                operator,
                target,
                price,
                active: alert.active,
            }
        );

        // ---------------------------------------------
        // ALERTA INACTIVA
        // ---------------------------------------------

        if (!alert.active) {

            triggeredAlertsRef.current[
                alert.id
            ] = false;

            return;
        }

        // ---------------------------------------------
        // INDICADOR NO SOPORTADO
        // ---------------------------------------------

        if (
            !supportedIndicators.includes(
                indicator
            )
        ) {

            console.log(
                "[ALERTS] SKIP INDICATOR:",
                {
                    id: alert.id,
                    indicator,
                }
            );

            return;
        }

        // ---------------------------------------------
        // SOLO MISMO SYMBOL
        // ---------------------------------------------

        if (
            alertSymbol !== currentSymbol
        ) {

            console.log(
                "[ALERTS] SKIP SYMBOL:",
                {
                    id: alert.id,
                    alertSymbol,
                    currentSymbol,
                }
            );

            return;
        }

        // ---------------------------------------------
        // TARGET
        // ---------------------------------------------

        if (
            !Number.isFinite(target)
        ) {

            console.log(
                "[ALERTS] SKIP TARGET:",
                {
                    id: alert.id,
                    target,
                }
            );

            return;
        }

        // ---------------------------------------------
        // VALOR ACTUAL
        // ---------------------------------------------

        let currentValue = price;

        if (
            indicator === "RSI"
        ) {
            currentValue =
                Number(
                    marketData?.rsi14
                );
        }

        if (
            indicator === "MACD"
        ) {
            currentValue =
                Number(
                    marketData?.macd
                );
        }

        if (
            indicator === "EMA"
        ) {
            currentValue =
                Number(
                    marketData?.ema20
                );
        }

        if (
            !Number.isFinite(
                currentValue
            )
        ) {

            console.log(
                "[ALERTS] SKIP CURRENT VALUE:",
                {
                    id: alert.id,
                    indicator,
                    currentValue,
                }
            );

            return;
        }

        // ---------------------------------------------
        // COMPARACIÓN
        // ---------------------------------------------

        let triggered = false;

        switch (operator) {

            case ">=":
                triggered =
                    currentValue >= target;
                break;

            case ">":
                triggered =
                    currentValue > target;
                break;

            case "<=":
                triggered =
                    currentValue <= target;
                break;

            case "<":
                triggered =
                    currentValue < target;
                break;

            case "==":
                triggered =
                    currentValue === target;
                break;

            default:

                console.log(
                    "[ALERTS] UNKNOWN OPERATOR:",
                    operator
                );

                triggered = false;
        }

        // ---------------------------------------------
        // ESTADO ANTERIOR
        // ---------------------------------------------

        const previouslyTriggered =
            Boolean(
                triggeredAlertsRef.current[
                    alert.id
                ]
            );

        const newlyTriggered =
            triggered &&
            !previouslyTriggered;

        // ---------------------------------------------
        // ACTUALIZAR ESTADO FRONTEND
        // ---------------------------------------------

        triggeredAlertsRef.current[
            alert.id
        ] = triggered;

        // ---------------------------------------------
        // GUARDAR EVALUACIÓN
        // ---------------------------------------------

        const previous =
            evaluations?.[alert.id] || {};

        nextEvaluations[
            alert.id
        ] = {

            ...previous,

            alert_id:
                alert.id,

            symbol:
                alertSymbol,

            indicator,

            operator,

            target_value:
                target,

            current_value:
                currentValue,

            triggered,

            supported:
                true,

            active:
                Boolean(
                    alert.active
                ),

            event_created:
                previous.event_created ||
                false,

            event_id:
                previous.event_id ||
                null,
        };

        // ---------------------------------------------
        // NUEVA ALERTA
        // ---------------------------------------------

                if (newlyTriggered) {

            console.log(
                "🚨 [ALERTS] ALERTA DISPARADA:",
                {
                    id: alert.id,
                    symbol: alertSymbol,
                    indicator,
                    currentValue,
                    operator,
                    target,
                }
            );

            // =============================================
            // NOTIFICACIÓN DEL NAVEGADOR
            // =============================================

            showBrowserNotification({
                symbol: alertSymbol,
                indicator,
                operator,
                target,
                currentValue,
            });

            // =============================================
            // REGISTRAR ALERTA PARA BACKEND
            // =============================================

            
        }

        // ---------------------------------------------
        // ALERTA REARMADA
        // ---------------------------------------------

        if (
            !triggered &&
            previouslyTriggered
        ) {

            console.log(
                "🔄 [ALERTS] ALERTA REARMADA:",
                {
                    id: alert.id,
                    symbol: alertSymbol,
                    indicator,
                    currentValue,
                    operator,
                    target,
                }
            );
        }
    });

// ---------------------------------------------
// ACTUALIZAR EVALUACIONES
// ---------------------------------------------

setEvaluations(
    (current) => ({
        ...current,
        ...nextEvaluations,
    })
);

}, [
    marketData,
    alerts,
    symbol,
]);
    // =========================================================
    // INITIAL LOAD
    // =========================================================

    // =========================================================
// BACKEND ALERT EVENTS FROM WEBSOCKET
// =========================================================

useEffect(() => {

    if (!marketData) {
        return;
    }

    const backendEvents =
        Array.isArray(
            marketData.alert_events
        )
            ? marketData.alert_events
            : [];

    if (
        backendEvents.length === 0
    ) {
        return;
    }

    console.log(
        "🚨 [ALERTS] EVENTOS RECIBIDOS DEL BACKEND:",
        backendEvents
    );

    backendEvents.forEach(
        (event) => {

            if (!event) {
                return;
            }

            const alertId =
                event.alert_id;

            if (
                alertId === null ||
                alertId === undefined
            ) {
                return;
            }

            const symbol =
                String(
                    event.symbol || ""
                )
                    .trim()
                    .toUpperCase();

            const indicator =
                String(
                    event.indicator || ""
                )
                    .trim()
                    .toUpperCase();

            const operator =
                String(
                    event.operator || ""
                )
                    .trim();

            const target =
                Number(
                    event.target_value
                );

            const currentValue =
                Number(
                    event.current_value
                );

            console.log(
                "🚨 [ALERTS] EVENTO BACKEND:",
                {
                    alertId,
                    symbol,
                    indicator,
                    operator,
                    target,
                    currentValue,
                    eventId:
                        event.event_id,
                }
            );

            // =============================================
            // EVITAR PROCESAR EL MISMO EVENTO DOS VECES
            // =============================================

            const eventKey =
                event.event_id ||
                `${alertId}-${event.triggered_at || currentValue}`;

            const processedEvents =
                triggeredAlertsRef.current;

            if (
                processedEvents[
                    `event-${eventKey}`
                ]
            ) {
                return;
            }

            processedEvents[
                `event-${eventKey}`
            ] = true;

            // =============================================
            // ACTUALIZAR EVALUACIÓN
            // =============================================

            setEvaluations(
                (current) => ({
                    ...current,

                    [alertId]: {
                        ...(current[
                            alertId
                        ] || {}),

                        alert_id:
                            alertId,

                        symbol,

                        indicator,

                        operator,

                        target_value:
                            target,

                        current_value:
                            currentValue,

                        triggered:
                            true,

                        supported:
                            true,

                        active:
                            true,

                        event_created:
                            true,

                        event_id:
                            event.event_id ||
                            null,
                    },
                })
            );

            // =============================================
            // HISTORIAL
            // =============================================

            loadEvents();

            // =============================================
            // SONIDO
            // =============================================

            playAlertSound();

            // =============================================
            // NOTIFICACIÓN VISUAL
            // =============================================

            setAlertNotification({
                id:
                    alertId,

                symbol,

                operator,

                target,

                price:
                    currentValue,
            });

            // =============================================
            // MENSAJE
            // =============================================

            setMessage(
                `🚨 Alerta ${symbol} ${indicator} ${operator} ${target} disparada.`
            );

            // =============================================
            // AUTOCIERRE
            // =============================================

            if (
                notificationTimerRef.current
            ) {

                clearTimeout(
                    notificationTimerRef.current
                );
            }

            notificationTimerRef.current =
                setTimeout(
                    () => {

                        setAlertNotification(
                            null
                        );

                    },
                    6000
                );

        }
    );

}, [
    marketData,
]);
// =========================================================
// INITIAL LOAD
// =========================================================

useEffect(() => {

    async function initialize() {

        setLoading(true);
        setError("");

        try {

            await loadAlerts();

            await evaluateCurrentAlerts();

            await loadEvents();

        } catch (err) {

            console.error(
                "[ALERTS] Initial load error:",
                err
            );

        } finally {

            setLoading(false);

        }

    }

    initialize();

}, []);


    // =========================================================
    // FORM CHANGE
    // =========================================================

    function handleChange(
        event
    ) {

        const {
            name,
            value,
        } = event.target;


        setForm(
            (current) => ({

                ...current,

                [name]:
                    value,

            })
        );

    }


    // =========================================================
    // CREATE ALERT
    // =========================================================

    async function handleCreate(
        event
    ) {

        event.preventDefault();

        setError("");
        setMessage("");


        const normalizedSymbol =
            String(
                form.symbol || ""
            )
                .trim()
                .toUpperCase();


        const target =
            Number(
                form.target_value
            );


        if (
            !normalizedSymbol
        ) {

            setError(
                "Introduce un símbolo."
            );

            return;

        }


        if (
            !Number.isFinite(target)
        ) {

            setError(
                "Introduce un valor objetivo válido."
            );

            return;

        }


        setSaving(true);


        try {

            await createAlert({

                symbol:
                    normalizedSymbol,

                indicator:
                    form.indicator,

                operator:
                    form.operator,

                target_value:
                    target,

            });


            setMessage(
                "Alerta creada correctamente."
            );


            setForm(
                (current) => ({

                    ...current,

                    symbol:
                        normalizedSymbol,

                    target_value:
                        "",

                })
            );


            await loadAlerts();

            await evaluateCurrentAlerts();

            await loadEvents();

        } catch (err) {

            console.error(
                "[ALERTS] Create error:",
                err
            );

            setError(
                err?.message ||
                "No se pudo crear la alerta."
            );

        } finally {

            setSaving(false);

        }

    }


    // =========================================================
    // TOGGLE ALERT
    // =========================================================

    async function handleToggle(
        alert
    ) {

        setError("");
        setMessage("");


        try {

            await updateAlert(
                alert.id,
                {
                    active:
                        !alert.active,
                }
            );


            setMessage(
                alert.active
                    ? "Alerta desactivada."
                    : "Alerta activada."
            );


            await loadAlerts();

            await evaluateCurrentAlerts();

            await loadEvents();

        } catch (err) {

            console.error(
                "[ALERTS] Update error:",
                err
            );

            setError(
                err?.message ||
                "No se pudo actualizar la alerta."
            );

        }

    }


    // =========================================================
    // DELETE ALERT
    // =========================================================

    async function handleDelete(
        alertId
    ) {

        setError("");
        setMessage("");


        try {

            await deleteAlert(
                alertId
            );


            setMessage(
                "Alerta eliminada correctamente."
            );


            setEvaluations(
                (current) => {

                    const next = {
                        ...current,
                    };

                    delete next[
                        alertId
                    ];

                    return next;

                }
            );


            await loadAlerts();

            await evaluateCurrentAlerts();

            await loadEvents();

        } catch (err) {

            console.error(
                "[ALERTS] Delete error:",
                err
            );

            setError(
                err?.message ||
                "No se pudo eliminar la alerta."
            );

        }

    }


    // =========================================================
    // RENDER
    // =========================================================

    return (

    <>

        {alertNotification && (

            <div
                style={{
                    position: "fixed",
                    top: "24px",
                    right: "24px",
                    zIndex: 9999,
                    width: "340px",
                    padding: "18px",
                    borderRadius: "14px",
                    background: "#450a0a",
                    border: "1px solid #dc2626",
                    boxShadow:
                        "0 12px 40px rgba(0,0,0,0.45)",
                    color: "#f8fafc",
                }}
            >

                <div
                    style={{
                        fontSize: "18px",
                        fontWeight: "800",
                        color: "#fca5a5",
                        marginBottom: "8px",
                    }}
                >
                    🚨 ALERTA DISPARADA
                </div>

                <div
                    style={{
                        fontSize: "16px",
                        fontWeight: "700",
                    }}
                >
                    {alertNotification.symbol}{" "}
                    {alertNotification.operator}{" "}
                    {Number(
                        alertNotification.target
                    ).toLocaleString(
                        "es-ES",
                        {
                            maximumFractionDigits: 4,
                        }
                    )}
                </div>

                <div
                    style={{
                        marginTop: "8px",
                        color: "#cbd5e1",
                        fontSize: "14px",
                    }}
                >
                    Precio actual:{" "}

                    <strong>
                        {Number(
                            alertNotification.price
                        ).toLocaleString(
                            "es-ES",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4,
                            }
                        )}
                    </strong>

                    {" "}USD
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setAlertNotification(null)
                    }
                    style={{
                        marginTop: "12px",
                        padding: "6px 10px",
                        borderRadius: "7px",
                        border: "1px solid #7f1d1d",
                        background: "#1f2937",
                        color: "#f8fafc",
                        cursor: "pointer",
                    }}
                >
                    Cerrar
                </button>

            </div>

        )}

        <main className="page">

            <div
                style={{
                    maxWidth:
                        "1000px",

                    margin:
                        "0 auto",
                }}
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <header
                    style={{
                        marginBottom:
                            "24px",
                    }}
                >

                    <h1>
                        Alertas
                    </h1>

                    <p
                        style={{
                            color:
                                "#94a3b8",
                        }}
                    >
                        Crea y gestiona alertas de mercado.
                    </p>
                    <div
    style={{
        marginTop: "8px",
        fontSize: "13px",
        color:
            wsConnected
                ? "#4ade80"
                : "#f59e0b",
    }}
>
    {wsConnected
        ? "● Mercado en tiempo real conectado"
        : "○ Mercado en tiempo real desconectado"
    }
</div>

                </header>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        style={{
                            marginBottom:
                                "16px",

                            padding:
                                "12px 16px",

                            borderRadius:
                                "8px",

                            background:
                                "#450a0a",

                            border:
                                "1px solid #991b1b",

                            color:
                                "#fca5a5",
                        }}
                    >

                        {error}

                    </div>

                )}


                {/* =================================================
                    SUCCESS
                ================================================= */}

                {message && (

                    <div
                        style={{
                            marginBottom:
                                "16px",

                            padding:
                                "12px 16px",

                            borderRadius:
                                "8px",

                            background:
                                "#052e16",

                            border:
                                "1px solid #166534",

                            color:
                                "#86efac",
                        }}
                    >

                        {message}

                    </div>

                )}


                {/* =================================================
                    CREATE ALERT
                ================================================= */}

                <section
                    style={{
                        padding:
                            "24px",

                        marginBottom:
                            "24px",

                        borderRadius:
                            "12px",

                        background:
                            "#0f172a",

                        border:
                            "1px solid #1e293b",
                    }}
                >

                    <h2
                        style={{
                            marginBottom:
                                "20px",
                        }}
                    >
                        Nueva alerta
                    </h2>


                    <form
                        onSubmit={
                            handleCreate
                        }
                        style={{
                            display:
                                "grid",

                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(150px, 1fr))",

                            gap:
                                "12px",
                        }}
                    >

                        {/* SYMBOL */}

                        <div>

                            <label>
                                Símbolo
                            </label>

                            <input
                                name="symbol"
                                value={
                                    form.symbol
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="AAPL / GOLD"
                                maxLength={
                                    20
                                }
                                required
                            />

                        </div>


                        {/* INDICATOR */}

                        <div>

                            <label>
                                Indicador
                            </label>

                            <select
                                name="indicator"
                                value={
                                    form.indicator
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option
                                    value="price"
                                >
                                    Precio
                                </option>

                                <option
                                    value="rsi"
                                >
                                    RSI
                                </option>

                                <option
                                    value="macd"
                                >
                                    MACD
                                </option>

                                <option
                                    value="ema"
                                >
                                    EMA
                                </option>

                            </select>

                        </div>


                        {/* OPERATOR */}

                        <div>

                            <label>
                                Condición
                            </label>

                            <select
                                name="operator"
                                value={
                                    form.operator
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option
                                    value=">="
                                >
                                    Mayor o igual
                                </option>

                                <option
                                    value=">"
                                >
                                    Mayor que
                                </option>

                                <option
                                    value="<="
                                >
                                    Menor o igual
                                </option>

                                <option
                                    value="<"
                                >
                                    Menor que
                                </option>

                                <option
                                    value="=="
                                >
                                    Igual
                                </option>

                            </select>

                        </div>


                        {/* TARGET VALUE */}

                        <div>

                            <label>
                                Valor
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="target_value"
                                value={
                                    form.target_value
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="3000"
                                required
                            />

                        </div>


                        {/* SUBMIT */}

                        <div
                            style={{
                                display:
                                    "flex",

                                alignItems:
                                    "end",
                            }}
                        >

                            <button
                                type="submit"
                                disabled={
                                    saving
                                }
                                style={{
                                    width:
                                        "100%",
                                }}
                            >

                                {saving
                                    ? "Creando..."
                                    : "Crear alerta"
                                }

                            </button>

                        </div>

                    </form>

                </section>


                {/* =================================================
                    ALERT LIST HEADER
                ================================================= */}

                <section>

                    <div
                        style={{
                            display:
                                "flex",

                            justifyContent:
                                "space-between",

                            alignItems:
                                "center",

                            marginBottom:
                                "16px",

                            gap:
                                "12px",

                            flexWrap:
                                "wrap",
                        }}
                    >

                        <div>

                            <h2>
                                Mis alertas
                            </h2>

                            {evaluating && (

                                <small
                                    style={{
                                        color:
                                            "#94a3b8",
                                    }}
                                >
                                    Evaluando condiciones...
                                </small>

                            )}

                        </div>


                        <button
                            type="button"
                            onClick={
                                handleRefresh
                            }
                            disabled={
                                loading ||
                                evaluating
                            }
                        >

                            {loading ||
                            evaluating
                                ? "Actualizando..."
                                : "Actualizar"
                            }

                        </button>

                    </div>


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading && (

                        <div
                            style={{
                                padding:
                                    "30px",

                                textAlign:
                                    "center",

                                color:
                                    "#94a3b8",
                            }}
                        >

                            Cargando alertas...

                        </div>

                    )}


                    {/* =================================================
                        EMPTY
                    ================================================= */}

                    {!loading &&
                        alerts.length ===
                            0 && (

                            <div
                                style={{
                                    padding:
                                        "30px",

                                    textAlign:
                                        "center",

                                    borderRadius:
                                        "12px",

                                    background:
                                        "#0f172a",

                                    border:
                                        "1px solid #1e293b",

                                    color:
                                        "#94a3b8",
                                }}
                            >

                                <h3>
                                    No tienes alertas creadas.
                                </h3>

                                <p>
                                    Crea una alerta utilizando
                                    el formulario superior.
                                </p>

                            </div>

                        )}


                    {/* =================================================
                        ALERTS
                    ================================================= */}

                    {!loading &&
                        alerts.length >
                            0 && (

                            <div
                                style={{
                                    display:
                                        "grid",

                                    gap:
                                        "12px",
                                }}
                            >

                                {alerts.map(
    (alert) => {

        const evaluationMap =
            evaluations || {};

        const evaluation =
            evaluationMap[
                alert.id
            ] || null;

        const triggered =
            evaluation?.triggered ===
            true;

        const currentValue =
            formatCurrentValue(
                evaluation
            );


                                        return (

                                            <article
                                                key={
                                                    alert.id
                                                }
                                                style={{
                                                    padding:
                                                        "18px",

                                                    borderRadius:
                                                        "12px",

                                                    background:
                                                        "#0f172a",

                                                    border:
                                                        triggered
                                                            ? "1px solid #dc2626"
                                                            : "1px solid #1e293b",

                                                    boxShadow:
                                                        triggered
                                                            ? "0 0 0 1px rgba(220,38,38,0.15)"
                                                            : "none",
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",

                                                        justifyContent:
                                                            "space-between",

                                                        gap:
                                                            "20px",

                                                        alignItems:
                                                            "center",

                                                        flexWrap:
                                                            "wrap",
                                                    }}
                                                >

                                                    {/* INFO */}

                                                    <div
                                                        style={{
                                                            flex:
                                                                "1 1 300px",
                                                        }}
                                                    >

                                                        <strong
                                                            style={{
                                                                fontSize:
                                                                    "18px",
                                                            }}
                                                        >

                                                            {String(
                                                                alert.symbol ||
                                                                ""
                                                            ).toUpperCase()}

                                                        </strong>


                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    "8px",

                                                                color:
                                                                    "#cbd5e1",
                                                            }}
                                                        >

                                                            <span>
                                                                {String(
                                                                    alert.indicator ||
                                                                    ""
                                                                ).toUpperCase()}
                                                            </span>

                                                            {" "}

                                                            <strong>
                                                                {alert.operator}
                                                            </strong>

                                                            {" "}

                                                            <span>
                                                                {alert.target_value}
                                                            </span>

                                                        </div>


                                                        {/* ACTIVE STATUS */}

                                                        <small
                                                            style={{
                                                                display:
                                                                    "block",

                                                                marginTop:
                                                                    "8px",

                                                                color:
                                                                    alert.active
                                                                        ? "#4ade80"
                                                                        : "#94a3b8",
                                                            }}
                                                        >

                                                            {alert.active
                                                                ? "● Activa"
                                                                : "○ Inactiva"
                                                            }

                                                        </small>


                                                        {/* EVALUATION */}

                                                        {alert.active &&
                                                            evaluation && (

                                                                <div
                                                                    style={{
                                                                        marginTop:
                                                                            "14px",

                                                                        padding:
                                                                            "12px",

                                                                        borderRadius:
                                                                            "8px",

                                                                        background:
                                                                            triggered
                                                                                ? "#450a0a"
                                                                                : "#111827",

                                                                        border:
                                                                            triggered
                                                                                ? "1px solid #991b1b"
                                                                                : "1px solid #1f2937",
                                                                    }}
                                                                >

                                                                    {currentValue !==
                                                                        null && (

                                                                        <div
                                                                            style={{
                                                                                color:
                                                                                    "#cbd5e1",

                                                                                marginBottom:
                                                                                    "6px",
                                                                            }}
                                                                        >

                                                                            <span>
                                                                                Valor actual:
                                                                            </span>

                                                                            {" "}

                                                                            <strong>
                                                                                {currentValue}
                                                                            </strong>

                                                                        </div>

                                                                    )}


                                                                    {triggered ? (

                                                                        <div
                                                                            style={{
                                                                                color:
                                                                                    "#fca5a5",

                                                                                fontWeight:
                                                                                    "700",
                                                                            }}
                                                                        >
                                                                            🚨 ALERTA DISPARADA
                                                                        </div>

                                                                    ) : (

                                                                        <div
                                                                            style={{
                                                                                color:
                                                                                    "#94a3b8",
                                                                            }}
                                                                        >
                                                                            ✓ Condición no alcanzada
                                                                        </div>

                                                                    )}


                                                                    {evaluation.event_created && (

                                                                        <div
                                                                            style={{
                                                                                marginTop:
                                                                                    "6px",

                                                                                color:
                                                                                    "#fca5a5",

                                                                                fontSize:
                                                                                    "13px",
                                                                            }}
                                                                        >

                                                                            Evento creado:
                                                                            {" "}
                                                                            #{evaluation.event_id}

                                                                        </div>

                                                                    )}

                                                                </div>

                                                            )}


                                                        {/* EVALUATION ERROR */}

                                                        {alert.active &&
                                                            evaluation &&
                                                            evaluation.supported ===
                                                                false && (

                                                                <div
                                                                    style={{
                                                                        marginTop:
                                                                            "12px",

                                                                        padding:
                                                                            "10px",

                                                                        borderRadius:
                                                                            "8px",

                                                                        background:
                                                                            "#422006",

                                                                        border:
                                                                            "1px solid #92400e",

                                                                        color:
                                                                            "#fdba74",

                                                                        fontSize:
                                                                            "13px",
                                                                    }}
                                                                >

                                                                    No se pudo evaluar esta alerta.

                                                                    {evaluation.error && (

                                                                        <div
                                                                            style={{
                                                                                marginTop:
                                                                                    "4px",
                                                                            }}
                                                                        >

                                                                            {evaluation.error}

                                                                        </div>

                                                                    )}

                                                                </div>

                                                            )}

                                                    </div>


                                                    {/* ACTIONS */}

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",

                                                            gap:
                                                                "8px",

                                                            flexWrap:
                                                                "wrap",
                                                        }}
                                                    >

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleToggle(
                                                                    alert
                                                                )
                                                            }
                                                        >

                                                            {alert.active
                                                                ? "Desactivar"
                                                                : "Activar"
                                                            }

                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    alert.id
                                                                )
                                                            }
                                                        >

                                                            Eliminar

                                                        </button>

                                                    </div>

                                                </div>

                                            </article>

                                        );

                                    }
                                )}

                            </div>

                        )}

                </section>


                {/* =================================================
    EVENT HISTORY
================================================= */}

<section
    style={{
        marginTop: "32px",
        padding: "24px",
        borderRadius: "12px",
        background: "#0f172a",
        border: "1px solid #1e293b",
    }}
>

    {/* HEADER */}

    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "18px",
        }}
    >

        <div>

            <h2
                style={{
                    margin: 0,
                }}
            >
                Historial de eventos
            </h2>

            <small
                style={{
                    color: "#94a3b8",
                }}
            >
                Eventos generados por las alertas disparadas.
            </small>

        </div>


        {/* CONTADOR */}

        <div
            style={{
                padding: "6px 12px",
                borderRadius: "999px",
                background: "#111827",
                border: "1px solid #1f2937",
                color: "#cbd5e1",
                fontSize: "13px",
                fontWeight: "600",
            }}
        >
            {events.length}{" "}
            {events.length === 1
                ? "evento"
                : "eventos"}
        </div>

    </div>


    {/* =================================================
        SIN EVENTOS
    ================================================= */}

    {events.length === 0 && (

        <div
            style={{
                padding: "30px 20px",
                textAlign: "center",
                borderRadius: "10px",
                background: "#111827",
                border: "1px dashed #334155",
                color: "#94a3b8",
            }}
        >

            <div
                style={{
                    fontSize: "30px",
                    marginBottom: "8px",
                }}
            >
                🔔
            </div>

            <strong>
                No hay eventos registrados.
            </strong>

            <p
                style={{
                    marginTop: "8px",
                    marginBottom: 0,
                }}
            >
                Cuando una alerta se dispare,
                aparecerá aquí.
            </p>

        </div>

    )}


    {/* =================================================
        EVENTOS
    ================================================= */}

    {events.length > 0 && (

        <div
            style={{
                display: "grid",
                gap: "10px",
            }}
        >

            {events.map((event) => {

                const eventValue =
                    Number(
                        event.current_value
                    );

                const targetValue =
                    Number(
                        event.target_value
                    );

                const formattedEventValue =
                    Number.isFinite(eventValue)
                        ? eventValue.toLocaleString(
                            "es-ES",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4,
                            }
                        )
                        : "—";

                const formattedTargetValue =
                    Number.isFinite(targetValue)
                        ? targetValue.toLocaleString(
                            "es-ES",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4,
                            }
                        )
                        : "—";

                const eventDate =
                    event.triggered_at
                        ? new Date(
                            event.triggered_at
                        ).toLocaleString(
                            "es-ES"
                        )
                        : "Fecha no disponible";


                return (

                    <article
                        key={event.id}
                        style={{
                            padding: "16px",
                            borderRadius: "10px",
                            background: "#111827",
                            border: "1px solid #1f2937",
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "16px",
                                flexWrap: "wrap",
                            }}
                        >

                            {/* EVENT INFO */}

                            <div
                                style={{
                                    flex: "1 1 300px",
                                }}
                            >

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                >

                                    <span
                                        style={{
                                            fontSize: "20px",
                                        }}
                                    >
                                        🚨
                                    </span>

                                    <strong
                                        style={{
                                            fontSize: "18px",
                                        }}
                                    >
                                        {String(
                                            event.symbol || ""
                                        ).toUpperCase()}
                                    </strong>

                                </div>


                                {/* CONDITION */}

                                <div
                                    style={{
                                        marginTop: "8px",
                                        color: "#cbd5e1",
                                    }}
                                >

                                    <span>
                                        {String(
                                            event.indicator || ""
                                        ).toUpperCase()}
                                    </span>

                                    {" "}

                                    <strong>
                                        {event.operator}
                                    </strong>

                                    {" "}

                                    <strong>
                                        {formattedTargetValue}
                                    </strong>

                                </div>


                                {/* EVENT ID */}

                                <small
                                    style={{
                                        display: "block",
                                        marginTop: "6px",
                                        color: "#64748b",
                                    }}
                                >
                                    Evento #{event.id}
                                </small>

                            </div>


                            {/* EVENT VALUE */}

                            <div
                                style={{
                                    textAlign: "right",
                                }}
                            >

                                <div
    style={{
        color: "#94a3b8",
        fontSize: "12px",
        marginBottom: "4px",
    }}
>
    Valor que disparó
</div>

                                <strong
                                    style={{
                                        display: "block",
                                        color: "#fca5a5",
                                        fontSize: "18px",
                                    }}
                                >
                                    {formattedEventValue}
                                </strong>

                                <small
                                    style={{
                                        display: "block",
                                        marginTop: "6px",
                                        color: "#64748b",
                                    }}
                                >
                                    {eventDate}
                                </small>

                            </div>

                        </div>

                    </article>

                );

            })}

        </div>

    )}

</section>

                        </div>

        </main>

    </>

    );

}

