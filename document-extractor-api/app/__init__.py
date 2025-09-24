"""
Flask application factory and main app initialization.
"""
from flask import Flask
from flask_cors import CORS
from pathlib import Path
import logging
import os

from app.core.config import Config
from app.presentation.api.v1 import api_v1


def create_app(config_name: str = None) -> Flask:
    """Create Flask application with configuration."""
    app = Flask(__name__)
    
    # Load configuration
    config = Config()
    app.config.from_object(config)
    
    # Initialize CORS
    CORS(app, origins=app.config.get('CORS_ORIGINS', ['http://localhost:3000']))
    
    # Setup logging
    setup_logging(app)
    
    # Create necessary directories
    create_directories(app)
    
    # Register blueprints
    app.register_blueprint(api_v1, url_prefix='/api/v1')
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'document-extractor-api'}
    
    # Root endpoint
    @app.route('/')
    def index():
        return {
            'message': 'Document Extractor API',
            'version': '1.0.0',
            'status': 'running'
        }
    
    return app


def setup_logging(app: Flask):
    """Configure application logging."""
    log_level = app.config.get('LOG_LEVEL', 'INFO')
    log_format = app.config.get('LOG_FORMAT', 
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level),
        format=log_format,
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(
                Path(app.config.get('LOG_DIR', 'logs')) / 'app.log'
            )
        ]
    )
    
    # Set specific logger levels
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('openai').setLevel(logging.INFO)


def create_directories(app: Flask):
    """Create necessary application directories."""
    directories = [
        app.config.get('UPLOAD_FOLDER', 'uploads'),
        app.config.get('DATA_DIR', 'data'),
        app.config.get('LOG_DIR', 'logs'),
        app.config.get('BACKUP_DIR', 'backups')
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)