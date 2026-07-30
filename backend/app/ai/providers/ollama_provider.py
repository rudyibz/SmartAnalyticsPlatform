from backend.app.ai.providers.base import AIProvider


class OllamaProvider(AIProvider):

    def analyze(self, prompt: str):

        return (
            "Ollama Provider todavía no conectado.\n\n"
            + prompt
        )