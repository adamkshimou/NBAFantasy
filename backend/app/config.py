from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str = ""
    ai_model: str = "claude-sonnet-5-5"
    database_url: str = ""
    sleeper_base_url: str = "https://api.sleeper.app/v1"
    sport: str = "nba"


settings = Settings()
