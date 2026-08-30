import { useState } from "react";
import { createPortfolioPosition } from "../../services/api";

export default function PortfolioForm({ onCreated }) {

    const [symbol, setSymbol] = useState("");
    const [quantity, setQuantity] = useState("");
    const [buyPrice, setBuyPrice] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(event) {

        event.preventDefault();

        setError("");
        setSuccess("");

        const cleanSymbol =
            symbol.trim().toUpperCase();

        const parsedQuantity =
            Number(quantity);

        const parsedBuyPrice =
            Number(buyPrice);

        if (!cleanSymbol) {
            setError("Introduce un símbolo.");
            return;
        }

        if (
            !Number.isFinite(parsedQuantity) ||
            parsedQuantity <= 0
        ) {
            setError("La cantidad debe ser mayor que 0.");
            return;
        }

        if (
            !Number.isFinite(parsedBuyPrice) ||
            parsedBuyPrice <= 0
        ) {
            setError("El precio de compra debe ser mayor que 0.");
            return;
        }

        setLoading(true);

        try {

            const position =
                await createPortfolioPosition({
                    symbol: cleanSymbol,
                    quantity: parsedQuantity,
                    buy_price: parsedBuyPrice,
                });

            console.log(
                "[PORTFOLIO] Position created:",
                position
            );

            setSymbol("");
            setQuantity("");
            setBuyPrice("");

            setSuccess(
                `Posición ${cleanSymbol} añadida correctamente.`
            );

            if (typeof onCreated === "function") {
                onCreated(position);
            }

        } catch (err) {

            console.error(
                "[PORTFOLIO] Create position error:",
                err
            );

            setError(
                err?.message ||
                "No se pudo crear la posición."
            );

        } finally {

            setLoading(false);

        }
    }

    return (

        <section className="portfolio-form">

            <div className="portfolio-form-header">

                <div>

                    <h3>
                        Añadir posición
                    </h3>

                    <span>
                        Introduce los datos de la posición.
                    </span>

                </div>

            </div>


            <form onSubmit={handleSubmit}>

                <div className="portfolio-form-grid">

                    <div className="portfolio-form-field">

                        <label htmlFor="portfolio-symbol">
                            Símbolo
                        </label>

                        <input
                            id="portfolio-symbol"
                            type="text"
                            value={symbol}
                            onChange={(event) =>
                                setSymbol(event.target.value)
                            }
                            placeholder="Ej. AAPL"
                            autoComplete="off"
                            disabled={loading}
                        />

                    </div>


                    <div className="portfolio-form-field">

                        <label htmlFor="portfolio-quantity">
                            Cantidad
                        </label>

                        <input
                            id="portfolio-quantity"
                            type="number"
                            min="0"
                            step="any"
                            value={quantity}
                            onChange={(event) =>
                                setQuantity(event.target.value)
                            }
                            placeholder="Ej. 10"
                            disabled={loading}
                        />

                    </div>


                    <div className="portfolio-form-field">

                        <label htmlFor="portfolio-buy-price">
                            Precio de compra
                        </label>

                        <input
                            id="portfolio-buy-price"
                            type="number"
                            min="0"
                            step="any"
                            value={buyPrice}
                            onChange={(event) =>
                                setBuyPrice(event.target.value)
                            }
                            placeholder="Ej. 150.50"
                            disabled={loading}
                        />

                    </div>

                </div>


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


                <div className="portfolio-form-actions">

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Guardando..."
                            : "Añadir posición"}

                    </button>

                </div>

            </form>

        </section>

    );
}
