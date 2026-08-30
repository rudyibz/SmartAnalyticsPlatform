import { useEffect, useState } from "react";

import {
    getPortfolio,
    updatePortfolioPosition,
    deletePortfolioPosition,
} from "../../services/api";


export default function PortfolioTable() {

    const [portfolio, setPortfolio] = useState(null);

    const [editingId, setEditingId] = useState(null);

    const [editQuantity, setEditQuantity] = useState("");
    const [editBuyPrice, setEditBuyPrice] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    async function loadPortfolio() {

        try {

            const data = await getPortfolio();

            setPortfolio(data);

        } catch (err) {

            console.error(
                "[PORTFOLIO] Load error:",
                err
            );

            setError(
                err?.message ||
                "No se pudo cargar el portfolio."
            );
        }
    }


    useEffect(() => {

        loadPortfolio();

    }, []);


    function startEdit(position) {

        setError("");
        setSuccess("");

        setEditingId(position.id);

        setEditQuantity(
            String(position.quantity)
        );

        setEditBuyPrice(
            String(position.buy_price)
        );
    }


    function cancelEdit() {

        setEditingId(null);

        setEditQuantity("");
        setEditBuyPrice("");

        setError("");
    }


    async function handleUpdate(positionId) {

        setError("");
        setSuccess("");

        const quantity = Number(editQuantity);
        const buyPrice = Number(editBuyPrice);


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


        setLoading(true);


        try {

            await updatePortfolioPosition(
                positionId,
                {
                    quantity,
                    buy_price: buyPrice,
                }
            );


            setSuccess(
                "Posición actualizada correctamente."
            );


            setEditingId(null);

            setEditQuantity("");
            setEditBuyPrice("");


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

            setLoading(false);
        }
    }


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

        setLoading(true);


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

                setEditingId(null);

                setEditQuantity("");
                setEditBuyPrice("");
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

            setLoading(false);
        }
    }


    if (!portfolio) {

        return (
            <h2>
                Loading Portfolio...
            </h2>
        );
    }


    return (

        <div className="card">

            <h2>
                Portfolio
            </h2>


            {error && (

                <div className="portfolio-form-error">
                    {error}
                </div>

            )}


            {success && (

                <div className="portfolio-form-success">
                    {success}
                </div>

            )}


            <table className="scanner-table">

                <thead>

                    <tr>

                        <th>
                            Asset
                        </th>

                        <th>
                            Quantity
                        </th>

                        <th>
                            Buy Price
                        </th>

                        <th>
                            Current
                        </th>

                        <th>
                            Value
                        </th>

                        <th>
                            P/L
                        </th>

                        <th>
                            P/L %
                        </th>

                        <th>
                            Actions
                        </th>

                    </tr>

                </thead>


                <tbody>

                    {portfolio.positions.map(
                        (position) => {

                            const isEditing =
                                editingId === position.id;


                            return (

                                <tr
                                    key={position.id}
                                >

                                    <td>
                                        {position.symbol}
                                    </td>


                                    <td>

                                        {isEditing ? (

                                            <input
                                                type="number"
                                                min="0"
                                                step="any"
                                                value={
                                                    editQuantity
                                                }
                                                onChange={
                                                    (event) =>
                                                        setEditQuantity(
                                                            event.target.value
                                                        )
                                                }
                                                disabled={
                                                    loading
                                                }
                                            />

                                        ) : (

                                            position.quantity

                                        )}

                                    </td>


                                    <td>

                                        {isEditing ? (

                                            <input
                                                type="number"
                                                min="0"
                                                step="any"
                                                value={
                                                    editBuyPrice
                                                }
                                                onChange={
                                                    (event) =>
                                                        setEditBuyPrice(
                                                            event.target.value
                                                        )
                                                }
                                                disabled={
                                                    loading
                                                }
                                            />

                                        ) : (

                                            `$${position.buy_price}`

                                        )}

                                    </td>


                                    <td>
                                        ${position.current_price}
                                    </td>


                                    <td>
                                        ${position.market_value}
                                    </td>


                                    <td
                                        className={
                                            position.pnl >= 0
                                                ? "buy"
                                                : "sell"
                                        }
                                    >
                                        ${position.pnl}
                                    </td>


                                    <td
                                        className={
                                            position.pnl >= 0
                                                ? "buy"
                                                : "sell"
                                        }
                                    >
                                        {position.pnl_percent}%
                                    </td>


                                    <td>

                                        {isEditing ? (

                                            <>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleUpdate(
                                                            position.id
                                                        )
                                                    }
                                                    disabled={
                                                        loading
                                                    }
                                                >
                                                    {loading
                                                        ? "Guardando..."
                                                        : "💾 Guardar"}
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={
                                                        cancelEdit
                                                    }
                                                    disabled={
                                                        loading
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
                                                        startEdit(
                                                            position
                                                        )
                                                    }
                                                    disabled={
                                                        loading
                                                    }
                                                >
                                                    ✏️ Editar
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            position
                                                        )
                                                    }
                                                    disabled={
                                                        loading
                                                    }
                                                >
                                                    🗑️ Eliminar
                                                </button>

                                            </>

                                        )}

                                    </td>

                                </tr>

                            );

                        }
                    )}

                </tbody>

            </table>

        </div>

    );
}
