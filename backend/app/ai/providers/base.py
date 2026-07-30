from abc import ABC
from abc import abstractmethod


class AIProvider(ABC):

    @abstractmethod
    def analyze(self, prompt: str) -> str:
        pass