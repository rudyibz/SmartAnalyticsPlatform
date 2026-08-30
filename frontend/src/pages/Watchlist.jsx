import { useEffect, useState } from "react";

import { useMarketContext } from "../context/MarketContext";

import {
    getWatchlist,
    addWatchlist,
    deleteWatchlist,
} from "../services/api";


export default function Watchlist() {

    const {
        symbol,
        setSymbol,
    } = useMarketContext();


    const [assets, setAssets] = useState([]);

    const [newSymbol, setNewSymbol] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [loadingList, setLoadingList] =
        useState(true);

    const [error, setError] =
        useState(null);


    // ============================================================
    // LOAD WATCHLIST
    // ============================================================

    async function loadWatchlist() {

        try {

            setLoadingList(true);
            setError(null);

            const data =
                await getWatchlist();

            setAssets(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "[WATCHLIST] Load error:",
                err
            );

            setError(
                err?.message ||
                "No se pudo cargar la watchlist."
            );

        } finally {

            setLoadingList(false);

        }
    }


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadWatchlist();

    }, []);


    // ============================================================
    // SELECT ASSET
    // ============================================================

    function selectAsset(assetSymbol) {

        const normalized =
            String(assetSymbol || "")
                .trim()
                .toUpperCase();

        if (!normalized) {
            return;
        }

        setSymbol(normalized);
    }


    // ============================================================
    // ADD ASSET
    // ============================================================

    async function addAsset() {

        const normalized =
            String(newSymbol || "")
                .trim()
                .toUpperCase();

        if (!normalized || loading) {
            return;
        }


        try {

            setLoading(true);
            setError(null);


            await addWatchlist(
                normalized
            );


            setNewSymbol("");


            await loadWatchlist();


            setSymbol(normalized);


        } catch (err) {

            console.error(
                "[WATCHLIST] Add error:",
                err
            );

            setError(
                err?.message ||
                "No se pudo añadir el activo."
            );

        } finally {

            setLoading(false);

        }
    }


    // ============================================================
    // REMOVE ASSET
    // ============================================================

    async function removeAsset(assetSymbol) {

        const normalized =
            String(assetSymbol || "")
                .trim()
                .toUpperCase();

        if (!normalized || loading) {
            return;
        }


        try {

            setLoading(true);
            setError(null);


            await deleteWatchlist(
                normalized
            );


            const remaining =
                assets.filter(
                    (asset) => {

                        const currentSymbol =
                            String(
                                asset.symbol || ""
                            )
                                .trim()
                                .toUpperCase();

                        return (
                            currentSymbol !==
                            normalized
                        );
                    }
                );


            setAssets(
                remaining
            );


            const currentSelected =
                String(symbol || "")
                    .trim()
                    .toUpperCase();


            if (
                currentSelected ===
                normalized
            ) {

                if (
                    remaining.length > 0
                ) {

                    const nextSymbol =
                        String(
                            remaining[0]
                                .symbol || ""
                        )
                            .trim()
                            .toUpperCase();


                    setSymbol(
                        nextSymbol
                    );

                } else {

                    setSymbol("");

                }
            }


        } catch (err) {

            console.error(
                "[WATCHLIST] Delete error:",
                err
            );

            setError(
                err?.message ||
                "No se pudo eliminar el activo."
            );

        } finally {

            setLoading(false);

        }
    }


    // ============================================================
    // SCORE CLASS
    // ============================================================

    function getScoreClass(
        score,
        signal
    ) {

        const normalizedSignal =
            String(signal || "")
                .trim()
                .toUpperCase();


        // La señal del backend tiene
        // prioridad sobre el score.

        if (
            normalizedSignal ===
            "BUY"
        ) {

            return "score-buy";

        }


        if (
            normalizedSignal ===
            "SELL"
        ) {

            return "score-sell";

        }


        if (
            normalizedSignal ===
            "HOLD"
        ) {

            return "score-hold";

        }


        // Fallback por score.

        const numericScore =
            Number(score);


        if (
            numericScore >= 70
        ) {

            return "score-buy";

        }


        if (
            numericScore >= 50
        ) {

            return "score-hold";

        }


        return "score-sell";
    }


    // ============================================================
    // RECOMMENDATION CLASS
    // ============================================================

    function getRecommendationClass(
        recommendation
    ) {

        const normalized =
            String(
                recommendation || ""
            )
                .trim()
                .toUpperCase();


        // BUY

        if (
            normalized.includes(
                "BUY"
            ) ||
            normalized.includes(
                "ACCUMULATE"
            ) ||
            normalized.includes(
                "ACUMULAR"
            ) ||
            normalized.includes(
                "COMPRA"
            )
        ) {

            return "recommendation-buy";

        }


        // SELL

        if (
            normalized.includes(
                "SELL"
            ) ||
            normalized.includes(
                "REDUCE"
            ) ||
            normalized.includes(
                "VENDER"
            ) ||
            normalized.includes(
                "REDUCIR"
            )
        ) {

            return "recommendation-sell";

        }


        // HOLD

        if (
            normalized.includes(
                "HOLD"
            ) ||
            normalized.includes(
                "MANTENER"
            )
        ) {

            return "recommendation-hold";

        }


        return "";
    }


    // ============================================================
    // SIGNAL CLASS
    // ============================================================

    function getSignalClass(
        signal
    ) {

        switch (
            String(signal || "")
                .trim()
                .toUpperCase()
        ) {

            case "BUY":

                return "buy";


            case "SELL":

                return "sell";


            case "HOLD":

                return "hold";


            default:

                return "";
        }
    }


    // ============================================================
    // RISK CLASS
    // ============================================================

    function getRiskClass(
        risk
    ) {

        switch (
            String(risk || "")
                .trim()
                .toUpperCase()
        ) {

            case "LOW":

                return "risk-low";


            case "MEDIUM":

                return "risk-medium";


            case "HIGH":

                return "risk-high";


            default:

                return "";
        }
    }


    // ============================================================
    // PRICE FORMAT
    // ============================================================

    function formatPrice(
        price
    ) {

        if (
            price === null ||
            price === undefined ||
            price === ""
        ) {

            return "--";
        }


        const numericPrice =
            Number(price);


        if (
            Number.isNaN(
                numericPrice
            )
        ) {

            return "--";
        }


        return numericPrice.toFixed(2);
    }


    // ============================================================
    // SCORE FORMAT
    // ============================================================

    function formatScore(
        score
    ) {

        if (
            score === null ||
            score === undefined ||
            score === ""
        ) {

            return "--";
        }


        const numericScore =
            Number(score);


        if (
            Number.isNaN(
                numericScore
            )
        ) {

            return "--";
        }


        return numericScore.toFixed(0);
    }


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div className="watchlist-page">


            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="watchlist-page-header">

                <div>

                    <h1>
                        Watchlist
                    </h1>

                    <p>
                        Seguimiento de tus activos
                    </p>

                </div>


                <div className="watchlist-counter">

                    {assets.length}{" "}

                    {
                        assets.length === 1
                            ? "activo"
                            : "activos"
                    }

                </div>

            </div>


            {/* ====================================================
                ADD ASSET
            ==================================================== */}

            <div className="watchlist-add">

                <input

                    value={newSymbol}

                    placeholder="AAPL / MSFT / GOLD"

                    maxLength={20}

                    disabled={loading}

                    onChange={(event) => {

                        setNewSymbol(
                            event.target.value
                                .toUpperCase()
                        );

                    }}

                    onKeyDown={(event) => {

                        if (
                            event.key ===
                            "Enter"
                        ) {

                            event.preventDefault();

                            addAsset();

                        }

                    }}

                />


                <button

                    type="button"

                    onClick={
                        addAsset
                    }

                    disabled={
                        loading ||
                        !newSymbol.trim()
                    }

                >

                    {
                        loading
                            ? "..."
                            : "+ Añadir"
                    }

                </button>

            </div>


            {/* ====================================================
                ERROR
            ==================================================== */}

            {
                error && (

                    <div className="watchlist-error">

                        {error}

                    </div>

                )
            }


            {/* ====================================================
                LOADING
            ==================================================== */}

            {
                loadingList ? (

                    <div className="watchlist-loading">

                        Cargando watchlist...

                    </div>

                ) : assets.length === 0 ? (

                    /* =================================================
                       EMPTY
                    ================================================= */

                    <div className="watchlist-empty">

                        <h3>
                            No tienes activos
                        </h3>

                        <p>
                            Añade un símbolo para comenzar.
                        </p>

                    </div>

                ) : (

                    /* =================================================
                       TABLE
                    ================================================= */

                    <div className="watchlist-table-wrapper">

                        <table className="watchlist-table">

                            <thead>

                                <tr>

                                    <th>
                                        Activo
                                    </th>

                                    <th>
                                        Precio
                                    </th>

                                    <th>
                                        Señal
                                    </th>

                                    <th>
                                        Score
                                    </th>

                                    <th>
                                        Recomendación
                                    </th>

                                    <th>
                                        Riesgo
                                    </th>

                                    <th>
                                        Acción
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {
                                    assets.map(
                                        (asset) => {

                                            const assetSymbol =
                                                String(
                                                    asset.symbol ||
                                                    ""
                                                )
                                                    .trim()
                                                    .toUpperCase();


                                            const selected =
                                                String(
                                                    symbol || ""
                                                )
                                                    .trim()
                                                    .toUpperCase() ===
                                                assetSymbol;


                                            const numericScore =
                                                Number(
                                                    asset.score || 0
                                                );


                                            return (

                                                <tr

                                                    key={
                                                        asset.id ||
                                                        assetSymbol
                                                    }

                                                    className={
                                                        selected
                                                            ? "watchlist-row-selected"
                                                            : ""
                                                    }

                                                >


                                                    {/* =================
                                                        SYMBOL
                                                    ================= */}

                                                    <td>

                                                        <button

                                                            type="button"

                                                            className="watchlist-symbol-button"

                                                            onClick={() =>
                                                                selectAsset(
                                                                    assetSymbol
                                                                )
                                                            }

                                                        >

                                                            {assetSymbol}

                                                        </button>

                                                    </td>


                                                    {/* =================
                                                        PRICE
                                                    ================= */}

                                                    <td>

                                                        {
                                                            formatPrice(
                                                                asset.price
                                                            )
                                                        }

                                                    </td>


                                                    {/* =================
                                                        SIGNAL
                                                    ================= */}

                                                    <td>

                                                        <span

                                                            className={
                                                                `watchlist-signal ${
                                                                    getSignalClass(
                                                                        asset.signal
                                                                    )
                                                                }`
                                                            }

                                                        >

                                                            {
                                                                asset.signal ||
                                                                "--"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* =================
                                                        SCORE
                                                    ================= */}

                                                    <td>

                                                        <span

                                                            className={
                                                                `watchlist-score ${
                                                                    getScoreClass(
                                                                        numericScore,
                                                                        asset.signal
                                                                    )
                                                                }`
                                                            }

                                                        >

                                                            {
                                                                formatScore(
                                                                    asset.score
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* =================
                                                        RECOMMENDATION
                                                    ================= */}

                                                    <td>

                                                        <span

                                                            className={
                                                                `watchlist-recommendation ${
                                                                    getRecommendationClass(
                                                                        asset.recommendation
                                                                    )
                                                                }`
                                                            }

                                                        >

                                                            {
                                                                asset.recommendation ||
                                                                "--"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* =================
                                                        RISK
                                                    ================= */}

                                                    <td>

                                                        <span

                                                            className={
                                                                `watchlist-risk ${
                                                                    getRiskClass(
                                                                        asset.risk
                                                                    )
                                                                }`
                                                            }

                                                        >

                                                            {
                                                                asset.risk ||
                                                                "--"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* =================
                                                        DELETE
                                                    ================= */}

                                                    <td>

                                                        <button

                                                            type="button"

                                                            className="watchlist-delete"

                                                            onClick={() =>
                                                                removeAsset(
                                                                    assetSymbol
                                                                )
                                                            }

                                                            disabled={
                                                                loading
                                                            }

                                                            title={
                                                                `Eliminar ${assetSymbol}`
                                                            }

                                                        >

                                                            ×

                                                        </button>

                                                    </td>


                                                </tr>

                                            );

                                        }
                                    )
                                }

                            </tbody>

                        </table>

                    </div>

                )
            }

        </div>

    );
}