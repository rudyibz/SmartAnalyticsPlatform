import useMarket from "../hooks/useMarket";
import { getScore } from "../services/marketService";

export default function AIAnalysisCard({ symbol }) {

    const {
        data,
        loading,
        error,
    } = useMarket(getScore, symbol);

    if (loading)
        return <div className="card">Loading AI...</div>;

    if (error)
        return <div className="card">Error loading AI.</div>;

    if (!data)
        return <div className="card">No data.</div>;

    const signal = data.recommendation || data.signal || "HOLD";

    let color = "#f59e0b";

    if (signal.toUpperCase().includes("BUY"))
        color = "#22c55e";

    if (signal.toUpperCase().includes("SELL"))
        color = "#ef4444";

    return (

        <div className="card">

            <h2>AI Analysis</h2>

            <h1
                style={{
                    color,
                    textAlign: "center",
                }}
            >
                {signal}
            </h1>

            <table
                style={{
                    width: "100%",
                    marginTop: 20,
                }}
            >
                <tbody>

                    <tr>
                        <td>Score</td>
                        <td>{data.score}</td>
                    </tr>

                    <tr>
                        <td>Risk</td>
                        <td>{data.risk}</td>
                    </tr>

                    <tr>
                        <td>RSI</td>
                        <td>{data.RSI}</td>
                    </tr>

                    <tr>
                        <td>MACD</td>
                        <td>{data.MACD}</td>
                    </tr>

                    <tr>
                        <td>ADX</td>
                        <td>{data.ADX}</td>
                    </tr>

                </tbody>

            </table>

        </div>

    );

}