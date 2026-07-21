import { useState } from "react";

export default function SearchBar({ onSearch }) {
    const [symbol, setSymbol] = useState("BTC-USD");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(symbol.toUpperCase());
    };

    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="BTC-USD, ETH-USD, AAPL..."
            />

            <button type="submit">
                Analizar
            </button>
        </form>
    );
}