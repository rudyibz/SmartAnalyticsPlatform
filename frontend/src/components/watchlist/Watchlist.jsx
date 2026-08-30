import { useEffect, useState } from "react";

import {
    getWatchlist,
    addWatchlist,
    deleteWatchlist,
    getPrice,
} from "../../services/api";

export default function Watchlist() {
    const [items, setItems] = useState([]);
    const [prices, setPrices] = useState({});
    const [symbol, setSymbol] = useState("");

    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");

    async function loadWatchlist() {
        setLoading(true);
        setError("");

        try {
            const data = await getWatchlist();

            const list = Array.isArray(data)
                ? data
                : [];

            setItems(list);

            await loadPrices(list);
        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                "No se pudo cargar la watchlist."
            );
        } finally {
            setLoading(false);
        }
    }

    async function loadPrices(list) {
        const result = {};

        await Promise.all(
            list.map(async (item) => {
                const ticker =
                    item.symbol ||
                    item.ticker;

                if (!ticker) {
                    return;
                }

                try {
                    const data =
                        await getPrice(ticker);

                    result[ticker] =
                        data?.price ??
                        data?.current_price ??
                        data?.Close ??
                        data?.close ??
                        null;
                } catch {
                    result[ticker] = null;
                }
            })
        );

        setPrices(result);
    }

    useEffect(() => {
        loadWatchlist();
    }, []);

    async function handleAdd(event) {
        event.preventDefault();

        const ticker =
            symbol.trim().toUpperCase();

        if (!ticker) {
            return;
        }

        setAdding(true);
        setError("");

        try {
            await addWatchlist(ticker);

            setSymbol("");

            await loadWatchlist();
        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                "No se pudo añadir el símbolo."
            );
        } finally {
            setAdding(false);
        }
    }

    async function handleDelete(ticker) {
        try {
            await deleteWatchlist(ticker);

            setItems((current) =>
                current.filter(
                    (item) =>
                        (item.symbol ||
                            item.ticker) !== ticker
                )
            );

            setPrices((current) => {
                const next = {
                    ...current,
                };

                delete next[ticker];

                return next;
            });
        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                "No se pudo eliminar el símbolo."
            );
        }
    }

    function selectSymbol(ticker) {
        window.dispatchEvent(
            new CustomEvent(
                "smartanalytics:symbol-change",
                {
                    detail: ticker,
                }
            )
        );
    }

    return (
        <aside className="watchlist-panel">

            <div className="watchlist-header">
                <div>
                    <h2>Watchlist</h2>

                    <span>
                        {items.length} activos
                    </span>
                </div>

                <button
                    type="button"
                    onClick={loadWatchlist}
                    disabled={loading}
                >
                    ↻
                </button>
            </div>

            <form
                className="watchlist-add"
                onSubmit={handleAdd}
            >
                <input
                    type="text"
                    value={symbol}
                    onChange={(event) =>
                        setSymbol(
                            event.target.value
                        )
                    }
                    placeholder="AAPL"
                    maxLength={20}
                    disabled={adding}
                />

                <button
                    type="submit"
                    disabled={
                        adding ||
                        !symbol.trim()
                    }
                >
                    +
                </button>
            </form>

            {error && (
                <div className="watchlist-error">
                    {error}
                </div>
            )}

            {loading ? (
                <p>Cargando...</p>
            ) : items.length === 0 ? (
                <p className="watchlist-empty">
                    No tienes activos en seguimiento.
                </p>
            ) : (
                <div className="watchlist-items">

                    {items.map((item) => {
                        const ticker =
                            (
                                item.symbol ||
                                item.ticker ||
                                ""
                            ).toUpperCase();

                        const price =
                            prices[ticker];

                        return (
                            <div
                                className="watchlist-item"
                                key={
                                    item.id ??
                                    ticker
                                }
                            >

                                <button
                                    type="button"
                                    className="watchlist-symbol"
                                    onClick={() =>
                                        selectSymbol(
                                            ticker
                                        )
                                    }
                                >
                                    <strong>
                                        {ticker}
                                    </strong>

                                    <span>
                                        {price !== null &&
                                        price !== undefined
                                            ? Number(
                                                  price
                                              ).toFixed(2)
                                            : "—"}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className="watchlist-delete"
                                    onClick={() =>
                                        handleDelete(
                                            ticker
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>
                        );
                    })}

                </div>
            )}

        </aside>
    );
}