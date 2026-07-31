const API = "http://127.0.0.1:8001/api/v1";

export async function getNews(symbol) {

    const res = await fetch(`${API}/news/${symbol}`);

    return await res.json();

}