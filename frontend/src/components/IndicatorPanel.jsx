import useMarket from "../hooks/useMarket";
import { getIndicators } from "../services/marketService";

export default function IndicatorPanel({ symbol }) {

    const {
        data,
        loading,
    } = useMarket(getIndicators, symbol);

    if (loading || !data)
        return <div className="card">Loading Indicators...</div>;

    const indicators = [
        ["RSI", data.RSI],
        ["MACD", data.MACD],
        ["ADX", data.ADX],
        ["EMA20", data.EMA20],
        ["SMA50", data.SMA50],
        ["ATR", data.ATR],
    ];

    return (

        <div className="card">

            <h2>Indicators</h2>

            {indicators.map(([name, value]) => (

                <div
                    key={name}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #333",
                    }}
                >

                    <strong>{name}</strong>

                    <span>
                        {typeof value === "number"
                            ? value.toFixed(2)
                            : value ?? "-"}
                    </span>

                </div>

            ))}

        </div>

    );

}