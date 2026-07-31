const API = "http://127.0.0.1:8001/api/v1";

export async function getScanner() {

    const res = await fetch(`${API}/scanner`);

    return await res.json();

}