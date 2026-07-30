import api from "../api/api";

// ===============================
// Análisis técnico
// ===============================
export async function getAnalysis(symbol = "BTC-USD") {

    const response = await api.get(
        `/market/analyze/${symbol}`
    );

    return response.data;
}

// ===============================
// Precio actual
// ===============================
export async function getPrice(symbol = "BTC-USD") {

    const response = await api.get(
        `/market/price/${symbol}`
    );

    return response.data;
}

// ===============================
// Histórico
// ===============================
export async function getHistory(
    symbol = "BTC-USD",
    period = "1mo"
) {

    const response = await api.get(
        `/market/history/${symbol}?period=${period}`
    );

    return response.data;
}

// ===============================
// Watchlist
// ===============================
export async function getWatchlist() {

    const symbols = [
        "BTC-USD",
        "ETH-USD",
        "SOL-USD",
        "AAPL",
        "TSLA",
        "NVDA",
        "MSFT",
    ];

    const results = await Promise.all(
        symbols.map(async (symbol) => {
            try {
                return await getAnalysis(symbol);
            } catch (error) {
                console.error(`Error cargando ${symbol}`, error);
                return null;
            }
        })
    );

    return results.filter(Boolean);
}

// ===============================
// IA
// ===============================
export async function getAIAnalysis(symbol = "BTC-USD") {

    const response = await api.get(
        `/ai/analysis/${symbol}`
    );

    return response.data;
}