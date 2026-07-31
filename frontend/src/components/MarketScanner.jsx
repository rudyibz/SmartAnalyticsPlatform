import useMarket from "../hooks/useMarket";
import { getScanner } from "../services/scannerService";

export default function MarketScanner() {

    const {

        data,

        loading,

    } = useMarket(getScanner, "", 30000);

    if (loading || !data)
        return <div className="card">Loading Scanner...</div>;

    function scoreColor(score) {

        if (score >= 80) return "#22c55e";
        if (score >= 60) return "#eab308";
        if (score >= 40) return "#f97316";
        return "#ef4444";

    }

    return (

        <div className="card">

            <h2>AI Market Scanner</h2>

            <table style={{ width: "100%" }}>

                <thead>

                    <tr>

                        <th>Symbol</th>
                        <th>Price</th>
                        <th>Score</th>
                        <th>Signal</th>
                        <th>Trend</th>

                    </tr>

                </thead>

                <tbody>

                    {data.map(asset => (

                        <tr key={asset.symbol}>

                            <td>{asset.symbol}</td>

                            <td>${asset.price}</td>

                            <td
                                style={{
                                    color: scoreColor(asset.score),
                                    fontWeight: "bold",
                                }}
                            >
                                {asset.score}
                            </td>

                            <td>{asset.signal}</td>

                            <td>{asset.trend}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}