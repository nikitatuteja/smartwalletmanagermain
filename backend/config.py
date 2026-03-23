import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'smartwallet-secret-key-2024')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'smartwallet-jwt-secret-2024')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///smartwallet.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    DEBUG = os.environ.get('FLASK_DEBUG', 'True') == 'True'
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]
