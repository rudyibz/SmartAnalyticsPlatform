import { useEffect, useState } from "react";

export default function useMarket(loader, symbol, interval = 10000) {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        let timer;

        async function load() {

            try {

                setLoading(true);

                const result = await loader(symbol);

                setData(result);

                setError(null);

            } catch (err) {

                console.error(err);

                setError(err);

            } finally {

                setLoading(false);

            }

        }

        load();

        timer = setInterval(load, interval);

        return () => clearInterval(timer);

    }, [loader, symbol, interval]);

    return {

        data,
        loading,
        error,

    };

}