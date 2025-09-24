"""
File upload endpoints for document processing.
"""
import os
import uuid
import logging
from pathlib import Path
from werkzeug.utils import secure_filename
from flask import request, jsonify, current_app

from app.presentation.api.v1 import api_v1
from app.core.exceptions import InvalidFileFormatError

logger = logging.getLogger(__name__)


def allowed_file(filename: str) -> bool:
    """Check if the file extension is allowed."""
    allowed_extensions = current_app.config.get('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'pdf'])
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions


@api_v1.route('/upload', methods=['POST'])
def upload_document():
    """Upload a document for processing."""
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided',
                'message': 'Please select a file to upload'
            }), 400
        
        file = request.files['file']
        
        # Check if file was selected
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected',
                'message': 'Please select a valid file'
            }), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            allowed_types = ', '.join(current_app.config.get('ALLOWED_EXTENSIONS', []))
            return jsonify({
                'success': False,
                'error': 'Invalid file format',
                'message': f'Supported formats: {allowed_types}'
            }), 400
        
        # Generate unique document ID
        document_id = str(uuid.uuid4())
        
        # Secure filename and add unique identifier
        original_filename = secure_filename(file.filename)
        file_extension = Path(original_filename).suffix
        unique_filename = f"{document_id}_{original_filename}"
        
        # Create upload directory if it doesn't exist
        upload_folder = Path(current_app.config['UPLOAD_FOLDER'])
        upload_folder.mkdir(parents=True, exist_ok=True)
        
        # Save file
        file_path = upload_folder / unique_filename
        file.save(str(file_path))
        
        # Get file info
        file_size = file_path.stat().st_size
        
        logger.info(f"File uploaded successfully: {unique_filename} ({file_size} bytes)")
        
        return jsonify({
            'success': True,
            'data': {
                'document_id': document_id,
                'filename': original_filename,
                'file_path': str(file_path),
                'file_size': file_size,
                'message': 'File uploaded successfully'
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Upload failed',
            'message': str(e)
        }), 500


@api_v1.route('/upload/status/<document_id>', methods=['GET'])
def get_upload_status(document_id: str):
    """Get upload status for a document."""
    try:
        upload_folder = Path(current_app.config['UPLOAD_FOLDER'])
        
        # Look for files with this document ID
        matching_files = list(upload_folder.glob(f"{document_id}_*"))
        
        if not matching_files:
            return jsonify({
                'success': False,
                'error': 'Document not found',
                'message': f'No uploaded document found with ID: {document_id}'
            }), 404
        
        file_path = matching_files[0]
        file_stats = file_path.stat()
        
        return jsonify({
            'success': True,
            'data': {
                'document_id': document_id,
                'filename': file_path.name.replace(f"{document_id}_", ""),
                'file_size': file_stats.st_size,
                'upload_time': file_stats.st_ctime,
                'status': 'uploaded'
            }
        })
        
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Status check failed',
            'message': str(e)
        }), 500


@api_v1.route('/upload/validate', methods=['POST'])
def validate_file():
    """Validate file before upload without saving it."""
    try:
        if 'file' not in request.files:
            return jsonify({
                'valid': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'valid': False,
                'error': 'No file selected'
            }), 400
        
        # Check file type
        if not allowed_file(file.filename):
            allowed_types = ', '.join(current_app.config.get('ALLOWED_EXTENSIONS', []))
            return jsonify({
                'valid': False,
                'error': f'Unsupported file type. Allowed: {allowed_types}'
            }), 400
        
        # Check file size (Flask handles MAX_CONTENT_LENGTH automatically)
        # But we can add custom validation here if needed
        
        return jsonify({
            'valid': True,
            'filename': file.filename,
            'message': 'File is valid for upload'
        })
        
    except Exception as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({
            'valid': False,
            'error': str(e)
        }), 500