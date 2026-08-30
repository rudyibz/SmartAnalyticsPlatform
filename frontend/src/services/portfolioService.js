// ============================================================
// SmartAnalyticsPlatform
// frontend/src/services/portfolioService.js
//
// Servicio de compatibilidad para Portfolio.
// La comunicación real está centralizada en:
// ../api/api.js
// ============================================================

import {
    getPortfolio,
    createPortfolioPosition,
    updatePortfolioPosition,
    deletePortfolioPosition,
} from "../api/api.js";


export {
    getPortfolio,
    createPortfolioPosition,
    updatePortfolioPosition,
    deletePortfolioPosition,
};