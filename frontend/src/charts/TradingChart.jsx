import { useEffect, useRef } from "react";

import {
    createChart,
    CandlestickSeries,
} from "lightweight-charts";

import { getHistory } from "../services/marketService";

export default function TradingChart({ symbol }) {

    const chartContainer = useRef(null);

    useEffect(() => {

        if (!chartContainer.current) return;

        const chart = createChart(chartContainer.current, {

            width: chartContainer.current.clientWidth,

            height: 500,

            layout: {
                background: {
                    color: "#111827",
                },
                textColor: "#D1D5DB",
            },

            grid: {
                vertLines: {
                    color: "#1F2937",
                },
                horzLines: {
                    color: "#1F2937",
                },
            },

            crosshair: {
    mode: 0,
},

            rightPriceScale: {
                borderColor: "#374151",
            },

            timeScale: {
                borderColor: "#374151",
                timeVisible: true,
            },

            autoSize: true,

        });

        const candleSeries = chart.addSeries(
    CandlestickSeries,
    {
        upColor: "#22c55e",
        downColor: "#ef4444",

        borderVisible: false,

        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
    }
);

        getHistory(symbol, "6mo")
            .then((history) => {

                const candles = history.map((candle) => ({

                    time: new Date(candle.date)
                        .toISOString()
                        .substring(0, 10),

                    open: candle.open,

                    high: candle.high,

                    low: candle.low,

                    close: candle.close,

                }));

                candleSeries.setData(candles);

                chart.timeScale().fitContent();

            })
            .catch(console.error);

        const resizeObserver = new ResizeObserver(() => {

            chart.applyOptions({

                width: chartContainer.current.clientWidth,

            });

        });

        resizeObserver.observe(chartContainer.current);

        return () => {

            resizeObserver.disconnect();

            chart.remove();

        };

    }, [symbol]);

    return (

        <div
            ref={chartContainer}
            style={{
                width: "100%",
                height: "500px",
            }}
        />

    );

}