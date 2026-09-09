import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { MarketProvider } from "./context/MarketContext";
import { useAuth } from "./context/AuthContext";

import MainLayout from "./layouts/MainLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import TradingSetups from "./pages/TradingSetups";
import TradingPerformance from "./pages/TradingPerformance";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import News from "./pages/News";
import Alerts from "./pages/Alerts";
import AILab from "./pages/AILab";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";


function ProtectedRoute({ children }) {

    const {
        loading,
        isAuthenticated,
    } = useAuth();

    if (loading) {
        return (
            <div className="auth-loading">
                Comprobando sesión...
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
}


function AdminRoute({ children }) {

    const {
        loading,
        isAuthenticated,
        isAdmin,
    } = useAuth();

    if (loading) {
        return (
            <div className="auth-loading">
                Comprobando sesión...
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (!isAdmin) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
}


function PublicRoute({ children }) {

    const {
        loading,
        isAuthenticated,
    } = useAuth();

    if (loading) {
        return (
            <div className="auth-loading">
                Comprobando sesión...
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
}


function App() {

    return (
        <MarketProvider>

            <BrowserRouter>

                <Routes>

                    {/* ==================== PUBLIC ==================== */}

                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />


                    {/* ==================== PROTECTED ==================== */}

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Dashboard />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/scanner"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Scanner />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/trading-setups"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <TradingSetups />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/trading-performance"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <TradingPerformance />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/portfolio"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Portfolio />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/watchlist"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Watchlist />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/news"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <News />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/alerts"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Alerts />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/ai"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <AILab />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Settings />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />


                    {/* ==================== ADMIN ==================== */}

                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <MainLayout>
                                    <Admin />
                                </MainLayout>
                            </AdminRoute>
                        }
                    />


                    {/* ==================== FALLBACK ==================== */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                </Routes>

            </BrowserRouter>

        </MarketProvider>
    );
}


export default App;