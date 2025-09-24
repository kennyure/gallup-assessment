"""
Application configuration management.
"""
import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration class."""
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # OpenAI Configuration
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
    OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-4o-2024-11-20')
    OPENAI_MAX_TOKENS = int(os.environ.get('OPENAI_MAX_TOKENS', '4000'))
    OPENAI_TEMPERATURE = float(os.environ.get('OPENAI_TEMPERATURE', '0.1'))
    
    # File Upload Configuration
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', '16777216'))  # 16MB
    ALLOWED_EXTENSIONS = os.environ.get('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,pdf').split(',')
    
    # Data Storage Configuration
    DATA_FILE_PATH = os.environ.get('DATA_FILE_PATH', './data/Case Study Data.xlsx')
    DATA_DIR = os.environ.get('DATA_DIR', 'data')
    CSV_OUTPUT_DIR = os.environ.get('CSV_OUTPUT_DIR', './data')
    BACKUP_DIR = os.environ.get('BACKUP_DIR', './backups')
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FORMAT = os.environ.get('LOG_FORMAT', 
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    LOG_DIR = os.environ.get('LOG_DIR', 'logs')
    
    # CORS Configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    @property
    def database_url(self) -> str:
        """Get database URL (using CSV for simplicity)."""
        return f"csv://{self.CSV_OUTPUT_DIR}"
    
    @classmethod
    def validate_required_env_vars(cls) -> List[str]:
        """Validate that all required environment variables are set."""
        missing_vars = []
        
        if not os.environ.get('OPENAI_API_KEY'):
            missing_vars.append('OPENAI_API_KEY')
            
        return missing_vars
    
    def __init__(self):
        """Initialize configuration and validate environment variables."""
        missing_vars = self.validate_required_env_vars()
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    LOG_LEVEL = 'WARNING'


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True
    UPLOAD_FOLDER = 'test_uploads'
    DATA_DIR = 'test_data'


config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}