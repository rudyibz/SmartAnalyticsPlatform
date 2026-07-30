import TradingChart from "../charts/TradingChart";

export default function ChartCard({ symbol }) {

    return (

        <div className="chart-card">

            <TradingChart symbol={symbol} />

        </div>

    );

}