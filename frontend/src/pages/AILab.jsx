import {
    useEffect,
    useState,
} from "react";

import {
    getAIAnalysis,
} from "../api/api";

import {
    useMarketContext,
} from "../context/MarketContext";


export default function AILab() {

    const { symbol } = useMarketContext();

    const [analysis, setAnalysis] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    async function loadAnalysis() {

        setLoading(true);
        setError("");

        try {

            const data =
                await getAIAnalysis(symbol);

            setAnalysis(data);

        } catch (err) {

            console.error(
                "AI Lab error:",
                err
            );

            setError(
                err.message ||
                "No se pudo cargar el análisis IA."
            );

        } finally {

            setLoading(false);
        }
    }


    useEffect(() => {

        if (symbol) {
            loadAnalysis();
        }

    }, [symbol]);


    return (

        <main className="page">

            <div className="mb-8">

                <h1 className="text-3xl font-bold text-white">
                    AI Lab
                </h1>

                <p className="mt-2 text-slate-400">
                    Análisis inteligente del mercado
                </p>

            </div>


            <div className="mb-6 flex items-center justify-between">

                <div>

                    <span className="text-sm text-slate-400">
                        Activo seleccionado
                    </span>

                    <h2 className="text-2xl font-bold text-white">
                        {symbol}
                    </h2>

                </div>


                <button
                    type="button"
                    onClick={loadAnalysis}
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >

                    {loading
                        ? "Analizando..."
                        : "Actualizar análisis"
                    }

                </button>

            </div>


            {error && (

                <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-300">
                    {error}
                </div>

            )}


            {loading && !analysis && (

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                    La IA está analizando {symbol}...
                </div>

            )}


            {!loading && analysis && (

                <div className="space-y-6">

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

                            <p className="text-sm text-slate-400">
                                Símbolo
                            </p>

                            <p className="mt-2 text-2xl font-bold text-white">
                                {analysis.symbol || symbol}
                            </p>

                        </div>


                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

                            <p className="text-sm text-slate-400">
                                Tendencia
                            </p>

                            <p className="mt-2 text-2xl font-bold text-white">
                                {analysis.trend || "N/A"}
                            </p>

                        </div>


                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

                            <p className="text-sm text-slate-400">
                                Score IA
                            </p>

                            <p className="mt-2 text-2xl font-bold text-white">
                                {analysis.score ?? "N/A"}
                            </p>

                        </div>


                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

                            <p className="text-sm text-slate-400">
                                Riesgo
                            </p>

                            <p className="mt-2 text-2xl font-bold text-white">
                                {analysis.risk || "N/A"}
                            </p>

                        </div>

                    </div>


                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                        <h2 className="mb-4 text-xl font-bold text-white">
                            Análisis IA
                        </h2>


                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                            <div>

                                <p className="text-sm text-slate-400">
                                    Señal
                                </p>

                                <p className="mt-1 text-lg font-semibold text-white">
                                    {analysis.signal || "N/A"}
                                </p>

                            </div>


                            <div>

                                <p className="text-sm text-slate-400">
                                    Recomendación
                                </p>

                                <p className="mt-1 text-lg font-semibold text-white">
                                    {analysis.recommendation || "N/A"}
                                </p>

                            </div>


                            <div>

                                <p className="text-sm text-slate-400">
                                    Confianza
                                </p>

                                <p className="mt-1 text-lg font-semibold text-white">
                                    {analysis.confidence || "N/A"}
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                        <h2 className="mb-4 text-xl font-bold text-white">
                            Informe
                        </h2>

                        <div className="whitespace-pre-wrap leading-7 text-slate-300">

                            {analysis.analysis ||
                                analysis.summary ||
                                "No hay análisis disponible."}

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}