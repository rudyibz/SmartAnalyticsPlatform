// ============================================================
// SmartAnalyticsPlatform
// frontend/src/services/alertsService.js
//
// Capa de compatibilidad para ALERTS.
// Toda la comunicación real está centralizada en:
// ../api/api.js
// ============================================================

export {
    getAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
} from "../api/api.js";