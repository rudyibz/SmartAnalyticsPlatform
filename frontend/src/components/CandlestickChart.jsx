import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import { getHistory } from "../services/marketService";

export default function CandlestickChart({ symbol }) {

    const chartContainer = useRef();

    useEffect(() => {

        const chart = createChart(chartContainer.current, {
            width: chartContainer.current.clientWidth,
            height: 420,
            layout: {
                background: { color: "#1E293B" },
                textColor: "#FFFFFF",
            },
            grid: {
                vertLines: { color: "#334155" },
                horzLines: { color: "#334155" },
            },
        });

        const candleSeries = chart.addCandlestickSeries();

        getHistory(symbol).then(history => {

            const candles = history.map(c => ({
                time: c.date.substring(0, 10),
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close,
            }));

            candleSeries.setData(candles);

        });

        const resize = () => {
            chart.applyOptions({
                width: chartContainer.current.clientWidth,
            });
        };

        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
            chart.remove();
        };

    }, [symbol]);

    return (
        <div
            ref={chartContainer}
            style={{
                width: "100%",
                height: "420px",
                marginBottom: "30px",
            }}
        />
    );

}