import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import MetricCard from "../components/MetricCard";
import ChartCard from "../components/ChartCard";
import RecommendationCard from "../components/RecommendationCard";
import Watchlist from "../components/Watchlist";
import AIAnalysisCard from "../components/AIAnalysisCard";
import SearchBar from "../components/SearchBar";

import { getAnalysis } from "../services/marketService";

export default function Dashboard() {

    const [symbol, setSymbol] = useState("BTC-USD");
    const [data, setData] = useState(null);

    useEffect(() => {

        async function loadMarket() {

            try {

                const result = await getAnalysis(symbol);

                setData(result);

            } catch (error) {

                console.error(error);

            }

        }

        loadMarket();

    }, [symbol]);

    if (!data) {

        return (

            <MainLayout>

                <div
    style={{
        padding: "40px",
        textAlign: "center",
        fontSize: "22px",
    }}
>
    📈 Cargando datos del mercado...
</div>

            </MainLayout>

        );

    }

    return (

        <MainLayout>

            <SearchBar
                onSearch={setSymbol}
            />

            <Watchlist
                onSelect={setSymbol}
            />

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
            <h2
    style={{
        marginTop: "30px",
        marginBottom: "15px",
        color: "white",
    }}
>
    📊 Price Chart
</h2>

            <ChartCard
                symbol={symbol}
            />

            <RecommendationCard
                recommendation={data.recommendation}
            />

            <AIAnalysisCard
                symbol={symbol}
            />

        </MainLayout>

    );

}