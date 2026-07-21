import api from "../api/api";

export async function getAnalysis(symbol = "BTC-USD") {
    const response = await api.get(`/market/analyze/${symbol}`);
    return response.data;
}

export async function getHistory(
    symbol = "BTC-USD",
    period = "1mo"
) {
    const response = await api.get(
        `/market/history/${symbol}?period=${period}`
    );

    return response.data;
}

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
        symbols.map(symbol => getAnalysis(symbol))
    );

    return results;
}