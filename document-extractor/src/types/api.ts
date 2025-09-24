export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string;
}

export interface InvoiceItem {
  id?: string;
  item_number: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id?: string;
  invoice_number: string;
  invoice_date: string;
  customer_id?: number;
  customer_name: string;
  billing_street?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_phone?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_phone?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  total: number; // Keep for compatibility
  tax: number;   // Keep for compatibility
  salesperson?: string;
  po_number?: string;
  terms?: string;
  ship_date?: string;
  ship_via?: string;
  fob?: string;
  extraction_confidence?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UploadedDocument {
  document_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  status: string;
  upload_time?: number;
}

export interface ExtractionResult {
  extraction_id: string;
  invoice_id: string;
  invoice_data: Invoice;
  confidence_score: number;
  processing_time: number;
  validation_results: {
    is_valid: boolean;
    warnings: string[];
    errors: string[];
    suggestions?: string[];
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  pagination: PaginationInfo;
}

export interface InvoiceStatistics {
  total_invoices: number;
  total_items: number;
  total_amount: number;
  last_updated: string;
  files_exist: {
    invoices_csv: boolean;
    details_csv: boolean;
  };
}