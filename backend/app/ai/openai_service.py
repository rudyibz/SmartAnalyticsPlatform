from openai import OpenAI
import os

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


def ask_ai(prompt: str):
    """
    Devuelve un análisis generado por IA.
    Si OpenAI no está disponible devuelve None.
    """

    try:

        response = client.responses.create(
            model="gpt-5.5",
            input=prompt,
        )

        return response.output_text

    except Exception as e:

        print(f"\nOpenAI Error: {e}\n")

        return None