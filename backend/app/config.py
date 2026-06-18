import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # project root (DiseaseReco/)
BACKEND_DIR = Path(__file__).resolve().parent.parent  # backend/


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BACKEND_DIR}/healthcare.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "healthcare-jwt-secret-key-change-in-production")
    JWT_EXPIRY_HOURS: int = int(os.getenv("JWT_EXPIRY_HOURS", "8"))
    MODEL_DIR: Path = BASE_DIR / "models"
    DATA_DIR: Path = BASE_DIR / "data" / "processed"


settings = Settings()
