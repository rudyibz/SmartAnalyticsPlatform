import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import Portfolio from "../pages/Portfolio";
import Watchlist from "../pages/Watchlist";
import Scanner from "../pages/Scanner";
import News from "../pages/News";
import Alerts from "../pages/Alerts";
import Settings from "../pages/Settings";
import AILab from "../pages/AILab";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    }
                />

                <Route
                    path="/portfolio"
                    element={
                        <MainLayout>
                            <Portfolio />
                        </MainLayout>
                    }
                />

                <Route
                    path="/watchlist"
                    element={
                        <MainLayout>
                            <Watchlist />
                        </MainLayout>
                    }
                />

                <Route
                    path="/scanner"
                    element={
                        <MainLayout>
                            <Scanner />
                        </MainLayout>
                    }
                />

                <Route
                    path="/news"
                    element={
                        <MainLayout>
                            <News />
                        </MainLayout>
                    }
                />

                <Route
                    path="/alerts"
                    element={
                        <MainLayout>
                            <Alerts />
                        </MainLayout>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <MainLayout>
                            <Settings />
                        </MainLayout>
                    }
                />

                <Route
                    path="/ai"
                    element={
                        <MainLayout>
                            <AILab />
                        </MainLayout>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}