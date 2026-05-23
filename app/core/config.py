from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "E-Commerce API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Required fields - Pydantic will throw an error if these are missing from .env
    DATABASE_URL: str
    SECRET_KEY: str
    TOKEN_EXPIRY: int
    ALGORITHM: str = "HS256"

    # Automatically load from .env file
    model_config = SettingsConfigDict(
        env_file=".env", case_sensitive=True, extra="ignore"
    )


settings = Settings()
