export default function RecommendationCard({ recommendation }) {

    let color = "#F59E0B";

    if (recommendation === "BUY") color = "#22C55E";

    if (recommendation === "SELL") color = "#EF4444";

    return (

        <div
            className="recommendation-card"
            style={{
                background: color,
                transition: ".3s",
            }}
        >

            <h2>Recommendation</h2>

            <h1>{recommendation}</h1>

        </div>

    );

}