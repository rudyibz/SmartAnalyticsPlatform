import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getPortfolio,
    updatePortfolioPosition,
    deletePortfolioPosition,
} from "../../services/api";

import PortfolioForm from "./PortfolioForm";


// ============================================================
// SmartAnalyticsPlatform
// frontend/src/components/portfolio/PortfolioDashboard.jsx
// ============================================================

export default function PortfolioDashboard({
    portfolio: externalPortfolio = null,
    loading: externalLoading = false,
}) {

    const [
        localPortfolio,
        setLocalPortfolio,
    ] = useState({
        positions: [],
        summary: {
            invested: 0,
            market_value: 0,
            pnl: 0,
            pnl_percent: 0,
        },
    });

    const [
        localLoading,
        setLocalLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        actionLoading,
        setActionLoading,
    ] = useState(false);

    const [
        success,
        setSuccess,
    ] = useState("");

    const [
        editingId,
        setEditingId,
    ] = useState(null);

    const [
        editQuantity,
        setEditQuantity,
    ] = useState("");

    const [
        editBuyPrice,
        setEditBuyPrice,
    ] = useState("");


    // =========================================================
    // CARGAR PORTFOLIO
    // =========================================================

    async function loadPortfolio() {

        if (externalPortfolio !== null) {
            return;
        }

        setLocalLoading(true);
        setError("");

        try {

            const data =
                await getPortfolio();

            if (Array.isArray(data)) {

                setLocalPortfolio({
                    positions: data,
                    summary: {
                        invested: 0,
                        market_value: 0,
                        pnl: 0,
                        pnl_percent: 0,
                    },
                });

            } else {

                setLocalPortfolio({
                    positions:
                        Array.isArray(data?.positions)
                            ? data.positions
                            : [],

                    summary: {
                        invested:
                            Number(
                                data?.summary?.invested ?? 0
                            ),

                        market_value:
                            Number(
                                data?.summary?.market_value ?? 0
                            ),

                        pnl:
                            Number(
                                data?.summary?.pnl ?? 0
                            ),

                        pnl_percent:
                            Number(
                                data?.summary?.pnl_percent ?? 0
                            ),
                    },
                });

            }

        } catch (err) {

            console.error(
                "[PORTFOLIO] Load error:",
                err
            );

            setError(
                err?.message ||
                "No se pudo cargar el portfolio."
            );

        } finally {

            setLocalLoading(false);

        }
    }


    // =========================================================
    // EFFECT
    // =========================================================

    useEffect(() => {

        if (externalPortfolio === null) {

            loadPortfolio();

        } else {

            setLocalLoading(false);
            setError("");

        }

    }, [
        externalPortfolio,
    ]);


    // =========================================================
    // POSITION CREATED
    // =========================================================

    async function handlePositionCreated() {

        await loadPortfolio();

    }


    // =========================================================
    // EDITAR
    // =========================================================

    function startEditing(position) {

        setError("");
        setSuccess("");

        setEditingId(position.id);

        setEditQuantity(
            String(position.quantity ?? "")
        );

        setEditBuyPrice(
            String(position.buy_price ?? "")
        );
    }


    function cancelEditing() {

        setEditingId(null);

        setEditQuantity("");
        setEditBuyPrice("");

        setError("");
    }


    async function handleUpdate(position) {

        setError("");
        setSuccess("");

        const quantity =
            Number(editQuantity);

        const buyPrice =
            Number(editBuyPrice);


        if (
            !Number.isFinite(quantity) ||
            quantity <= 0
        ) {

            setError(
                "La cantidad debe ser mayor que 0."
            );

            return;
        }


        if (
            !Number.isFinite(buyPrice) ||
            buyPrice <= 0
        ) {

            setError(
                "El precio de compra debe ser mayor que 0."
            );

            return;
        }


        setActionLoading(true);


        try {

            await updatePortfolioPosition(
                position.id,
                {
                    quantity,
                    buy_price: buyPrice,
                }
            );


            setSuccess(
                `Posición ${position.symbol} actualizada correctamente.`
            );


            cancelEditing();

            await loadPortfolio();


        } catch (err) {

            console.error(
                "[PORTFOLIO] Update error:",
                err
            );

            setError(
                err?.message ||
                "No se pudo actualizar la posición."
            );

        } finally {

            setActionLoading(false);

        }
    }


    // =========================================================
    // ELIMINAR
    // =========================================================

    async function handleDelete(position) {

        const confirmed =
            window.confirm(
                `¿Seguro que quieres eliminar la posición ${position.symbol}?`
            );


        if (!confirmed) {
            return;
        }


        setError("");
        setSuccess("");

        setActionLoading(true);


        try {

            await deletePortfolioPosition(
                position.id
            );


            setSuccess(
                `Posición ${position.symbol} eliminada correctamente.`
            );


            if (
                editingId === position.id
            ) {

                cancelEditing();

            }


            await loadPortfolio();


        } catch (err) {

            console.error(
                "[PORTFOLIO] Delete error:",
                err
            );

            setError(
                err?.message ||
                "No se pudo eliminar la posición."
            );

        } finally {

            setActionLoading(false);

        }
    }


    // =========================================================
    // NORMALIZAR DATOS
    // =========================================================

    const portfolioData =
        useMemo(() => {

            if (
                externalPortfolio !== null
            ) {

                if (
                    Array.isArray(
                        externalPortfolio
                    )
                ) {

                    return {
                        positions:
                            externalPortfolio,

                        summary: {
                            invested: 0,
                            market_value: 0,
                            pnl: 0,
                            pnl_percent: 0,
                        },
                    };

                }

                return {
                    positions:
                        Array.isArray(
                            externalPortfolio?.positions
                        )
                            ? externalPortfolio.positions
                            : [],

                    summary: {
                        invested:
                            Number(
                                externalPortfolio
                                    ?.summary
                                    ?.invested ?? 0
                            ),

                        market_value:
                            Number(
                                externalPortfolio
                                    ?.summary
                                    ?.market_value ?? 0
                            ),

                        pnl:
                            Number(
                                externalPortfolio
                                    ?.summary
                                    ?.pnl ?? 0
                            ),

                        pnl_percent:
                            Number(
                                externalPortfolio
                                    ?.summary
                                    ?.pnl_percent ?? 0
                            ),
                    },
                };
            }

            return localPortfolio;

        }, [
            externalPortfolio,
            localPortfolio,
        ]);


    // =========================================================
    // DATOS
    // =========================================================

    const positions =
        portfolioData.positions || [];

    const summary =
        portfolioData.summary || {};

    const invested =
        Number(
            summary.invested ?? 0
        );

    const marketValue =
        Number(
            summary.market_value ?? 0
        );

    const profitLoss =
        Number(
            summary.pnl ?? 0
        );

    const profitLossPercent =
        Number(
            summary.pnl_percent ?? 0
        );

    const loading =
        externalPortfolio !== null
            ? externalLoading
            : localLoading;


    // =========================================================
    // FORMAT NUMBER
    // =========================================================

    function formatNumber(
        value,
        decimals = 2
    ) {

        const number =
            Number(value);

        if (
            !Number.isFinite(number)
        ) {

            return "0.00";

        }

        return number.toFixed(
            decimals
        );
    }


    // =========================================================
    // P/L CLASS
    // =========================================================

    function getProfitLossClass(
        value
    ) {

        const number =
            Number(value);

        if (number > 0) {
            return "portfolio-profit";
        }

        if (number < 0) {
            return "portfolio-loss";
        }

        return "portfolio-neutral";
    }


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <section
                className="portfolio-dashboard"
            >

                <div
                    className="portfolio-dashboard-header"
                >

                    <div>

                        <h2>
                            Portfolio
                        </h2>

                        <span>
                            Cargando...
                        </span>

                    </div>

                </div>

                <div
                    className="portfolio-loading"
                >
                    Cargando portfolio...
                </div>

            </section>

        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (

            <section
                className="portfolio-dashboard"
            >

                <div
                    className="portfolio-dashboard-header"
                >

                    <div>

                        <h2>
                            Portfolio
                        </h2>

                        <span>
                            Error
                        </span>

                    </div>

                </div>

                <div
                    className="portfolio-error"
                >
                    {error}
                </div>

            </section>

        );

    }


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <section
            className="portfolio-dashboard"
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="portfolio-dashboard-header"
            >

                <div>

                    <h2>
                        Portfolio
                    </h2>

                    <span>

                        {positions.length}{" "}

                        {
                            positions.length === 1
                                ? "posición"
                                : "posiciones"
                        }

                    </span>

                </div>

                <div>

                    <strong>

                        {formatNumber(
                            marketValue
                        )}

                    </strong>

                    <span>
                        USD
                    </span>

                </div>

            </div>


            {/* =================================================
                FORMULARIO
            ================================================= */}

            <PortfolioForm
                onCreated={
                    handlePositionCreated
                }
            />


            {/* =================================================
                MENSAJES
            ================================================= */}

            {error && (

                <div
                    className="portfolio-form-error"
                >
                    {error}
                </div>

            )}


            {success && (

                <div
                    className="portfolio-form-success"
                >
                    {success}
                </div>

            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div
                className="portfolio-summary"
            >

                <div>

                    <span>
                        Invertido
                    </span>

                    <strong>

                        {formatNumber(
                            invested
                        )} USD

                    </strong>

                </div>


                <div>

                    <span>
                        Valor de mercado
                    </span>

                    <strong>

                        {formatNumber(
                            marketValue
                        )} USD

                    </strong>

                </div>


                <div>

                    <span>
                        P/L
                    </span>

                    <strong
                        className={
                            getProfitLossClass(
                                profitLoss
                            )
                        }
                    >

                        {profitLoss >= 0
                            ? "+"
                            : ""}

                        {formatNumber(
                            profitLoss
                        )} USD

                    </strong>

                </div>


                <div>

                    <span>
                        P/L %
                    </span>

                    <strong
                        className={
                            getProfitLossClass(
                                profitLossPercent
                            )
                        }
                    >

                        {profitLossPercent >= 0
                            ? "+"
                            : ""}

                        {formatNumber(
                            profitLossPercent
                        )}%

                    </strong>

                </div>

            </div>


            {/* =================================================
                POSITIONS
            ================================================= */}

            {positions.length === 0 ? (

                <div
                    className="portfolio-empty"
                >

                    <h3>
                        Portfolio vacío
                    </h3>

                    <p>
                        No hay posiciones en tu
                        portfolio.
                    </p>

                </div>

            ) : (

                <div
                    className="portfolio-mini-table"
                >

                    <div
                        className="
                            portfolio-mini-row
                            portfolio-mini-header
                        "
                    >

                        <span>
                            Símbolo
                        </span>

                        <span>
                            Cantidad
                        </span>

                        <span>
                            Precio compra
                        </span>

                        <span>
                            Valor mercado
                        </span>

                        <span>
                            P/L
                        </span>

                        <span>
                            Acciones
                        </span>

                    </div>


                    {positions.map(
                        (
                            item,
                            index
                        ) => {

                            const ticker =
                                String(
                                    item?.symbol ??
                                    item?.ticker ??
                                    "N/A"
                                )
                                    .trim()
                                    .toUpperCase();

                            const quantity =
                                Number(
                                    item?.quantity ??
                                    item?.shares ??
                                    item?.amount ??
                                    0
                                );

                            const buyPrice =
                                Number(
                                    item?.buy_price ??
                                    item?.buyPrice ??
                                    0
                                );

                            const value =
                                Number(
                                    item?.market_value ??
                                    item?.marketValue ??
                                    item?.value ??
                                    item?.total_value ??
                                    item?.totalValue ??
                                    0
                                );

                            const positionPnl =
                                Number(
                                    item?.pnl ??
                                    item?.profit_loss ??
                                    item?.profitLoss ??
                                    item?.unrealized_pnl ??
                                    item?.unrealizedPnl ??
                                    0
                                );

                            const isEditing =
                                editingId === item?.id;


                            return (

                                <div
                                    className="
                                        portfolio-mini-row
                                    "
                                    key={
                                        item?.id ??
                                        `${ticker}-${index}`
                                    }
                                >

                                    <strong>
                                        {ticker}
                                    </strong>


                                    {isEditing ? (

                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={
                                                editQuantity
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setEditQuantity(
                                                    event.target.value
                                                )
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                        />

                                    ) : (

                                        <span>
                                            {formatNumber(
                                                quantity
                                            )}
                                        </span>

                                    )}


                                    {isEditing ? (

                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={
                                                editBuyPrice
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setEditBuyPrice(
                                                    event.target.value
                                                )
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                        />

                                    ) : (

                                        <span>
                                            {formatNumber(
                                                buyPrice
                                            )} USD
                                        </span>

                                    )}


                                    <span>
                                        {formatNumber(
                                            value
                                        )} USD
                                    </span>


                                    <span
                                        className={
                                            getProfitLossClass(
                                                positionPnl
                                            )
                                        }
                                    >

                                        {positionPnl >= 0
                                            ? "+"
                                            : ""}

                                        {formatNumber(
                                            positionPnl
                                        )} USD

                                    </span>


                                    <div
                                        className="portfolio-actions"
                                    >

                                        {isEditing ? (

                                            <>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleUpdate(
                                                            item
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading
                                                    }
                                                >

                                                    {actionLoading
                                                        ? "Guardando..."
                                                        : "💾 Guardar"}

                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={
                                                        cancelEditing
                                                    }
                                                    disabled={
                                                        actionLoading
                                                    }
                                                >

                                                    Cancelar

                                                </button>

                                            </>

                                        ) : (

                                            <>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        startEditing(
                                                            item
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading
                                                    }
                                                >

                                                    ✏️ Editar

                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            item
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading
                                                    }
                                                >

                                                    🗑️ Eliminar

                                                </button>

                                            </>

                                        )}

                                    </div>

                                </div>

                            );

                        }
                    )}

                </div>

            )}

        </section>

    );

}