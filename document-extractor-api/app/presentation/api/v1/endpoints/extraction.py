"""
Document extraction endpoints using OpenAI.
"""
import asyncio
import logging
from pathlib import Path
from flask import request, jsonify, current_app

from app.presentation.api.v1 import api_v1
from app.infrastructure.ai.openai_client import OpenAIClient
from app.infrastructure.data.csv_manager import CSVDataManager
from app.domain.models.invoice import InvoiceData

logger = logging.getLogger(__name__)


@api_v1.route('/extract/<document_id>', methods=['POST'])
def extract_document_data(document_id: str):
    """Extract structured data from uploaded document."""
    try:
        # Find the uploaded file
        upload_folder = Path(current_app.config['UPLOAD_FOLDER'])
        matching_files = list(upload_folder.glob(f"{document_id}_*"))
        
        if not matching_files:
            return jsonify({
                'success': False,
                'error': 'Document not found',
                'message': f'No uploaded document found with ID: {document_id}'
            }), 404
        
        file_path = matching_files[0]
        
        # Initialize OpenAI client
        openai_client = OpenAIClient(
            api_key=current_app.config['OPENAI_API_KEY'],
            model=current_app.config.get('OPENAI_MODEL', 'gpt-4o-2024-11-20')
        )
        
        # Extract data using OpenAI
        # Note: We need to run async function in sync context
        extraction_result = asyncio.run(
            openai_client.extract_invoice_data(file_path, document_id)
        )
        
        if not extraction_result.success:
            return jsonify({
                'success': False,
                'error': 'Extraction failed',
                'message': extraction_result.error_message
            }), 500
        
        # Validate extracted data
        validation_results = asyncio.run(
            openai_client.validate_extraction(
                InvoiceData(**extraction_result.extracted_data)
            )
        )
        
        # Save to CSV if extraction is successful
        data_manager = CSVDataManager(current_app.config['CSV_OUTPUT_DIR'])
        invoice_data = InvoiceData(**extraction_result.extracted_data)
        invoice_id = data_manager.save_extracted_invoice(invoice_data)

        logger.info(f"Successfully extracted and saved invoice: {invoice_id}")

        # Debug logging - check the data before sending to frontend
        invoice_dict = invoice_data.to_dict()
        logger.info(f"Invoice dict being sent to frontend: {invoice_dict}")

        # Check for NaN values
        import json
        try:
            json.dumps(invoice_dict)
        except ValueError as e:
            logger.error(f"JSON serialization error (likely NaN values): {e}")

        return jsonify({
            'success': True,
            'data': {
                'extraction_id': extraction_result.extraction_id,
                'invoice_id': invoice_id,
                'invoice_data': invoice_dict,
                'confidence_score': extraction_result.confidence_score,
                'processing_time': extraction_result.processing_time,
                'validation_results': validation_results
            }
        })
        
    except Exception as e:
        logger.error(f"Extraction error for document {document_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Extraction failed',
            'message': str(e)
        }), 500


@api_v1.route('/extract/batch', methods=['POST'])
def extract_batch_documents():
    """Extract data from multiple documents."""
    try:
        data = request.get_json()
        
        if not data or 'document_ids' not in data:
            return jsonify({
                'success': False,
                'error': 'Invalid request',
                'message': 'document_ids array is required'
            }), 400
        
        document_ids = data['document_ids']
        results = []
        
        # Initialize clients
        openai_client = OpenAIClient(
            api_key=current_app.config['OPENAI_API_KEY']
        )
        data_manager = CSVDataManager(current_app.config['CSV_OUTPUT_DIR'])
        
        # Process each document
        for document_id in document_ids:
            try:
                # Find file
                upload_folder = Path(current_app.config['UPLOAD_FOLDER'])
                matching_files = list(upload_folder.glob(f"{document_id}_*"))
                
                if not matching_files:
                    results.append({
                        'document_id': document_id,
                        'success': False,
                        'error': 'Document not found'
                    })
                    continue
                
                file_path = matching_files[0]
                
                # Extract data
                extraction_result = asyncio.run(
                    openai_client.extract_invoice_data(file_path, document_id)
                )
                
                if extraction_result.success:
                    # Save data
                    invoice_data = InvoiceData(**extraction_result.extracted_data)
                    invoice_id = data_manager.save_extracted_invoice(invoice_data)
                    
                    results.append({
                        'document_id': document_id,
                        'success': True,
                        'invoice_id': invoice_id,
                        'confidence_score': extraction_result.confidence_score
                    })
                else:
                    results.append({
                        'document_id': document_id,
                        'success': False,
                        'error': extraction_result.error_message
                    })
                    
            except Exception as e:
                results.append({
                    'document_id': document_id,
                    'success': False,
                    'error': str(e)
                })
        
        # Summary
        successful = len([r for r in results if r['success']])
        total = len(results)
        
        return jsonify({
            'success': True,
            'data': {
                'results': results,
                'summary': {
                    'total_processed': total,
                    'successful': successful,
                    'failed': total - successful
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Batch extraction error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Batch extraction failed',
            'message': str(e)
        }), 500


@api_v1.route('/extract/status/<extraction_id>', methods=['GET'])
def get_extraction_status(extraction_id: str):
    """Get extraction status (placeholder for async processing)."""
    try:
        # This is a simple implementation
        # In production, you'd track extraction status in a database or cache
        
        return jsonify({
            'success': True,
            'data': {
                'extraction_id': extraction_id,
                'status': 'completed',
                'message': 'Extraction completed successfully'
            }
        })
        
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Status check failed',
            'message': str(e)
        }), 500