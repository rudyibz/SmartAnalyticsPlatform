import { useEffect, useRef, useState } from "react";

const WS_BASE_URL = "ws://127.0.0.1:8010/ws/market";

export default function useWebSocket(symbol) {

    const [price, setPrice] = useState(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const mountedRef = useRef(false);

    useEffect(() => {

        mountedRef.current = true;

        if (!symbol) {
            return;
        }

        const clearReconnectTimer = () => {

            if (reconnectTimerRef.current) {

                clearTimeout(
                    reconnectTimerRef.current
                );

                reconnectTimerRef.current = null;
            }
        };

        const closeSocket = () => {

            const socket = socketRef.current;

            socketRef.current = null;

            if (!socket) {
                return;
            }

            socket.onopen = null;
            socket.onmessage = null;
            socket.onerror = null;
            socket.onclose = null;

            if (
                socket.readyState === WebSocket.OPEN ||
                socket.readyState === WebSocket.CONNECTING
            ) {

                socket.close();
            }
        };

        const connect = () => {

            if (!mountedRef.current) {
                return;
            }

            const currentSocket =
                socketRef.current;

            if (
                currentSocket &&
                (
                    currentSocket.readyState === WebSocket.OPEN ||
                    currentSocket.readyState === WebSocket.CONNECTING
                )
            ) {
                return;
            }

            const url =
                `${WS_BASE_URL}/${encodeURIComponent(symbol)}`;

            console.log(
                `[WS] Conectando: ${url}`
            );

            setError(null);

            const ws =
                new WebSocket(url);

            socketRef.current = ws;

            // ==============================================
            // OPEN
            // ==============================================

            ws.onopen = () => {

                if (
                    !mountedRef.current ||
                    socketRef.current !== ws
                ) {
                    return;
                }

                console.log(
                    `[WS] Conectado: ${symbol}`
                );

                setConnected(true);
                setError(null);
            };

            // ==============================================
            // MESSAGE
            // ==============================================

            ws.onmessage = (event) => {

                if (
                    !mountedRef.current ||
                    socketRef.current !== ws
                ) {
                    return;
                }

                try {

                    const data =
                        JSON.parse(event.data);

                    if (
                        data &&
                        data.price != null
                    ) {

                        setPrice(data);
                    }

                } catch (err) {

                    console.error(
                        "[WS] Error procesando mensaje:",
                        err
                    );
                }
            };

            // ==============================================
            // ERROR
            // ==============================================

            ws.onerror = (event) => {

                if (
                    !mountedRef.current ||
                    socketRef.current !== ws
                ) {
                    return;
                }

                console.warn(
                    `[WS] Error: ${symbol}`,
                    event
                );

                setError(true);
                setConnected(false);
            };

            // ==============================================
            // CLOSE
            // ==============================================

            ws.onclose = () => {

                if (
                    socketRef.current === ws
                ) {

                    socketRef.current = null;
                }

                if (!mountedRef.current) {
                    return;
                }

                console.log(
                    `[WS] Desconectado: ${symbol}`
                );

                setConnected(false);
                setError(true);

                clearReconnectTimer();

                reconnectTimerRef.current =
                    setTimeout(() => {

                        if (
                            mountedRef.current
                        ) {

                            console.log(
                                `[WS] Reconectando: ${symbol}`
                            );

                            connect();
                        }

                    }, 2000);
            };
        };

        // ==============================================
        // FIRST CONNECTION
        // ==============================================

        connect();

        // ==============================================
        // CLEANUP
        // ==============================================

        return () => {

            console.log(
                `[WS] Cleanup: ${symbol}`
            );

            mountedRef.current = false;

            clearReconnectTimer();

            setConnected(false);

            closeSocket();
        };

    }, [symbol]);

    return {
        price,
        connected,
        error,
    };
}