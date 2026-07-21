import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";
import CandlestickChart from "../components/CandlestickChart";
import MetricCard from "../components/MetricCard";
import ChartCard from "../components/ChartCard";
import RecommendationCard from "../components/RecommendationCard";
import Watchlist from "../components/Watchlist";

import SearchBar from "../components/SearchBar";
import { getAnalysis } from "../services/marketService";

export default function Dashboard() {

    const [symbol, setSymbol] = useState("BTC-USD");
    const [data, setData] = useState(null);

    useEffect(() => {

        getAnalysis(symbol)
            .then(setData)
            .catch(console.error);

    }, [symbol]);

    if (!data) {
        return (
            <MainLayout>
                <h2>Cargando...</h2>
            </MainLayout>
        );
    }

    return (

        <MainLayout>

            <SearchBar onSearch={setSymbol} />
            <Watchlist onSelect={setSymbol} />
            <div className="cards">

                <MetricCard
                    title="Price"
                    value={`$${data.price}`}
                />

                <MetricCard
                    title="Score"
                    value={data.score}
                />

                <MetricCard
                    title="RSI"
                    value={data.rsi14}
                />

                <MetricCard
                    title="Trend"
                    value={data.trend}
                />

            </div>

            <CandlestickChart symbol={symbol} />

            <RecommendationCard
                recommendation={data.recommendation}
            />

        </MainLayout>

    );

}