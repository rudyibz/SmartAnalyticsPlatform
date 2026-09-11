import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useMarketContext } from "../context/MarketContext";

import {
    getScanner,
    getAlerts,
    createAlert,
    createTradingSetup,
    calculateTradingSetupRisk,
} from "../services/api";


export default function Scanner() {

    const navigate = useNavigate();

    const {
        setSymbol,
    } = useMarketContext();

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [opportunityFilter, setOpportunityFilter] = useState("all");
    const [sortBy, setSortBy] = useState("opportunity_score");
    const [sortDirection, setSortDirection] = useState("desc");

    const [quantity, setQuantity] = useState(1);

    // =========================================================
    // RISK MANAGEMENT
    // =========================================================

    const [capital, setCapital] = useState(10000);
    const [riskPercent, setRiskPercent] = useState(1);

    const [riskManagement, setRiskManagement] = useState(null);
    const [riskLoading, setRiskLoading] = useState(false);
    const [riskError, setRiskError] = useState("");


    // =========================================================
    // CARGAR SCANNER
    // =========================================================

    async function loadScanner() {

        setLoading(true);
        setError("");

        try {

            const data = await getScanner();

            setAssets(
                Array.isArray(data)
                    ? data
                    : data?.assets || []
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudo cargar el scanner."
            );

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {
        loadScanner();
    }, []);


    // =========================================================
    // ORDENACIÓN
    // =========================================================

    function handleSort(column) {

        if (sortBy === column) {

            setSortDirection(
                current =>
                    current === "asc"
                        ? "desc"
                        : "asc"
            );

            return;
        }

        setSortBy(column);
        setSortDirection("desc");
    }


    // =========================================================
    // FILTRADO + ORDENACIÓN
    // =========================================================

    const filteredAssets = useMemo(() => {

        const query =
            search
                .trim()
                .toUpperCase();

        const filtered =
            assets.filter(asset => {

                const matchesSearch =
                    !query ||
                    asset.symbol
                        ?.toUpperCase()
                        .includes(query);

                const matchesOpportunity =
                    opportunityFilter === "all" ||
                    String(asset.opportunity_label || "")
                        .toLowerCase() ===
                        opportunityFilter.toLowerCase();

                return (
                    matchesSearch &&
                    matchesOpportunity
                );

            });

        return [...filtered].sort((a, b) => {

            let valueA = a[sortBy];
            let valueB = b[sortBy];

            if (typeof valueA === "string") {

                valueA = valueA.toLowerCase();
                valueB = valueB?.toLowerCase();

            }

            if (valueA < valueB) {

                return sortDirection === "asc"
                    ? -1
                    : 1;

            }

            if (valueA > valueB) {

                return sortDirection === "asc"
                    ? 1
                    : -1;

            }

            return 0;

        });

    }, [
        assets,
        search,
        opportunityFilter,
        sortBy,
        sortDirection,
    ]);


    // =========================================================
    // ABRIR ACTIVO
    // =========================================================

    function openAsset(symbol) {

        if (!symbol) {
            return;
        }

        setSymbol(symbol);

        navigate("/");

    }


    // =========================================================
    // HELPERS
    // =========================================================

    function formatNumber(
        value,
        decimals = 2
    ) {

        if (
            value === null ||
            value === undefined
        ) {
            return "N/A";
        }

        const number =
            Number(value);

        return Number.isNaN(number)
            ? value
            : number.toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals,
                }
            );
    }


    function getSignalClass(signal) {

        const value =
            String(signal || "")
                .toUpperCase();

        if (value === "BUY") {
            return "buy";
        }

        if (value === "SELL") {
            return "sell";
        }

        return "hold";
    }


    function getTrendClass(trend) {

        const value =
            String(trend || "")
                .toLowerCase();

        if (value.includes("bull")) {
            return "bullish";
        }

        if (value.includes("bear")) {
            return "bearish";
        }

        return "neutral";
    }


    function getRiskClass(risk) {

        const value =
            String(risk || "")
                .toLowerCase();

        if (value.includes("high")) {
            return "risk-high";
        }

        if (value.includes("low")) {
            return "risk-low";
        }

        return "risk-medium";
    }


    function getScoreClass(score) {

        const value =
            Number(score);

        if (value >= 70) {
            return "score-high";
        }

        if (value <= 30) {
            return "score-low";
        }

        return "score-medium";
    }


    function getIndicatorClass(
        value,
        type
    ) {

        const number =
            Number(value);

        if (Number.isNaN(number)) {
            return "";
        }

        if (type === "rsi") {

            if (number >= 70) {
                return "indicator-warning";
            }

            if (number <= 30) {
                return "indicator-positive";
            }

        }

        if (type === "macd") {

            return number >= 0
                ? "indicator-positive"
                : "indicator-negative";

        }

        if (type === "adx") {

            if (number >= 30) {
                return "indicator-positive";
            }

            if (number < 20) {
                return "indicator-muted";
            }

        }

        return "";
    }


    function getSortIcon(column) {

        if (sortBy !== column) {
            return "↕";
        }

        return sortDirection === "asc"
            ? "↑"
            : "↓";
    }


    // =========================================================
    // RESUMEN DE OPORTUNIDADES
    // =========================================================

    const opportunitySummary = useMemo(() => {

        const summary = {
            Excellent: 0,
            Strong: 0,
            Moderate: 0,
            Weak: 0,
            Avoid: 0,
        };

        assets.forEach(asset => {

            const label =
                asset.opportunity_label;

            if (
                Object.prototype.hasOwnProperty.call(
                    summary,
                    label
                )
            ) {
                summary[label]++;
            }

        });

        return summary;

    }, [assets]);


    // =========================================================
    // TOP OPPORTUNITY
    // =========================================================

    const topOpportunity = useMemo(() => {

        if (!assets.length) {
            return null;
        }

        return [...assets].sort(
            (a, b) =>
                Number(
                    b.opportunity_score || 0
                ) -
                Number(
                    a.opportunity_score || 0
                )
        )[0];

    }, [assets]);


    // =========================================================
    // CURRENT RISK
    // =========================================================

    const currentRisk = useMemo(() => {

        if (!topOpportunity) {
            return null;
        }

        const entry = Number(
            topOpportunity.entry
        );

        const stopLoss = Number(
            topOpportunity.stop_loss
        );

        const takeProfit = Number(
            topOpportunity.take_profit
        );

        const qty = Number(
            quantity
        );

        const capitalValue = Number(
            capital
        );

        if (
            !Number.isFinite(entry) ||
            !Number.isFinite(stopLoss) ||
            !Number.isFinite(takeProfit) ||
            !Number.isFinite(qty) ||
            qty <= 0
        ) {
            return null;
        }

        const riskPerUnit =
            Math.abs(
                entry - stopLoss
            );

        const rewardPerUnit =
            Math.abs(
                takeProfit - entry
            );

        const actualRisk =
            riskPerUnit * qty;

        const potentialProfit =
            rewardPerUnit * qty;

        const riskPercentActual =
            capitalValue > 0
                ? (actualRisk / capitalValue) * 100
                : 0;

        return {
            actualRisk,
            potentialProfit,
            riskPercentActual,
            positionValue:
                entry * qty,
        };

    }, [
        topOpportunity,
        quantity,
        capital,
    ]);


    // =========================================================
    // RESET RISK MANAGEMENT AL CAMBIAR DE ACTIVO
    // =========================================================
    useEffect(() => {

        setRiskManagement(null);
        setRiskError("");

    }, [
        topOpportunity?.symbol,
        topOpportunity?.entry,
        topOpportunity?.stop_loss,
        topOpportunity?.take_profit,
    ]);


    // =========================================================
    // CALCULAR RISK MANAGEMENT
    // =========================================================

    async function calculateRisk() {

        if (!topOpportunity) {
            return;
        }

        const entry =
            Number(topOpportunity.entry);

        const stopLoss =
            Number(topOpportunity.stop_loss);

        const takeProfit =
            Number(topOpportunity.take_profit);

        const capitalValue =
            Number(capital);

        const riskValue =
            Number(riskPercent);


        if (
            !Number.isFinite(entry) ||
            !Number.isFinite(stopLoss) ||
            !Number.isFinite(takeProfit)
        ) {

            setRiskError(
                "El setup no tiene niveles válidos."
            );

            return;
        }


        if (
            !Number.isFinite(capitalValue) ||
            capitalValue <= 0
        ) {

            setRiskError(
                "El capital debe ser mayor que 0."
            );

            return;
        }


        if (
            !Number.isFinite(riskValue) ||
            riskValue <= 0 ||
            riskValue > 100
        ) {

            setRiskError(
                "El riesgo debe estar entre 0 y 100%."
            );

            return;
        }


        setRiskLoading(true);
        setRiskError("");


        try {

            const result =
                await calculateTradingSetupRisk({
                    capital: capitalValue,
                    risk_percent: riskValue,
                    entry,
                    stop_loss: stopLoss,
                    take_profit: takeProfit,
                });


            setRiskManagement(
                result
            );


            if (
                result?.recommended_quantity &&
                Number(
                    result.recommended_quantity
                ) > 0
            ) {

                setQuantity(
                    Number(
                        result.recommended_quantity
                    )
                );

            }

        } catch (err) {

            console.error(
                "[SCANNER] Risk Management error:",
                err
            );

            setRiskError(
                err?.message ||
                "No se pudo calcular el riesgo."
            );

            setRiskManagement(null);

        } finally {

            setRiskLoading(false);

        }

    }


    // =========================================================
    // CREAR ALERTAS DEL SETUP
    // =========================================================

    async function createSetupAlert() {

        if (!topOpportunity) {
            return;
        }

        const direction =
            topOpportunity.direction;

        if (
            direction !== "LONG" &&
            direction !== "SHORT"
        ) {
            return;
        }

        const symbol =
            String(
                topOpportunity.symbol || ""
            )
                .trim()
                .toUpperCase();

        const entry =
            Number(
                topOpportunity.entry
            );

        const stopLoss =
            Number(
                topOpportunity.stop_loss
            );

        const takeProfit =
            Number(
                topOpportunity.take_profit
            );

        const atr =
            Number(
                topOpportunity.atr
            );

        const riskReward =
            Number(
                topOpportunity.risk_reward
            );

        const opportunityScore =
            Number(
                topOpportunity.opportunity_score
            );

        const opportunityLabel =
            topOpportunity.opportunity_label;


        if (
            !symbol ||
            !Number.isFinite(entry) ||
            !Number.isFinite(stopLoss) ||
            !Number.isFinite(takeProfit)
        ) {
            return;
        }


        const entryOperator =
            direction === "LONG"
                ? ">="
                : "<=";

        const stopOperator =
            direction === "LONG"
                ? "<="
                : ">=";

        const targetOperator =
            direction === "LONG"
                ? ">="
                : "<=";


        const setupData = {

            symbol,

            direction,

            entry,

            quantity:
                Number(quantity),

            stop_loss:
                stopLoss,

            take_profit:
                takeProfit,

            atr,

            risk_reward:
                riskReward,

            opportunity_score:
                opportunityScore,

            opportunity_label:
                opportunityLabel,

        };


        try {

            await createTradingSetup(
                setupData
            );


            const existingAlerts =
                await getAlerts();


            const alerts =
                Array.isArray(
                    existingAlerts
                )
                    ? existingAlerts
                    : existingAlerts?.data ||
                    [];


            const setupAlerts = [

                {
                    operator:
                        entryOperator,

                    target_value:
                        entry,
                },

                {
                    operator:
                        stopOperator,

                    target_value:
                        stopLoss,
                },

                {
                    operator:
                        targetOperator,

                    target_value:
                        takeProfit,
                },

            ];


            let created = 0;


            for (
                const setup
                of setupAlerts
            ) {

                const duplicate =
                    alerts.some(
                        alertItem =>

                            String(
                                alertItem.symbol ||
                                ""
                            )
                                .trim()
                                .toUpperCase() ===
                                symbol &&

                            String(
                                alertItem.indicator ||
                                ""
                            ).toUpperCase() ===
                                "PRICE" &&

                            String(
                                alertItem.operator ||
                                ""
                            ) ===
                                setup.operator &&

                            Number(
                                alertItem.target_value
                            ) ===
                                setup.target_value &&

                            alertItem.is_active !==
                                false
                    );


                if (duplicate) {
                    continue;
                }


                await createAlert({

                    symbol,

                    indicator:
                        "price",

                    operator:
                        setup.operator,

                    target_value:
                        setup.target_value,

                });


                created++;

            }


            if (created === 0) {

                alert(
                    `⚠️ Las 3 alertas del setup de ${symbol} ya existen.`
                );

            }
            else if (created < 3) {

                alert(
                    `🔔 ${created} alerta(s) nueva(s) creada(s) para ${symbol}.`
                );

            }
            else {

                alert(
                    `🔔 3 alertas creadas para ${symbol}.`
                );

            }

        }
        catch (err) {

            console.error(
                "[SCANNER] Error creando alertas:",
                err
            );

            alert(
                err?.message ||
                "No se pudieron crear las alertas."
            );

        }

    }


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <main className="scanner-page">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="scanner-header">

                <div>

                    <h1>
                        Market Scanner
                    </h1>

                    <p>
                        Ranking inteligente de activos
                        analizados por IA.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={loadScanner}
                    disabled={loading}
                >

                    {loading
                        ? "Analizando..."
                        : "Actualizar"}

                </button>

            </div>


            {/* ================================================= */}
            {/* TOP OPPORTUNITY */}
            {/* ================================================= */}

            {!loading &&
                topOpportunity && (

                    <div className="scanner-top-opportunity">

                        <div className="top-opportunity-icon">
                            ⭐
                        </div>


                        <div className="top-opportunity-content">

                            <span className="top-opportunity-title">
                                TOP OPPORTUNITY
                            </span>


                            <div className="top-opportunity-main">

                                <strong>
                                    {
                                        topOpportunity.symbol
                                    }
                                </strong>


                                <span className="top-opportunity-score">
                                    {
                                        topOpportunity.opportunity_score
                                    }
                                </span>


                                <span className="top-opportunity-label">
                                    {
                                        topOpportunity.opportunity_label
                                    }
                                </span>

                            </div>


                            <div className="top-opportunity-details">

                                AI Score{" "}
                                {
                                    topOpportunity.score
                                }

                                {" · "}

                                RSI{" "}
                                {
                                    formatNumber(
                                        topOpportunity.rsi
                                    )
                                }

                                {" · "}

                                ADX{" "}
                                {
                                    formatNumber(
                                        topOpportunity.adx
                                    )
                                }

                                {" · "}

                                MACD{" "}
                                {
                                    formatNumber(
                                        topOpportunity.macd,
                                        4
                                    )
                                }

                            </div>

                        </div>

                    </div>

                )}


            {/* ================================================= */}
            {/* TRADING SETUP */}
            {/* ================================================= */}

            {!loading &&
                topOpportunity &&
                topOpportunity.direction &&
                topOpportunity.direction !==
                    "Neutral" && (

                    <div className="top-opportunity-trading">


                        <div className="trading-setup-title">
                            TRADING SETUP
                        </div>


                        <div className="trading-setup-direction">

                            <span
                                className={`trading-direction ${
                                    String(
                                        topOpportunity.direction
                                    ).toLowerCase()
                                }`}
                            >

                                {topOpportunity.direction ===
                                "LONG"
                                    ? "🟢 LONG"
                                    : "🔴 SHORT"}

                            </span>

                        </div>


                        {/* =================================================
                            SETUP LEVELS
                        ================================================= */}

                        <div className="trading-setup-grid">


                            <div className="trading-setup-item">

                                <span>
                                    ENTRY
                                </span>

                                <strong>
                                    $
                                    {formatNumber(
                                        topOpportunity.entry,
                                        2
                                    )}
                                </strong>

                            </div>


                            <div className="trading-setup-item stop">

                                <span>
                                    STOP LOSS
                                </span>

                                <strong>
                                    $
                                    {formatNumber(
                                        topOpportunity.stop_loss,
                                        2
                                    )}
                                </strong>

                            </div>


                            <div className="trading-setup-item target">

                                <span>
                                    TAKE PROFIT
                                </span>

                                <strong>
                                    $
                                    {formatNumber(
                                        topOpportunity.take_profit,
                                        2
                                    )}
                                </strong>

                            </div>


                            <div className="trading-setup-item quantity">

                                <span>
                                    QUANTITY
                                </span>

                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={
                                        quantity
                                    }
                                    onChange={
                                        event => {

                                            const value =
                                                Number(
                                                    event.target.value
                                                );

                                            setQuantity(

                                                Number.isFinite(
                                                    value
                                                ) &&
                                                value > 0

                                                    ? value

                                                    : 0.01

                                            );

                                            setRiskManagement(
                                                null
                                            );

                                        }
                                    }
                                />

                            </div>


                            <div className="trading-setup-item">

                                <span>
                                    ATR
                                </span>

                                <strong>
                                    {
                                        formatNumber(
                                            topOpportunity.atr,
                                            4
                                        )
                                    }
                                </strong>

                            </div>


                            <div className="trading-setup-item rr">

                                <span>
                                    RISK / REWARD
                                </span>

                                <strong>
                                    1 :{" "}
                                    {formatNumber(
                                        topOpportunity.risk_reward,
                                        2
                                    )}
                                </strong>

                            </div>


                        </div>


                                                    {currentRisk && (

                                <div className="trading-risk-results">

                                    <div className="trading-setup-item">

                                        <span>
                                            CURRENT QUANTITY
                                        </span>

                                        <strong>
                                            {formatNumber(
                                                quantity,
                                                4
                                            )}
                                        </strong>

                                    </div>


                                    <div className="trading-setup-item">

                                        <span>
                                            CURRENT RISK
                                        </span>

                                        <strong className="equity-negative">
                                            -$
                                            {formatNumber(
                                                currentRisk.actualRisk,
                                                2
                                            )}
                                        </strong>

                                    </div>


                                    <div className="trading-setup-item">

                                        <span>
                                            CURRENT RISK %
                                        </span>

                                        <strong>
                                            {formatNumber(
                                                currentRisk.riskPercentActual,
                                                2
                                            )}
                                            %
                                        </strong>

                                    </div>


                                    <div className="trading-setup-item">

                                        <span>
                                            POSITION VALUE
                                        </span>

                                        <strong>
                                            $
                                            {formatNumber(
                                                currentRisk.positionValue,
                                                2
                                            )}
                                        </strong>

                                    </div>


                                    <div className="trading-setup-item target">

                                        <span>
                                            POTENTIAL PROFIT
                                        </span>

                                        <strong className="equity-positive">
                                            +$
                                            {formatNumber(
                                                currentRisk.potentialProfit,
                                                2
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            )}

                        {/* =================================================
                            RISK MANAGEMENT
                        ================================================= */}

                        <div className="trading-risk-management">

                            <div className="trading-setup-title">
                                RISK MANAGEMENT
                            </div>

                            <div className="trading-risk-inputs">

                                <div className="trading-setup-item">

                                    <span>
                                        CAPITAL
                                    </span>

                                    <input
                                        type="number"
                                        min="1"
                                        step="100"
                                        value={capital}
                                        onChange={(event) =>
                                            setCapital(
                                                Number(event.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="trading-setup-item">

                                    <span>
                                        RISK %
                                    </span>

                                    <input
                                        type="number"
                                        min="0.01"
                                        max="100"
                                        step="0.1"
                                        value={riskPercent}
                                        onChange={(event) =>
                                            setRiskPercent(
                                                Number(event.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="trading-risk-action">

                                    <button
                                        type="button"
                                        className="trading-alert-button"
                                        onClick={calculateRisk}
                                        disabled={riskLoading}
                                    >
                                        {riskLoading
                                            ? "Calculando..."
                                            : "🧮 Calcular Riesgo"}
                                    </button>

                                </div>

                            </div>

                            {riskError && (

                                <div className="scanner-error">
                                    {riskError}
                                </div>

                            )}

                            {riskManagement && (

                                <div className="trading-risk-results">

                                    <div className="trading-setup-item">

                                        <span>
                                            RISK AMOUNT
                                        </span>

                                        <strong>
                                            $
                                            {formatNumber(
                                                riskManagement.risk_amount,
                                                2
                                            )}
                                        </strong>

                                    </div>

                                    <div className="trading-setup-item quantity">

                                        <span>
                                            RECOMMENDED QTY
                                        </span>

                                        <strong>
                                            {formatNumber(
                                                riskManagement.recommended_quantity,
                                                4
                                            )}
                                        </strong>

                                        <button
                                            type="button"
                                            className="trading-alert-button"
                                            style={{
                                                marginTop: "8px",
                                                width: "100%",
                                            }}
                                            onClick={() => {

                                                const recommended =
                                                    Number(
                                                        riskManagement.recommended_quantity
                                                    );

                                                if (
                                                    Number.isFinite(recommended) &&
                                                    recommended > 0
                                                ) {
                                                    setQuantity(recommended);
                                                }

                                            }}
                                        >
                                            ✅ Usar Quantity recomendada
                                        </button>

                                    </div>

                                    <div className="trading-setup-item">

                                        <span>
                                            POSITION VALUE
                                        </span>

                                        <strong>
                                            $
                                            {formatNumber(
                                                riskManagement.position_value,
                                                2
                                            )}
                                        </strong>

                                    </div>

                                    <div className="trading-setup-item stop">

                                        <span>
                                            MAX LOSS
                                        </span>

                                        <strong className="equity-negative">
                                            -$
                                            {formatNumber(
                                                riskManagement.max_loss,
                                                2
                                            )}
                                        </strong>

                                    </div>

                                    <div className="trading-setup-item target">

                                        <span>
                                            POTENTIAL PROFIT
                                        </span>

                                        <strong className="equity-positive">
                                            +$
                                            {formatNumber(
                                                riskManagement.potential_profit,
                                                2
                                            )}
                                        </strong>

                                    </div>

                                    <div className="trading-setup-item rr">

                                        <span>
                                            ACTUAL R/R
                                        </span>

                                        <strong>
                                            1 :
                                            {formatNumber(
                                                riskManagement.risk_reward,
                                                2
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            )}

                            {currentRisk && (

                                <div className="trading-risk-results">

                                    <div className="trading-setup-item">

                                        <span>
                                            CURRENT QUANTITY
                                        </span>

                                        <strong>
                                            {formatNumber(quantity, 4)}
                                        </strong>

                                    </div>

                                    <div className="trading-setup-item">

                                        <span>
                                            CURRENT RISK
                                        </span>

                                        <strong className="equity-negative">
                                            -$
                                            {formatNumber(
                                                currentRisk.actualRisk,
                                                2
                                            )}
                                        </strong>

                                    </div>

                                    <div className="trading-setup-item">

                                        <span>
                                            CURRENT RISK %
                                        </span>

                                        <strong>
                                            {formatNumber(
                                                currentRisk.riskPercentActual,
                                                2
                                            )}
                                            %
                                        </strong>

                                    </div>

                                    <div className="trading-setup-item">

                                        <span>
                                            POSITION VALUE
                                        </span>

                                        <strong>
                                            $
                                            {formatNumber(
                                                currentRisk.positionValue,
                                                2
                                            )}
                                        </strong>

                                    </div>

                                    <div className="trading-setup-item target">

                                        <span>
                                            POTENTIAL PROFIT
                                        </span>

                                        <strong className="equity-positive">
                                            +$
                                            {formatNumber(
                                                currentRisk.potentialProfit,
                                                2
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="trading-setup-actions">

                            <button
                                type="button"
                                className="trading-alert-button"
                                onClick={
                                    createSetupAlert
                                }
                            >
                                🔔 Crear alertas del Setup
                            </button>

                        </div>


                    </div>

                )}


            {/* ================================================= */}
            {/* RESUMEN DE OPORTUNIDADES */}
            {/* ================================================= */}

            {!loading &&
                assets.length > 0 && (

                    <div className="scanner-opportunity-summary">

                        <div className="scanner-summary-title">
                            MARKET OPPORTUNITIES
                        </div>

                        <div className="scanner-summary-count">
                            {assets.length} activos analizados
                        </div>


                        <div className="scanner-summary-grid">


                            <div className="summary-item excellent">

                                <span>
                                    🟢
                                </span>

                                <strong>
                                    {
                                        opportunitySummary.Excellent
                                    }
                                </strong>

                                <small>
                                    Excellent
                                </small>

                            </div>


                            <div className="summary-item strong">

                                <span>
                                    🟢
                                </span>

                                <strong>
                                    {
                                        opportunitySummary.Strong
                                    }
                                </strong>

                                <small>
                                    Strong
                                </small>

                            </div>


                            <div className="summary-item moderate">

                                <span>
                                    🟡
                                </span>

                                <strong>
                                    {
                                        opportunitySummary.Moderate
                                    }
                                </strong>

                                <small>
                                    Moderate
                                </small>

                            </div>


                            <div className="summary-item weak">

                                <span>
                                    🟠
                                </span>

                                <strong>
                                    {
                                        opportunitySummary.Weak
                                    }
                                </strong>

                                <small>
                                    Weak
                                </small>

                            </div>


                            <div className="summary-item avoid">

                                <span>
                                    🔴
                                </span>

                                <strong>
                                    {
                                        opportunitySummary.Avoid
                                    }
                                </strong>

                                <small>
                                    Avoid
                                </small>

                            </div>


                        </div>

                    </div>

                )}


            {/* ================================================= */}
            {/* BUSCADOR */}
            {/* ================================================= */}

            <div className="scanner-search">

                <span>
                    🔍
                </span>

                <input
                    type="text"
                    value={
                        search
                    }
                    onChange={
                        event =>
                            setSearch(
                                event.target.value
                            )
                    }
                    placeholder="Buscar símbolo..."
                />

            </div>


            {/* ================================================= */}
            {/* FILTROS DE OPORTUNIDAD */}
            {/* ================================================= */}

            <div className="scanner-filters">


                <button
                    type="button"
                    className={
                        opportunityFilter === "all"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setOpportunityFilter(
                            "all"
                        )
                    }
                >
                    Todas
                </button>


                <button
                    type="button"
                    className={
                        opportunityFilter === "excellent"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setOpportunityFilter(
                            "excellent"
                        )
                    }
                >
                    🟢 Excellent
                </button>


                <button
                    type="button"
                    className={
                        opportunityFilter === "strong"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setOpportunityFilter(
                            "strong"
                        )
                    }
                >
                    🟢 Strong
                </button>


                <button
                    type="button"
                    className={
                        opportunityFilter === "moderate"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setOpportunityFilter(
                            "moderate"
                        )
                    }
                >
                    🟡 Moderate
                </button>


                <button
                    type="button"
                    className={
                        opportunityFilter === "weak"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setOpportunityFilter(
                            "weak"
                        )
                    }
                >
                    🟠 Weak
                </button>


                <button
                    type="button"
                    className={
                        opportunityFilter === "avoid"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setOpportunityFilter(
                            "avoid"
                        )
                    }
                >
                    🔴 Avoid
                </button>


            </div>


            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (

                <div className="scanner-error">
                    {error}
                </div>

            )}


            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {loading && (

                <div className="scanner-loading">

                    <div className="scanner-spinner" />

                    <p>
                        Analizando mercados...
                    </p>

                </div>

            )}


            {/* ================================================= */}
            {/* SIN RESULTADOS */}
            {/* ================================================= */}

            {!loading &&
                filteredAssets.length === 0 && (

                    <div className="scanner-empty">

                        <div>
                            🔎
                        </div>

                        <h3>
                            No hay resultados
                        </h3>

                        <p>
                            No encontramos activos
                            que coincidan con tu búsqueda.
                        </p>

                    </div>

                )}


            {/* ================================================= */}
            {/* TABLA SCANNER 2.0 */}
            {/* ================================================= */}

            {!loading &&
                filteredAssets.length > 0 && (

                    <div className="scanner-table-wrapper">

                        <table className="scanner-table">

                            <thead>

                                <tr>

                                    <th>
                                        #
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "symbol"
                                            )
                                        }
                                    >
                                        Symbol{" "}
                                        {
                                            getSortIcon(
                                                "symbol"
                                            )
                                        }
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "price"
                                            )
                                        }
                                    >
                                        Price{" "}
                                        {
                                            getSortIcon(
                                                "price"
                                            )
                                        }
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "score"
                                            )
                                        }
                                    >
                                        AI Score{" "}
                                        {
                                            getSortIcon(
                                                "score"
                                            )
                                        }
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "signal"
                                            )
                                        }
                                    >
                                        Signal{" "}
                                        {
                                            getSortIcon(
                                                "signal"
                                            )
                                        }
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "opportunity_score"
                                            )
                                        }
                                    >
                                        Opportunity{" "}
                                        {
                                            getSortIcon(
                                                "opportunity_score"
                                            )
                                        }
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "trend"
                                            )
                                        }
                                    >
                                        Trend{" "}
                                        {
                                            getSortIcon(
                                                "trend"
                                            )
                                        }
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "rsi"
                                            )
                                        }
                                    >
                                        RSI{" "}
                                        {
                                            getSortIcon(
                                                "rsi"
                                            )
                                        }
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "macd"
                                            )
                                        }
                                    >
                                        MACD{" "}
                                        {
                                            getSortIcon(
                                                "macd"
                                            )
                                        }
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "adx"
                                            )
                                        }
                                    >
                                        ADX{" "}
                                        {
                                            getSortIcon(
                                                "adx"
                                            )
                                        }
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "ema20"
                                            )
                                        }
                                    >
                                        EMA20{" "}
                                        {
                                            getSortIcon(
                                                "ema20"
                                            )
                                        }
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "sma50"
                                            )
                                        }
                                    >
                                        SMA50{" "}
                                        {
                                            getSortIcon(
                                                "sma50"
                                            )
                                        }
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "risk"
                                            )
                                        }
                                    >
                                        Risk{" "}
                                        {
                                            getSortIcon(
                                                "risk"
                                            )
                                        }
                                    </th>


                                    <th>
                                        Recommendation
                                    </th>


                                </tr>

                            </thead>


                            <tbody>

                                {
                                    filteredAssets.map(
                                        (
                                            asset,
                                            index
                                        ) => (

                                            <tr
                                                key={
                                                    asset.symbol
                                                }
                                                className="scanner-row-clickable"
                                                onClick={() =>
                                                    openAsset(
                                                        asset.symbol
                                                    )
                                                }
                                                title={
                                                    `Abrir análisis de ${asset.symbol}`
                                                }
                                            >


                                                <td>
                                                    {index + 1}
                                                </td>


                                                <td>

                                                    <strong
                                                        className="scanner-symbol"
                                                    >
                                                        {
                                                            asset.symbol
                                                        }
                                                    </strong>

                                                </td>


                                                <td>
                                                    $
                                                    {
                                                        formatNumber(
                                                            asset.price
                                                        )
                                                    }
                                                </td>


                                                <td>

                                                    <div className="scanner-score">

                                                        <span
                                                            className={
                                                                getScoreClass(
                                                                    asset.score
                                                                )
                                                            }
                                                        >
                                                            {
                                                                asset.score
                                                            }
                                                        </span>


                                                        <div className="score-bar">

                                                            <div
                                                                className={
                                                                    `score-fill ${
                                                                        getScoreClass(
                                                                            asset.score
                                                                        )
                                                                    }`
                                                                }
                                                                style={{
                                                                    width:
                                                                        `${Math.max(
                                                                            0,
                                                                            Math.min(
                                                                                100,
                                                                                Number(
                                                                                    asset.score
                                                                                ) || 0
                                                                            )
                                                                        )}%`,
                                                                }}
                                                            />

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `signal-badge ${
                                                                getSignalClass(
                                                                    asset.signal
                                                                )
                                                            }`
                                                        }
                                                    >
                                                        {
                                                            asset.signal
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="scanner-score">

                                                        <span
                                                            className={
                                                                getScoreClass(
                                                                    asset.opportunity_score
                                                                )
                                                            }
                                                        >
                                                            {
                                                                asset.opportunity_score
                                                            }
                                                        </span>


                                                        <div className="score-bar">

                                                            <div
                                                                className={
                                                                    `score-fill ${
                                                                        getScoreClass(
                                                                            asset.opportunity_score
                                                                        )
                                                                    }`
                                                                }
                                                                style={{
                                                                    width:
                                                                        `${Math.max(
                                                                            0,
                                                                            Math.min(
                                                                                100,
                                                                                Number(
                                                                                    asset.opportunity_score
                                                                                ) || 0
                                                                            )
                                                                        )}%`,
                                                                }}
                                                            />

                                                        </div>

                                                    </div>


                                                    <small className="opportunity-label">
                                                        {
                                                            asset.opportunity_label
                                                        }
                                                    </small>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `trend-badge ${
                                                                getTrendClass(
                                                                    asset.trend
                                                                )
                                                            }`
                                                        }
                                                    >
                                                        {
                                                            asset.trend
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            getIndicatorClass(
                                                                asset.rsi,
                                                                "rsi"
                                                            )
                                                        }
                                                    >
                                                        {
                                                            formatNumber(
                                                                asset.rsi
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            getIndicatorClass(
                                                                asset.macd,
                                                                "macd"
                                                            )
                                                        }
                                                    >
                                                        {
                                                            formatNumber(
                                                                asset.macd,
                                                                4
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            getIndicatorClass(
                                                                asset.adx,
                                                                "adx"
                                                            )
                                                        }
                                                    >
                                                        {
                                                            formatNumber(
                                                                asset.adx
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                <td>
                                                    {
                                                        formatNumber(
                                                            asset.ema20
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        formatNumber(
                                                            asset.sma50
                                                        )
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `risk-badge ${
                                                                getRiskClass(
                                                                    asset.risk
                                                                )
                                                            }`
                                                        }
                                                    >
                                                        {
                                                            asset.risk
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="recommendation">
                                                        {
                                                            asset.recommendation
                                                        }
                                                    </span>

                                                </td>


                                            </tr>

                                        )
                                    )
                                }

                            </tbody>

                        </table>

                    </div>

                )}


        </main>

    );

}