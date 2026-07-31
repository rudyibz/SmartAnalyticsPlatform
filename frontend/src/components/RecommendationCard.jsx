import { useEffect, useState } from "react";
import { getRecommendation } from "../services/marketService";

export default function RecommendationCard({ symbol }) {

    const [recommendation, setRecommendation] = useState(null);

    useEffect(() => {

        async function load() {

            const data = await getRecommendation(symbol);

            setRecommendation(data);

        }

        load();

    }, [symbol]);

    if (!recommendation) {

        return <div className="card">Loading...</div>;

    }

    return (

        <div className="card">

            <h2>Recommendation</h2>

            <h1>{recommendation.signal}</h1>

        </div>

    );

}