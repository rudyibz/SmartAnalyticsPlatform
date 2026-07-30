from backend.app.ai.providers.openai_provider import OpenAIProvider
from backend.app.ai.providers.ollama_provider import OllamaProvider


class ProviderFactory:

    @staticmethod
    def get(name: str):

        if name.lower() == "openai":
            return OpenAIProvider()

        if name.lower() == "ollama":
            return OllamaProvider()

        raise Exception("Proveedor IA no soportado.")