import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { MarketProvider } from "./context/MarketContext";
import { useAuth } from "./context/AuthContext";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import News from "./pages/News";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import AILab from "./pages/AILab";
import Login from "./pages/Login";
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


export default function App() {

    return (

        <MarketProvider>

            <BrowserRouter>

                <Routes>

                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />


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
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Settings />
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
                        path="/admin"
                        element={
                            <AdminRoute>
                                <Admin />
                            </AdminRoute>
                        }
                    />


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
