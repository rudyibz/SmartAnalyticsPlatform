import { useEffect, useRef } from "react";
import { createChart, LineSeries } from "lightweight-charts";
import { getHistory } from "../services/marketService";

export default function TradingChart({ symbol }) {

    const chartRef = useRef(null);

    useEffect(() => {

        if (!chartRef.current) return;

        const chart = createChart(chartRef.current, {
            width: chartRef.current.clientWidth,
            height: 500,

            layout: {
                background: {
                    color: "#111827",
                },
                textColor: "#FFFFFF",
            },

            grid: {
                vertLines: {
                    color: "#1f2937",
                },
                horzLines: {
                    color: "#1f2937",
                },
            },

            rightPriceScale: {
                borderColor: "#374151",
            },

            timeScale: {
                borderColor: "#374151",
            },
        });

        const series = chart.addSeries(LineSeries);

        async function loadChart() {

            try {

                const candles = await getHistory(symbol);

                if (!candles || candles.length === 0) {
                    return;
                }

                const data = candles.map((c) => ({
                    time: c.date.substring(0, 10),
                    value: c.close,
                }));

                series.setData(data);

                chart.timeScale().fitContent();

            } catch (error) {

                console.error("Error cargando gráfico:", error);

            }

        }

        loadChart();

        const resize = () => {

            if (!chartRef.current) return;

            chart.applyOptions({
                width: chartRef.current.clientWidth,
            });

        };

        window.addEventListener("resize", resize);

        return () => {

            window.removeEventListener("resize", resize);

            chart.remove();

        };

    }, [symbol]);

    return (

        <div className="card">

            <h2>{symbol} Chart</h2>

            <div
                ref={chartRef}
                style={{
                    width: "100%",
                    height: "500px",
                }}
            />

        </div>

    );

}