// ============================================================
// SmartAnalyticsPlatform
// frontend/src/services/api.js
//
// Capa de compatibilidad.
// Toda la comunicación real está centralizada en:
// ../api/api.js
// ============================================================

export {
    default,

    // AUTH
    login,
    logout,
    getCurrentUser,
    getUsers,

    // MARKET
    getPrice,
    getHistory,
    getIndicators,
    analyze,

    // AI
    getAIAnalysis,
    getScore,
    getRecommendation,

    // SCANNER
    getScanner,

    // WATCHLIST
    getWatchlist,
    addWatchlist,
    deleteWatchlist,

    // PORTFOLIO
    getPortfolio,
    createPortfolioPosition,
    updatePortfolioPosition,
    deletePortfolioPosition,

    // ALERTS
    getAlerts,
    createAlert,
    updateAlert,
    deleteAlert,

    // NEWS
    getNews,

} from "../api/api.js";