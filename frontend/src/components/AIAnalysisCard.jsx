import { useEffect, useState } from "react";
import { getAIAnalysis } from "../services/marketService";

export default function AIAnalysisCard({ symbol }) {

    const [analysis, setAnalysis] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        setLoading(true);

        getAIAnalysis(symbol)
            .then((data) => {
                setAnalysis(data.analysis);
            })
            .catch(() => {
                setAnalysis("No se pudo obtener el análisis.");
            })
            .finally(() => {
                setLoading(false);
            });

    }, [symbol]);

    return (
        <div className="recommendation-card">

            <h2>🤖 AI Analysis</h2>

            {loading ? (
                <p>Analizando mercado...</p>
            ) : (
                <p style={{ whiteSpace: "pre-line" }}>
                    {analysis}
                </p>
            )}

        </div>
    );
}