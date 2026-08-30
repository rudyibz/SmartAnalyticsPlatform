import { useEffect, useMemo, useState } from "react";

import TopBar from "../components/layout/TopBar";
import Watchlist from "../components/watchlist/Watchlist";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardGrid from "../components/dashboard/DashboardGrid";
import KPICards from "../components/dashboard/KPICards";
import MarketOverview from "../components/dashboard/MarketOverview";
import TradingChart from "../components/charts/TradingChart";
import AIAnalysis from "../components/ai/AIAnalysis";
import PortfolioDashboard from "../components/portfolio/PortfolioDashboard";

import { useMarketContext } from "../context/MarketContext";

import {
    getPrice,
    getHistory,
    getIndicators,
    analyze,
    getScore,
    getRecommendation,
    getPortfolio,
    getWatchlist,
    getScanner,
} from "../services/api";

export default function Dashboard() {
    const {
        symbol,
        marketData,
        wsConnected,
    } = useMarketContext();

    const currentSymbol = symbol || "AAPL";

    const [price, setPrice] = useState(null);
    const [history, setHistory] = useState([]);
    const [indicators, setIndicators] = useState(null);
    const [marketAnalysis, setMarketAnalysis] = useState(null);
    const [score, setScore] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [scanner, setScanner] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // CARGAR DATOS DEL DASHBOARD
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        async function loadDashboard() {
            setLoading(true);
            setError("");

            try {
                const results = await Promise.allSettled([
                    getPrice(currentSymbol),
                    getHistory(currentSymbol),
                    getIndicators(currentSymbol),
                    analyze(currentSymbol),
                    getScore(currentSymbol),
                    getRecommendation(currentSymbol),
                    getPortfolio(),
                    getWatchlist(),
                    getScanner(),
                ]);

                if (cancelled) {
                    return;
                }

                const [
                    priceResult,
                    historyResult,
                    indicatorsResult,
                    analysisResult,
                    scoreResult,
                    recommendationResult,
                    portfolioResult,
                    watchlistResult,
                    scannerResult,
                ] = results;

                if (
                    priceResult.status === "fulfilled"
                ) {
                    setPrice(priceResult.value);
                }

                if (
                    historyResult.status === "fulfilled"
                ) {
                    setHistory(
                        Array.isArray(
                            historyResult.value
                        )
                            ? historyResult.value
                            : []
                    );
                }

                if (
                    indicatorsResult.status === "fulfilled"
                ) {
                    setIndicators(
                        indicatorsResult.value
                    );
                }

                if (
                    analysisResult.status === "fulfilled"
                ) {
                    setMarketAnalysis(
                        analysisResult.value
                    );
                }

                if (
                    scoreResult.status === "fulfilled"
                ) {
                    setScore(
                        scoreResult.value
                    );
                }

                if (
                    recommendationResult.status === "fulfilled"
                ) {
                    setRecommendation(
                        recommendationResult.value
                    );
                }

                if (
                    portfolioResult.status === "fulfilled"
                ) {
                    setPortfolio(
                        Array.isArray(
                            portfolioResult.value
                        )
                            ? portfolioResult.value
                            : []
                    );
                }

                if (
                    watchlistResult.status === "fulfilled"
                ) {
                    setWatchlist(
                        Array.isArray(
                            watchlistResult.value
                        )
                            ? watchlistResult.value
                            : []
                    );
                }

                if (
                    scannerResult.status === "fulfilled"
                ) {
                    setScanner(
                        Array.isArray(
                            scannerResult.value
                        )
                            ? scannerResult.value
                            : []
                    );
                }

                const failed = results.filter(
                    (result) =>
                        result.status === "rejected"
                );

                if (failed.length > 0) {
                    console.warn(
                        "Algunas APIs del Dashboard fallaron:",
                        failed
                    );
                }
            } catch (err) {
                console.error(
                    "Error cargando Dashboard:",
                    err
                );

                if (!cancelled) {
                    setError(
                        err.message ||
                            "No se pudo cargar el Dashboard."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [currentSymbol]);

    // =========================================================
    // WEBSOCKET → PRECIO EN TIEMPO REAL
    // =========================================================

    useEffect(() => {
        if (!marketData) {
            return;
        }

        if (
            marketData.symbol &&
            marketData.symbol !== currentSymbol
        ) {
            return;
        }

        if (
            marketData.price === null ||
            marketData.price === undefined
        ) {
            return;
        }

        setPrice((previous) => {
            const previousData = previous || {};

            return {
                ...previousData,

                symbol:
                    marketData.symbol ||
                    currentSymbol,

                price:
                    marketData.price,

                currency:
                    marketData.currency ||
                    previousData.currency ||
                    "USD",
            };
        });
    }, [
        marketData,
        currentSymbol,
    ]);

    // =========================================================
    // DATOS DEL DASHBOARD
    // =========================================================

    const dashboardData = useMemo(
        () => ({
            symbol: currentSymbol,
            price,
            history,
            indicators,
            marketAnalysis,
            score,
            recommendation,
            portfolio,
            watchlist,
            scanner,
            marketData,
            wsConnected,
        }),
        [
            currentSymbol,
            price,
            history,
            indicators,
            marketAnalysis,
            score,
            recommendation,
            portfolio,
            watchlist,
            scanner,
            marketData,
            wsConnected,
        ]
    );

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="dashboard">

            <aside className="dashboard-left">
                <Watchlist
                    data={watchlist}
                />
            </aside>

            <main className="dashboard-main">

                <TopBar />

                <DashboardHeader
                    symbol={currentSymbol}
                    price={price}
                    loading={loading}
                />

                {/* WEBSOCKET STATUS */}

                <div
                    className={
                        wsConnected
                            ? "market-connection connected"
                            : "market-connection disconnected"
                    }
                >
                    <span>●</span>

                    <span>
                        {wsConnected
                            ? `Market data en tiempo real · ${currentSymbol}`
                            : "Market data desconectado"}
                    </span>
                </div>

                {/* ERROR */}

                {error && (
                    <div className="admin-error">
                        {error}
                    </div>
                )}

                {/* DASHBOARD */}

                <DashboardGrid>

                    <KPICards
                        data={dashboardData}
                        loading={loading}
                    />

                    <MarketOverview
                        data={dashboardData}
                        loading={loading}
                    />

                    <TradingChart
                        symbol={currentSymbol}
                        history={history}
                        marketData={marketData}
                        loading={loading}
                    />

                    <AIAnalysis
                        symbol={currentSymbol}
                        analysis={marketAnalysis}
                        score={score}
                        recommendation={recommendation}
                        loading={loading}
                    />

                    <PortfolioDashboard
                        portfolio={portfolio}
                        loading={loading}
                    />

                </DashboardGrid>

            </main>

        </div>
    );
}