from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Настройки приложения. Значения читаются из переменных окружения и файла .env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    cors_origins: list[str] = ["http://localhost:5173"]


settings = Settings()  # type: ignore[call-arg]
