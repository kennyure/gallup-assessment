"""API v1 package initialization and blueprint creation."""
from flask import Blueprint

api_v1 = Blueprint('api_v1', __name__)

# Import endpoints to register routes
from app.presentation.api.v1.endpoints import upload, extraction, invoices