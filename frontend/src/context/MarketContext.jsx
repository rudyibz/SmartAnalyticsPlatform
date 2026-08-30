import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";


const MarketContext =
    createContext(null);


export function MarketProvider({
    children,
}) {

    const [symbol, setSymbol] =
        useState(
            localStorage.getItem(
                "selected_symbol"
            ) || "AAPL"
        );


    const [marketData, setMarketData] =
        useState(null);


    const [wsConnected, setWsConnected] =
        useState(false);


    // =========================================================
    // CAMBIO DE SYMBOL
    // =========================================================

    useEffect(() => {

        function handleSymbolChange(event) {

            const nextSymbol =
                event.detail;

            if (!nextSymbol) {
                return;
            }

            const normalized =
                String(nextSymbol)
                    .trim()
                    .toUpperCase();

            setSymbol(normalized);

            localStorage.setItem(
                "selected_symbol",
                normalized
            );

        }


        window.addEventListener(
            "smartanalytics:symbol-change",
            handleSymbolChange
        );


        return () => {

            window.removeEventListener(
                "smartanalytics:symbol-change",
                handleSymbolChange
            );

        };

    }, []);


    // =========================================================
    // WEBSOCKET REAL-TIME
    // =========================================================

    useEffect(() => {

        if (!symbol) {
            return;
        }


        let socket = null;

        let reconnectTimer = null;

        let manuallyClosed = false;


        function connect() {

            const normalizedSymbol =
                String(symbol)
                    .trim()
                    .toUpperCase();


            const wsUrl =
                `ws://127.0.0.1:8010/ws/market/${encodeURIComponent(
                    normalizedSymbol
                )}`;


            console.log(
                `[WS] Conectando: ${wsUrl}`
            );


            socket =
                new WebSocket(wsUrl);


            socket.onopen = () => {

                console.log(
                    `[WS] CONECTADO: ${normalizedSymbol}`
                );

                setWsConnected(true);

            };


            socket.onmessage = (event) => {

                try {

                    const data =
                        JSON.parse(
                            event.data
                        );


                    console.log(
                        "[WS] Datos:",
                        data
                    );


                    setMarketData(data);

                } catch (error) {

                    console.error(
                        "[WS] Error procesando datos:",
                        error
                    );

                }

            };


            socket.onerror = (error) => {

                console.error(
                    `[WS] ERROR: ${normalizedSymbol}`,
                    error
                );

            };


            socket.onclose = (event) => {

                console.log(
                    `[WS] CERRADO: ${normalizedSymbol}`,
                    event.code,
                    event.reason
                );


                setWsConnected(false);


                if (!manuallyClosed) {

                    reconnectTimer =
                        setTimeout(
                            connect,
                            3000
                        );

                }

            };

        }


        connect();


        return () => {

            manuallyClosed = true;


            if (reconnectTimer) {

                clearTimeout(
                    reconnectTimer
                );

            }


            if (
                socket &&
                (
                    socket.readyState ===
                    WebSocket.OPEN ||
                    socket.readyState ===
                    WebSocket.CONNECTING
                )
            ) {

                socket.close();

            }

        };

    }, [symbol]);


    // =========================================================
    // CAMBIAR SYMBOL
    // =========================================================

    function changeSymbol(nextSymbol) {

        if (!nextSymbol) {
            return;
        }


        const normalized =
            String(nextSymbol)
                .trim()
                .toUpperCase();


        setSymbol(normalized);

        setMarketData(null);


        localStorage.setItem(
            "selected_symbol",
            normalized
        );


        window.dispatchEvent(
            new CustomEvent(
                "smartanalytics:symbol-change",
                {
                    detail: normalized,
                }
            )
        );

    }


    // =========================================================
    // CONTEXT
    // =========================================================

    return (

        <MarketContext.Provider
            value={{
                symbol,

                setSymbol:
                    changeSymbol,

                marketData,

                wsConnected,
            }}
        >

            {children}

        </MarketContext.Provider>

    );

}


// =============================================================
// HOOK
// =============================================================

export function useMarketContext() {

    const context =
        useContext(
            MarketContext
        );


    if (!context) {

        throw new Error(
            "useMarketContext debe utilizarse dentro de MarketProvider."
        );

    }


    return context;

}
