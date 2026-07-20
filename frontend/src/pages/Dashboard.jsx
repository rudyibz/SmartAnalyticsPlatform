import { useEffect, useState } from "react";
import { getAnalysis } from "../services/marketService";

function Dashboard() {

    const [data, setData] = useState(null);

    useEffect(() => {

        async function loadData() {

            try {

                const result = await getAnalysis("BTC-USD");

                setData(result);

            } catch (error) {

                console.error(error);

            }

        }

        loadData();

    }, []);

    if (!data) {

        return <h2>Cargando datos...</h2>;

    }

    return (

        <div style={{ padding: "40px" }}>

            <h1>SmartAnalyticsPlatform</h1>

            <hr />

            <h2>{data.symbol}</h2>

            <p>Precio: {data.price}</p>

            <p>Score: {data.score}</p>

            <p>Recomendación: {data.recommendation}</p>

            <p>Tendencia: {data.trend}</p>

            <p>RSI: {data.rsi14}</p>

            <p>MACD: {data.macd}</p>

        </div>

    );

}

export default Dashboard;
