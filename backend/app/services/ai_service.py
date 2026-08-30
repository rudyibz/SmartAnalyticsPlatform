from openai import OpenAI

from app.core.config import OPENAI_API_KEY

client = OpenAI(
    api_key=OPENAI_API_KEY,
)


def analyze_with_ai(data: dict):

    prompt = f"""
Eres un analista financiero profesional.

Analiza los siguientes datos:

Símbolo: {data["symbol"]}

Precio: {data["price"]}

EMA20: {data["ema20"]}

SMA50: {data["sma50"]}

RSI14: {data["rsi14"]}

MACD: {data["macd"]}

Score: {data["score"]}

Recomendación: {data["recommendation"]}

Genera un análisis profesional de unas 150 palabras.
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "Eres un analista financiero senior.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )

    return response.choices[0].message.content