"""
CSV data manager for simple file-based data storage.
"""
import pandas as pd
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

from app.domain.models.invoice import InvoiceData
from app.core.exceptions import DataStorageError

logger = logging.getLogger(__name__)


class CSVDataManager:
    """Simple data manager using CSV files instead of database."""
    
    def __init__(self, data_dir: str):
        """Initialize CSV data manager."""
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.invoices_csv = self.data_dir / "invoices.csv"
        self.invoice_details_csv = self.data_dir / "invoice_details.csv"
        self.original_data_file = self.data_dir / "Case Study Data.xlsx"
        
        logger.info(f"Initialized CSV data manager with data directory: {self.data_dir}")
    
    def initialize_from_excel(self, excel_file_path: Path) -> bool:
        """Initialize CSV files from original Excel file if they don't exist."""
        try:
            if self.invoices_csv.exists() and self.invoice_details_csv.exists():
                logger.info("CSV files already exist, skipping initialization")
                return True
            
            if not excel_file_path.exists():
                logger.warning(f"Excel file not found at {excel_file_path}")
                return False
            
            # Read Excel file
            logger.info(f"Reading Excel file: {excel_file_path}")
            excel_data = pd.read_excel(excel_file_path, sheet_name=None)
            
            # Process sheets
            for sheet_name, df in excel_data.items():
                if 'header' in sheet_name.lower() or 'order' in sheet_name.lower():
                    df.to_csv(self.invoices_csv, index=False)
                    logger.info(f"Exported {sheet_name} to {self.invoices_csv}")
                elif 'detail' in sheet_name.lower() or 'line' in sheet_name.lower():
                    df.to_csv(self.invoice_details_csv, index=False)
                    logger.info(f"Exported {sheet_name} to {self.invoice_details_csv}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize from Excel: {str(e)}")
            return False
    
    def load_existing_data(self) -> Dict[str, List[Dict]]:
        """Load existing invoice data from CSV files."""
        try:
            invoices = []
            details = []

            # Load invoices if file exists
            if self.invoices_csv.exists():
                invoices_df = pd.read_csv(self.invoices_csv)
                # Replace NaN values with appropriate defaults
                invoices_df = invoices_df.fillna({
                    'customer_id': '',
                    'customer_name': '',
                    'billing_street': '',
                    'billing_city': '',
                    'billing_state': '',
                    'billing_zip': '',
                    'billing_phone': '',
                    'shipping_street': '',
                    'shipping_city': '',
                    'shipping_state': '',
                    'shipping_zip': '',
                    'shipping_phone': '',
                    'salesperson': '',
                    'po_number': '',
                    'terms': '',
                    'ship_date': '',
                    'ship_via': '',
                    'fob': '',
                    'updated_at': '',
                    'subtotal': 0.0,
                    'tax_rate': 0.0,
                    'tax_amount': 0.0,
                    'total_amount': 0.0,
                    'extraction_confidence': 0.0
                })
                invoices = invoices_df.to_dict('records')
                logger.info(f"Loaded {len(invoices)} invoices from CSV")

            # Load details if file exists
            if self.invoice_details_csv.exists():
                details_df = pd.read_csv(self.invoice_details_csv)
                # Replace NaN values with appropriate defaults
                details_df = details_df.fillna({
                    'item_number': '',
                    'description': '',
                    'quantity': 0,
                    'unit_price': 0.0,
                    'line_total': 0.0,
                    'created_at': ''
                })
                details = details_df.to_dict('records')
                logger.info(f"Loaded {len(details)} invoice details from CSV")

            return {"invoices": invoices, "details": details}
            
        except Exception as e:
            logger.error(f"Failed to load existing data: {str(e)}")
            raise DataStorageError(f"Failed to load data: {str(e)}")
    
    def save_extracted_invoice(self, invoice_data: InvoiceData) -> str:
        """Save extracted invoice data to CSV files."""
        try:
            # Generate unique invoice ID if not present
            if not hasattr(invoice_data, 'id') or not invoice_data.id:
                invoice_data.id = f"INV_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
            
            # Prepare invoice header data
            header_data = invoice_data.to_csv_header()
            
            # Prepare invoice details data
            details_data = invoice_data.to_csv_details()
            
            # Append to CSV files
            header_df = pd.DataFrame([header_data])
            details_df = pd.DataFrame(details_data)
            
            # Write headers
            if not self.invoices_csv.exists():
                header_df.to_csv(self.invoices_csv, index=False)
                logger.info(f"Created new invoices CSV file: {self.invoices_csv}")
            else:
                header_df.to_csv(self.invoices_csv, mode='a', header=False, index=False)
            
            # Write details
            if not self.invoice_details_csv.exists():
                details_df.to_csv(self.invoice_details_csv, index=False)
                logger.info(f"Created new invoice details CSV file: {self.invoice_details_csv}")
            else:
                details_df.to_csv(self.invoice_details_csv, mode='a', header=False, index=False)
            
            logger.info(f"Saved invoice {invoice_data.invoice_number} with ID {invoice_data.id}")
            return invoice_data.id
            
        except Exception as e:
            logger.error(f"Failed to save invoice data: {str(e)}")
            raise DataStorageError(f"Failed to save invoice: {str(e)}")
    
    def get_all_invoices(self) -> List[Dict[str, Any]]:
        """Get all invoices with their details."""
        try:
            data = self.load_existing_data()
            
            # Merge invoices with their details
            for invoice in data["invoices"]:
                invoice_details = [
                    detail for detail in data["details"] 
                    if detail.get("invoice_id") == invoice.get("id")
                ]
                invoice["items"] = invoice_details
                
            logger.info(f"Retrieved {len(data['invoices'])} invoices with details")
            return data["invoices"]
            
        except Exception as e:
            logger.error(f"Failed to get all invoices: {str(e)}")
            raise DataStorageError(f"Failed to retrieve invoices: {str(e)}")
    
    def get_invoice_by_id(self, invoice_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific invoice by ID."""
        try:
            all_invoices = self.get_all_invoices()
            
            for invoice in all_invoices:
                if invoice.get("id") == invoice_id:
                    logger.info(f"Found invoice with ID: {invoice_id}")
                    return invoice
                    
            logger.warning(f"Invoice not found with ID: {invoice_id}")
            return None
            
        except Exception as e:
            logger.error(f"Failed to get invoice by ID {invoice_id}: {str(e)}")
            raise DataStorageError(f"Failed to retrieve invoice: {str(e)}")
    
    def update_invoice(self, invoice_id: str, updated_data: Dict[str, Any]) -> bool:
        """Update an existing invoice (simple implementation)."""
        try:
            if not self.invoices_csv.exists():
                logger.warning("No invoices CSV file exists")
                return False
                
            # Load current data
            invoices_df = pd.read_csv(self.invoices_csv)
            
            # Update the specific invoice
            mask = invoices_df['id'] == invoice_id
            if not mask.any():
                logger.warning(f"Invoice with ID {invoice_id} not found for update")
                return False
            
            # Update fields
            for key, value in updated_data.items():
                if key in invoices_df.columns:
                    invoices_df.loc[mask, key] = value
            
            # Add updated timestamp
            invoices_df.loc[mask, 'updated_at'] = datetime.now().isoformat()
            
            # Save back to CSV
            invoices_df.to_csv(self.invoices_csv, index=False)
            
            logger.info(f"Updated invoice with ID: {invoice_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update invoice {invoice_id}: {str(e)}")
            raise DataStorageError(f"Failed to update invoice: {str(e)}")
    
    def delete_invoice(self, invoice_id: str) -> bool:
        """Delete an invoice and its details."""
        try:
            # Delete from invoices
            if self.invoices_csv.exists():
                invoices_df = pd.read_csv(self.invoices_csv)
                invoices_df = invoices_df[invoices_df['id'] != invoice_id]
                invoices_df.to_csv(self.invoices_csv, index=False)
            
            # Delete from details
            if self.invoice_details_csv.exists():
                details_df = pd.read_csv(self.invoice_details_csv)
                details_df = details_df[details_df['invoice_id'] != invoice_id]
                details_df.to_csv(self.invoice_details_csv, index=False)
            
            logger.info(f"Deleted invoice with ID: {invoice_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete invoice {invoice_id}: {str(e)}")
            raise DataStorageError(f"Failed to delete invoice: {str(e)}")
    
    def export_to_excel(self, output_path: Optional[Path] = None) -> Path:
        """Export all data back to Excel format."""
        try:
            if output_path is None:
                output_path = self.data_dir / f"exported_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            
            data = self.load_existing_data()
            
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                if data["invoices"]:
                    pd.DataFrame(data["invoices"]).to_excel(
                        writer, sheet_name='SalesOrderHeader', index=False
                    )
                
                if data["details"]:
                    pd.DataFrame(data["details"]).to_excel(
                        writer, sheet_name='SalesOrderDetail', index=False
                    )
            
            logger.info(f"Exported data to Excel file: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Failed to export to Excel: {str(e)}")
            raise DataStorageError(f"Failed to export data: {str(e)}")
    
    def backup_data(self) -> Path:
        """Create a backup of current CSV data."""
        try:
            backup_dir = self.data_dir / "backups"
            backup_dir.mkdir(exist_ok=True)
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_file = backup_dir / f"backup_{timestamp}.xlsx"
            
            return self.export_to_excel(backup_file)
            
        except Exception as e:
            logger.error(f"Failed to backup data: {str(e)}")
            raise DataStorageError(f"Failed to backup data: {str(e)}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get basic statistics about the data."""
        try:
            data = self.load_existing_data()
            
            total_invoices = len(data["invoices"])
            total_items = len(data["details"])
            
            # Calculate totals if numeric data is available
            total_amount = 0.0
            if data["invoices"]:
                for invoice in data["invoices"]:
                    amount = invoice.get("total_amount", 0)
                    try:
                        amount_float = float(amount) if amount else 0.0
                        # Check for NaN
                        if amount_float == amount_float:  # NaN != NaN
                            total_amount += amount_float
                    except (ValueError, TypeError):
                        continue
            
            stats = {
                "total_invoices": total_invoices,
                "total_items": total_items,
                "total_amount": total_amount,
                "last_updated": datetime.now().isoformat(),
                "files_exist": {
                    "invoices_csv": self.invoices_csv.exists(),
                    "details_csv": self.invoice_details_csv.exists()
                }
            }
            
            logger.info(f"Generated statistics: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get statistics: {str(e)}")
            return {"error": str(e)}