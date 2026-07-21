import { useEffect, useState } from "react";

import {
    LineChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { getHistory } from "../services/marketService";

export default function ChartCard({ symbol }) {

    const [data, setData] = useState([]);

    useEffect(() => {

        getHistory(symbol)
            .then((history) => {

                const chart = history.map((candle) => ({
                    date: String(candle.date).substring(5, 10),
                    close: candle.close,
                }));

                setData(chart);

            })
            .catch(console.error);

    }, [symbol]);

    return (
        <div className="chart-card">

            <h2>{symbol}</h2>

            <ResponsiveContainer width="100%" height={280}>

                <LineChart data={data}>

                    <XAxis dataKey="date" />

                    <YAxis />

                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="close"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={false}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>
    );
}