"""
Invoice management endpoints for CRUD operations.
"""
import logging
from flask import request, jsonify, current_app

from app.presentation.api.v1 import api_v1
from app.infrastructure.data.csv_manager import CSVDataManager
from app.domain.models.invoice import InvoiceData

logger = logging.getLogger(__name__)


@api_v1.route('/invoices', methods=['GET'])
def get_all_invoices():
    """Get all invoices with pagination and filtering."""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        search = request.args.get('search', '')
        
        # Initialize data manager
        data_manager = CSVDataManager(current_app.config['CSV_OUTPUT_DIR'])
        
        # Get all invoices
        all_invoices = data_manager.get_all_invoices()

        # Debug logging
        logger.info(f"Raw invoices from data manager: {len(all_invoices)} invoices")
        if all_invoices:
            logger.info(f"Sample invoice data: {all_invoices[0]}")

        # Apply search filter
        if search:
            search_lower = search.lower()
            all_invoices = [
                invoice for invoice in all_invoices
                if (search_lower in invoice.get('customer_name', '').lower() or
                    search_lower in invoice.get('invoice_number', '').lower())
            ]
        
        # Apply pagination
        total_count = len(all_invoices)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_invoices = all_invoices[start_idx:end_idx]
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        has_next = page < total_pages
        has_prev = page > 1
        
        return jsonify({
            'success': True,
            'data': {
                'invoices': paginated_invoices,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total_count': total_count,
                    'total_pages': total_pages,
                    'has_next': has_next,
                    'has_prev': has_prev
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting invoices: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve invoices',
            'message': str(e)
        }), 500


@api_v1.route('/invoices/<invoice_id>', methods=['GET'])
def get_invoice_by_id(invoice_id: str):
    """Get a specific invoice by ID."""
    try:
        data_manager = CSVDataManager(current_app.config['CSV_OUTPUT_DIR'])
        invoice = data_manager.get_invoice_by_id(invoice_id)
        
        if not invoice:
            return jsonify({
                'success': False,
                'error': 'Invoice not found',
                'message': f'No invoice found with ID: {invoice_id}'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'invoice': invoice
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting invoice {invoice_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve invoice',
            'message': str(e)
        }), 500


@api_v1.route('/invoices/<invoice_id>', methods=['PUT'])
def update_invoice(invoice_id: str):
    """Update an existing invoice."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Invalid request',
                'message': 'JSON data is required'
            }), 400
        
        data_manager = CSVDataManager(current_app.config['CSV_OUTPUT_DIR'])
        
        # Check if invoice exists
        existing_invoice = data_manager.get_invoice_by_id(invoice_id)
        if not existing_invoice:
            return jsonify({
                'success': False,
                'error': 'Invoice not found',
                'message': f'No invoice found with ID: {invoice_id}'
            }), 404
        
        # Update the invoice
        success = data_manager.update_invoice(invoice_id, data)
        
        if success:
            # Get updated invoice
            updated_invoice = data_manager.get_invoice_by_id(invoice_id)
            
            return jsonify({
                'success': True,
                'data': {
                    'invoice': updated_invoice,
                    'message': 'Invoice updated successfully'
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Update failed',
                'message': 'Failed to update invoice'
            }), 500
            
    except Exception as e:
        logger.error(f"Error updating invoice {invoice_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update invoice',
            'message': str(e)
        }), 500


@api_v1.route('/invoices/<invoice_id>', methods=['DELETE'])
def delete_invoice(invoice_id: str):
    """Delete an invoice."""
    try:
        data_manager = CSVDataManager(current_app.config['CSV_OUTPUT_DIR'])
        
        # Check if invoice exists
        existing_invoice = data_manager.get_invoice_by_id(invoice_id)
        if not existing_invoice:
            return jsonify({
                'success': False,
                'error': 'Invoice not found',
                'message': f'No invoice found with ID: {invoice_id}'
            }), 404
        
        # Delete the invoice
        success = data_manager.delete_invoice(invoice_id)
        
        if success:
            return jsonify({
                'success': True,
                'data': {
                    'message': f'Invoice {invoice_id} deleted successfully'
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Delete failed',
                'message': 'Failed to delete invoice'
            }), 500
            
    except Exception as e:
        logger.error(f"Error deleting invoice {invoice_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to delete invoice',
            'message': str(e)
        }), 500


@api_v1.route('/invoices/statistics', methods=['GET'])
def get_invoices_statistics():
    """Get statistics about invoices."""
    try:
        data_manager = CSVDataManager(current_app.config['CSV_OUTPUT_DIR'])
        stats = data_manager.get_statistics()
        
        return jsonify({
            'success': True,
            'data': {
                'statistics': stats
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get statistics',
            'message': str(e)
        }), 500


@api_v1.route('/invoices/export', methods=['POST'])
def export_invoices():
    """Export invoices to Excel format."""
    try:
        data = request.get_json() or {}
        output_filename = data.get('filename', 'invoices_export.xlsx')
        
        data_manager = CSVDataManager(current_app.config['CSV_OUTPUT_DIR'])
        export_path = data_manager.export_to_excel()
        
        return jsonify({
            'success': True,
            'data': {
                'export_path': str(export_path),
                'filename': export_path.name,
                'message': 'Export completed successfully'
            }
        })
        
    except Exception as e:
        logger.error(f"Error exporting invoices: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Export failed',
            'message': str(e)
        }), 500


@api_v1.route('/invoices/backup', methods=['POST'])
def backup_invoices():
    """Create a backup of all invoice data."""
    try:
        data_manager = CSVDataManager(current_app.config['CSV_OUTPUT_DIR'])
        backup_path = data_manager.backup_data()
        
        return jsonify({
            'success': True,
            'data': {
                'backup_path': str(backup_path),
                'filename': backup_path.name,
                'message': 'Backup created successfully'
            }
        })
        
    except Exception as e:
        logger.error(f"Error creating backup: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Backup failed',
            'message': str(e)
        }), 500