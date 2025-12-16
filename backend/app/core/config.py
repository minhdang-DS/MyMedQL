from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MyMedQL API"
    environment: str = "development"
    debug: bool = True

    db_user: str = "root"
    db_password: str = "root"
    db_host: str = "localhost"
    db_port: int = 3307
    db_name: str = "mymedql"

    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    cors_origins: List[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", env_prefix="", case_sensitive=False)

    @property
    def database_url_async(self) -> str:
        return (
            f"mysql+aiomysql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def database_url_sync(self) -> str:
        return (
            f"mysql+pymysql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()



