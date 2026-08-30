import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getScanner,
} from "../services/api";


export default function Scanner() {

    const [assets, setAssets] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [sortBy, setSortBy] =
        useState("score");

    const [sortDirection, setSortDirection] =
        useState("desc");


    // =========================================================
    // CARGAR SCANNER
    // =========================================================

    async function loadScanner() {

        setLoading(true);
        setError("");

        try {

            const data =
                await getScanner();

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

    const filteredAssets =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toUpperCase();

            const filtered =
                assets.filter(
                    asset =>
                        !query ||
                        asset.symbol
                            ?.toUpperCase()
                            .includes(query)
                );


            return [...filtered].sort(
                (a, b) => {

                    let valueA =
                        a[sortBy];

                    let valueB =
                        b[sortBy];


                    if (
                        typeof valueA ===
                        "string"
                    ) {

                        valueA =
                            valueA.toLowerCase();

                        valueB =
                            valueB
                                ?.toLowerCase();

                    }


                    if (
                        valueA <
                        valueB
                    ) {

                        return sortDirection ===
                            "asc"
                            ? -1
                            : 1;
                    }


                    if (
                        valueA >
                        valueB
                    ) {

                        return sortDirection ===
                            "asc"
                            ? 1
                            : -1;
                    }


                    return 0;

                }
            );

        }, [
            assets,
            search,
            sortBy,
            sortDirection,
        ]);


    // =========================================================
    // HELPERS
    // =========================================================

    function formatNumber(value) {

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
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
            );
    }


    function getSignalClass(signal) {

        const value =
            String(
                signal || ""
            ).toUpperCase();


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
            String(
                trend || ""
            ).toLowerCase();


        if (
            value.includes("bull")
        ) {

            return "bullish";

        }


        if (
            value.includes("bear")
        ) {

            return "bearish";

        }


        return "neutral";
    }


    function getRiskClass(risk) {

        const value =
            String(
                risk || ""
            ).toLowerCase();


        if (
            value.includes("high")
        ) {

            return "risk-high";

        }


        if (
            value.includes("low")
        ) {

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


    function getSortIcon(column) {

        if (sortBy !== column) {

            return "↕";

        }


        return sortDirection ===
            "asc"
            ? "↑"
            : "↓";
    }


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
            {/* TABLA */}
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
                                        {getSortIcon(
                                            "symbol"
                                        )}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "price"
                                            )
                                        }
                                    >
                                        Price{" "}
                                        {getSortIcon(
                                            "price"
                                        )}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "score"
                                            )
                                        }
                                    >
                                        Score{" "}
                                        {getSortIcon(
                                            "score"
                                        )}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "signal"
                                            )
                                        }
                                    >
                                        Signal{" "}
                                        {getSortIcon(
                                            "signal"
                                        )}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "trend"
                                            )
                                        }
                                    >
                                        Trend{" "}
                                        {getSortIcon(
                                            "trend"
                                        )}
                                    </th>


                                    <th
                                        onClick={() =>
                                            handleSort(
                                                "risk"
                                            )
                                        }
                                    >
                                        Risk{" "}
                                        {getSortIcon(
                                            "risk"
                                        )}
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
