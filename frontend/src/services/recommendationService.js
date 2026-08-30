import api from "../api/api";

export async function getRecommendation(
    symbol
) {
    const response =
        await api.get(
            `/recommendation/${encodeURIComponent(
                symbol
            )}`
        );

    return response.data;
}