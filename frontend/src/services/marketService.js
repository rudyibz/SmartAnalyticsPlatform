const API = "http://127.0.0.1:8001/api/v1";

export async function getPrice(symbol) {
    const res = await fetch(`${API}/market/price/${symbol}`);
    return await res.json();
}

export async function getHistory(symbol) {
    const res = await fetch(`${API}/market/history/${symbol}`);
    return await res.json();
}

export async function getIndicators(symbol) {
    const res = await fetch(`${API}/market/indicators/${symbol}`);
    return await res.json();
}

export async function analyze(symbol) {
    const res = await fetch(`${API}/market/analyze/${symbol}`);
    return await res.json();
}

export async function getScore(symbol) {
    const res = await fetch(`${API}/score/${symbol}`);
    return await res.json();
}

export async function getRecommendation(symbol) {
    const res = await fetch(`${API}/recommendation/${symbol}`);
    return await res.json();
}