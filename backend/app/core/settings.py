"""
Configuración tipada mediante Pydantic Settings.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    APP_NAME: str = "SmartAnalyticsPlatform"
    VERSION: str = "1.0.0"

    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "sqlite:///./data/smartanalytics.db"

    OPENAI_API_KEY: str = ""

    SECRET_KEY: str = ""

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    DEFAULT_SYMBOL: str = "EURUSD"
    DEFAULT_TIMEFRAME: str = "H1"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()