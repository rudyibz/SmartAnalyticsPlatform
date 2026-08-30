from app.ai.prompts import build_prompt
from app.ai.providers.factory import ProviderFactory


class AIEngine:

    def __init__(self):

        self.provider = ProviderFactory.get(
            "openai"
        )

    def analyze(self, analysis: dict):

        prompt = build_prompt(
            analysis
        )

        return self.provider.analyze(
            prompt
        )