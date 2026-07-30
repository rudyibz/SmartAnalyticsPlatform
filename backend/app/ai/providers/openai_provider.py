from backend.app.ai.providers.base import AIProvider


class OpenAIProvider(AIProvider):

    def analyze(self, prompt: str):

        return (
            "OpenAI Provider todavía no conectado.\n\n"
            + prompt
        )