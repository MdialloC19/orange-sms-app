import secrets
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    PROJECT_NAME: str = "Orange SMS API"
    VERSION: str = "0.1.0"
    
    # MongoDB configuration
    MONGODB_URL: str = ""
    MONGODB_DB_NAME: str = "orange_sms_db"
    
    # Orange API configuration
    ORANGE_CLIENT_ID: str = ""
    ORANGE_CLIENT_SECRET: str = ""
    ORANGE_AUTH_URL: str = "https://api.orange.com/oauth/v3/token"
    ORANGE_SMS_URL: str = "https://api.orange.com/smsmessaging/v1/outbound"
    ORANGE_SENDER_NAME: str = "API"  # Nom de l'expéditeur affiché
    
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
