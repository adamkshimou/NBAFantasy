from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # "anthropic", or "openai" for any OpenAI-compatible API
    # (Gemini, Groq, OpenRouter, a local Ollama server, ...)
    ai_provider: str = "anthropic"
    ai_model: str = "claude-sonnet-5-5"
    anthropic_api_key: str = ""
    ai_base_url: str = ""
    ai_api_key: str = ""
    database_url: str = ""
    sleeper_base_url: str = "https://api.sleeper.app/v1"
    sport: str = "nba"


settings = Settings()
