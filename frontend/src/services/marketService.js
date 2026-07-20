import api from "../api/api";

export async function getAnalysis(symbol = "BTC-USD") {
    const response = await api.get(`/market/analyze/${symbol}`);
    return response.data;
}
