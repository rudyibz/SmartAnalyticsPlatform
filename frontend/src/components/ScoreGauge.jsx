import useMarket from "../hooks/useMarket";
import { getScore } from "../services/marketService";

export default function ScoreGauge({ symbol }) {

    const {
        data,
        loading,
    } = useMarket(getScore, symbol);

    if (loading || !data) {
        return <div className="card">Loading Score...</div>;
    }

    const score = data.score;

    let color = "#22c55e";

    if (score < 40)
        color = "#ef4444";

    else if (score < 70)
        color = "#f59e0b";

    return (

        <div className="card">

            <h2>AI Score</h2>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 20,
                    marginBottom: 20,
                }}
            >

                <div
                    style={{
                        width: 170,
                        height: 170,
                        borderRadius: "50%",
                        border: `12px solid ${color}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 42,
                        fontWeight: "bold",
                        color,
                    }}
                >
                    {score}
                </div>

            </div>

            <h3
                style={{
                    textAlign: "center",
                    color,
                }}
            >
                {data.signal}
            </h3>

        </div>

    );

}