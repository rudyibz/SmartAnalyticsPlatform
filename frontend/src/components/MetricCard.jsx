export default function MetricCard({ title, value }) {

    let color = "#FFFFFF";

    if (title === "Trend") {

        color =
            value === "Bullish"
                ? "#22C55E"
                : "#EF4444";
    }

    if (title === "Score") {

        if (value >= 80) color = "#22C55E";

        else if (value >= 60) color = "#F59E0B";

        else color = "#EF4444";
    }

    return (

        <div className="metric-card">

            <h3>{title}</h3>

            <h2 style={{ color }}>

                {value}

            </h2>

        </div>

    );

}