import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useMarketContext } from "../context/MarketContext";

import {
    getScanner,
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

    function formatNumber(value, decimals = 2) {

        if (
            value === null ||
            value === undefined
        ) {
            return "N/A";
        }

        const number = Number(value);

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

        const value = Number(score);

        if (value >= 70) {
            return "score-high";
        }

        if (value <= 30) {
            return "score-low";
        }

        return "score-medium";
    }


    function getIndicatorClass(value, type) {

        const number = Number(value);

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
                Number(b.opportunity_score || 0) -
                Number(a.opportunity_score || 0)
        )[0];

    }, [assets]);


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <main className="scanner-page">

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

            {!loading && topOpportunity && (

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
                                {topOpportunity.symbol}
                            </strong>

                            <span className="top-opportunity-score">
                                {topOpportunity.opportunity_score}
                            </span>

                            <span className="top-opportunity-label">
                                {topOpportunity.opportunity_label}
                            </span>

                        </div>

                        <div className="top-opportunity-details">

                            AI Score {topOpportunity.score}
                            {" · "}
                            RSI {formatNumber(topOpportunity.rsi)}
                            {" · "}
                            ADX {formatNumber(topOpportunity.adx)}
                            {" · "}
                            MACD {formatNumber(topOpportunity.macd, 4)}

                        </div>

                    </div>

                </div>

            )}


            {/* ================================================= */}
            {/* RESUMEN DE OPORTUNIDADES */}
            {/* ================================================= */}

            {!loading && assets.length > 0 && (

                <div className="scanner-opportunity-summary">

                    <div className="scanner-summary-title">
                        MARKET OPPORTUNITIES
                    </div>

                    <div className="scanner-summary-count">
                        {assets.length} activos analizados
                    </div>

                    <div className="scanner-summary-grid">

                        <div className="summary-item excellent">
                            <span>🟢</span>
                            <strong>
                                {opportunitySummary.Excellent}
                            </strong>
                            <small>Excellent</small>
                        </div>

                        <div className="summary-item strong">
                            <span>🟢</span>
                            <strong>
                                {opportunitySummary.Strong}
                            </strong>
                            <small>Strong</small>
                        </div>

                        <div className="summary-item moderate">
                            <span>🟡</span>
                            <strong>
                                {opportunitySummary.Moderate}
                            </strong>
                            <small>Moderate</small>
                        </div>

                        <div className="summary-item weak">
                            <span>🟠</span>
                            <strong>
                                {opportunitySummary.Weak}
                            </strong>
                            <small>Weak</small>
                        </div>

                        <div className="summary-item avoid">
                            <span>🔴</span>
                            <strong>
                                {opportunitySummary.Avoid}
                            </strong>
                            <small>Avoid</small>
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
                    value={search}
                    onChange={event =>
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
                        setOpportunityFilter("all")
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
                        setOpportunityFilter("excellent")
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
                        setOpportunityFilter("strong")
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
                        setOpportunityFilter("moderate")
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
                        setOpportunityFilter("weak")
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
                        setOpportunityFilter("avoid")
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
                                            handleSort("symbol")
                                        }
                                    >
                                        Symbol{" "}
                                        {getSortIcon("symbol")}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort("price")
                                        }
                                    >
                                        Price{" "}
                                        {getSortIcon("price")}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort("score")
                                        }
                                    >
                                        AI Score{" "}
                                        {getSortIcon("score")}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort("signal")
                                        }
                                    >
                                        Signal{" "}
                                        {getSortIcon("signal")}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort("opportunity_score")
                                        }
                                    >
                                        Opportunity{" "}
                                        {getSortIcon("opportunity_score")}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort("trend")
                                        }
                                    >
                                        Trend{" "}
                                        {getSortIcon("trend")}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort("rsi")
                                        }
                                    >
                                        RSI{" "}
                                        {getSortIcon("rsi")}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort("macd")
                                        }
                                    >
                                        MACD{" "}
                                        {getSortIcon("macd")}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort("adx")
                                        }
                                    >
                                        ADX{" "}
                                        {getSortIcon("adx")}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort("ema20")
                                        }
                                    >
                                        EMA20{" "}
                                        {getSortIcon("ema20")}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort("sma50")
                                        }
                                    >
                                        SMA50{" "}
                                        {getSortIcon("sma50")}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort("risk")
                                        }
                                    >
                                        Risk{" "}
                                        {getSortIcon("risk")}
                                    </th>


                                    <th>
                                        Recommendation
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredAssets.map(
                                    (asset, index) => (

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
                                            title={`Abrir análisis de ${asset.symbol}`}
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
                                                {formatNumber(
                                                    asset.price
                                                )}
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
                                                    {formatNumber(
                                                        asset.rsi
                                                    )}
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
                                                    {formatNumber(
                                                        asset.macd,
                                                        4
                                                    )}
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
                                                    {formatNumber(
                                                        asset.adx
                                                    )}
                                                </span>

                                            </td>


                                            <td>
                                                {formatNumber(
                                                    asset.ema20
                                                )}
                                            </td>


                                            <td>
                                                {formatNumber(
                                                    asset.sma50
                                                )}
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
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

        </main>

    );

}
