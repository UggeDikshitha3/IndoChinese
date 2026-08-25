import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "INDO CHINESE RESTAURANT API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "indochinese_jwt_secret_key_2026_super_secure")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))
    ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./indochinese.db")

    # Admin
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@indochinese.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://indochinese-restaurant.com",
        "https://www.indochinese-restaurant.com",
        "*"
    ]

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

    # SMTP Email
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "reservations@indochinese-restaurant.com")

    class Config:
        case_sensitive = True

settings = Settings()
