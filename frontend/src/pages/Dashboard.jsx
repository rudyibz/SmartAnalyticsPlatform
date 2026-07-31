import TopBar from "../components/TopBar";
import TradingChart from "../components/TradingChart";
import AIAnalysisCard from "../components/AIAnalysisCard";
import ScoreGauge from "../components/ScoreGauge";
import RecommendationCard from "../components/RecommendationCard";
import PortfolioTable from "../components/PortfolioTable";
import WatchlistTable from "../components/WatchlistTable";
import MarketScanner from "../components/MarketScanner";
import IndicatorPanel from "../components/IndicatorPanel";
import AlertsPanel from "../components/AlertsPanel";
import NewsPanel from "../components/NewsPanel";

import { useState } from "react";

export default function Dashboard() {

    const [symbol, setSymbol] = useState("AAPL");

    return (

        <div className="dashboard">

            <TopBar
                symbol={symbol}
                setSymbol={setSymbol}
            />

            <div className="dashboard-content">

                <div className="left-column">

                    <TradingChart symbol={symbol} />

                    <PortfolioTable />

                    <WatchlistTable />

                    <MarketScanner />

                </div>

                <div className="right-column">

                    <AIAnalysisCard symbol={symbol} />

                    <ScoreGauge symbol={symbol} />

                    <RecommendationCard symbol={symbol} />

                    <IndicatorPanel symbol={symbol} />

                    <AlertsPanel symbol={symbol} />

                    <NewsPanel symbol={symbol} />

                </div>

            </div>

        </div>

    );

}