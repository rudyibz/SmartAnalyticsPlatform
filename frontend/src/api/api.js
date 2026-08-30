// ============================================================
// SmartAnalyticsPlatform
// frontend/src/api/api.js
// API CENTRAL DEL FRONTEND
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8010/api/v1";

// ============================================================
// AUTH / TOKEN
// ============================================================

function getToken() {
    return localStorage.getItem("access_token");
}

function clearSession() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user");
}


// ============================================================
// AUTHENTICATED FETCH
// ============================================================

async function authenticatedFetch(url, options = {}) {

    const token = getToken();

    const headers = {
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        url,
        {
            ...options,
            headers,
        }
    );

    if (response.status === 401) {

        clearSession();

        if (
            window.location.pathname !== "/login"
        ) {
            window.location.replace("/login");
        }

        throw new Error(
            "Sesión expirada."
        );
    }

    return response;
}


// ============================================================
// RESPONSE HANDLER
// ============================================================

async function parseResponse(
    response,
    errorPrefix
) {

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";

    let data;

    if (
        contentType.includes(
            "application/json"
        )
    ) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {

        let message =
            `${errorPrefix}: ${response.status}`;

        if (
            typeof data === "string" &&
            data.trim()
        ) {
            message += ` ${data}`;
        }

        if (
            typeof data === "object" &&
            data !== null &&
            data.detail
        ) {

            if (
                Array.isArray(
                    data.detail
                )
            ) {

                message += ` ${data.detail
                    .map(
                        (item) =>
                            item.msg ||
                            JSON.stringify(item)
                    )
                    .join(", ")}`;

            } else {

                message +=
                    ` ${data.detail}`;
            }
        }

        throw new Error(message);
    }

    return data;
}


// ============================================================
// AUTH
// ============================================================

export async function login(
    email,
    password
) {

    const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",

                Accept:
                    "application/json",
            },

            body: JSON.stringify({
                email:
                    email.trim(),

                password,
            }),
        }
    );

    const data = await parseResponse(
        response,
        "Login error"
    );

    if (!data.access_token) {

        throw new Error(
            "El servidor no devolvió un access_token."
        );
    }

    localStorage.setItem(
        "access_token",
        data.access_token
    );

    localStorage.setItem(
        "token_type",
        data.token_type || "bearer"
    );

    return data;
}


// ============================================================
// CURRENT USER
// ============================================================

export async function getCurrentUser() {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/users/me`
        );

    return parseResponse(
        response,
        "Current user error"
    );
}


// ============================================================
// USERS
// ============================================================

export async function getUsers() {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/users/`
        );

    return parseResponse(
        response,
        "Users error"
    );
}


// ============================================================
// MARKET
// ============================================================

export async function getPrice(symbol) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/market/price/${encodeURIComponent(
                symbol.toUpperCase()
            )}`
        );

    return parseResponse(
        response,
        "Price error"
    );
}


export async function getHistory(symbol) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/market/history/${encodeURIComponent(
                symbol.toUpperCase()
            )}`
        );

    return parseResponse(
        response,
        "History error"
    );
}


export async function getIndicators(symbol) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/market/indicators/${encodeURIComponent(
                symbol.toUpperCase()
            )}`
        );

    return parseResponse(
        response,
        "Indicators error"
    );
}


export async function analyze(symbol) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/market/analyze/${encodeURIComponent(
                symbol.toUpperCase()
            )}`
        );

    return parseResponse(
        response,
        "Analysis error"
    );
}


// ============================================================
// AI
// ============================================================

export async function getAIAnalysis(symbol) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/ai/analysis/${encodeURIComponent(
                symbol.toUpperCase()
            )}`
        );

    return parseResponse(
        response,
        "AI analysis error"
    );
}


export async function getScore(symbol) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/score/${encodeURIComponent(
                symbol.toUpperCase()
            )}`
        );

    return parseResponse(
        response,
        "Score error"
    );
}


export async function getRecommendation(symbol) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/recommendation/${encodeURIComponent(
                symbol.toUpperCase()
            )}`
        );

    return parseResponse(
        response,
        "Recommendation error"
    );
}


// ============================================================
// SCANNER
// ============================================================

export async function getScanner() {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/scanner`
        );

    return parseResponse(
        response,
        "Scanner error"
    );
}


// ============================================================
// WATCHLIST
// ============================================================

export async function getWatchlist() {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/watchlist/`
        );

    return parseResponse(
        response,
        "Watchlist error"
    );
}


export async function addWatchlist(symbol) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/watchlist/`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    symbol:
                        symbol.toUpperCase(),
                }),
            }
        );

    return parseResponse(
        response,
        "Add watchlist error"
    );
}


export async function deleteWatchlist(symbol) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/watchlist/${encodeURIComponent(
                symbol.toUpperCase()
            )}`,
            {
                method: "DELETE",
            }
        );

    return parseResponse(
        response,
        "Delete watchlist error"
    );
}


// ============================================================
// PORTFOLIO
// ============================================================

export async function getPortfolio() {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/portfolio`
        );

    return parseResponse(
        response,
        "Portfolio error"
    );
}


export async function createPortfolioPosition(
    data
) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/portfolio`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    symbol:
                        data.symbol.toUpperCase(),

                    quantity:
                        Number(data.quantity),

                    buy_price:
                        Number(data.buy_price),
                }),
            }
        );

    return parseResponse(
        response,
        "Create portfolio position error"
    );
}


export async function updatePortfolioPosition(
    positionId,
    data
) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/portfolio/${positionId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    quantity:
                        Number(data.quantity),

                    buy_price:
                        Number(data.buy_price),
                }),
            }
        );

    return parseResponse(
        response,
        "Update portfolio position error"
    );
}


export async function deletePortfolioPosition(
    positionId
) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/portfolio/${positionId}`,
            {
                method: "DELETE",
            }
        );

    return parseResponse(
        response,
        "Delete portfolio position error"
    );
}


// ============================================================
// ALERTS
// ============================================================

export async function getAlerts() {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/alerts`
        );

    return parseResponse(
        response,
        "Alerts error"
    );
}


export async function createAlert(
    data
) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/alerts`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    symbol:
                        String(
                            data.symbol || ""
                        ).trim().toUpperCase(),

                    indicator:
                        String(
                            data.indicator || "price"
                        ).trim().toUpperCase(),

                    operator:
                        data.operator,

                    target_value:
                        Number(
                            data.target_value
                        ),
                }),
            }
        );

    return parseResponse(
        response,
        "Create alert error"
    );
}


// ============================================================
// ALERT EVENTS / HISTORY
// ============================================================

export async function getAlertEvents() {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/alerts/events`
        );

    return parseResponse(
        response,
        "Alert events error"
    );
}
// ============================================================
// EVALUATE ALERTS
// ============================================================

export async function evaluateAlerts() {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/alerts/evaluate`
        );

    return parseResponse(
        response,
        "Evaluate alerts error"
    );
}


export async function updateAlert(
    alertId,
    data
) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/alerts/${alertId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(
                    data
                ),
            }
        );

    return parseResponse(
        response,
        "Update alert error"
    );
}


export async function deleteAlert(
    alertId
) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/alerts/${alertId}`,
            {
                method: "DELETE",
            }
        );

    return parseResponse(
        response,
        "Delete alert error"
    );
}


// ============================================================
// NEWS
// ============================================================

export async function getNews(symbol) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/news/${encodeURIComponent(
                symbol.toUpperCase()
            )}`
        );

    return parseResponse(
        response,
        "News error"
    );
}


// ============================================================
// LOGOUT
// ============================================================

export function logout() {

    clearSession();

    if (
        window.location.pathname !==
        "/login"
    ) {

        window.location.replace(
            "/login"
        );
    }
}


// ============================================================
// DEFAULT API OBJECT
// ============================================================

const api = {

    login,

    getCurrentUser,
    getUsers,

    getPrice,
    getHistory,
    getIndicators,
    analyze,

    getAIAnalysis,
    getScore,
    getRecommendation,

    getScanner,

    getWatchlist,
    addWatchlist,
    deleteWatchlist,

    getPortfolio,
    createPortfolioPosition,
    updatePortfolioPosition,
    deletePortfolioPosition,

    getAlerts,
    getAlertEvents,
    evaluateAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    
    getNews,

    logout,
};


export default api;