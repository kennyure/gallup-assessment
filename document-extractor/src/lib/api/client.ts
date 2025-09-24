import axios, { AxiosInstance } from 'axios';
import type { 
  ApiResponse, 
  Invoice, 
  UploadedDocument, 
  ExtractionResult, 
  PaginationInfo,
  InvoiceStatistics
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // You can add authentication tokens here if needed
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Handle unauthorized access
        } else if (error.response?.status >= 500) {
          // Handle server errors
          console.error('Server error:', error.response?.data);
        }
        return Promise.reject(error);
      }
    );
  }

  // Upload methods
  async uploadFile(file: File): Promise<ApiResponse<UploadedDocument>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async validateFile(file: File): Promise<ApiResponse<{ is_valid: boolean; errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post('/upload/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getUploadStatus(documentId: string): Promise<ApiResponse<UploadedDocument>> {
    return this.client.get(`/upload/status/${documentId}`);
  }

  // Extraction methods
  async extractDocument(documentId: string): Promise<ApiResponse<ExtractionResult>> {
    return this.client.post(`/extract/${documentId}`);
  }

  async extractBatch(documentIds: string[]): Promise<ApiResponse<ExtractionResult[]>> {
    return this.client.post('/extract/batch', { document_ids: documentIds });
  }

  async getExtractionStatus(extractionId: string): Promise<ApiResponse<ExtractionResult>> {
    return this.client.get(`/extract/status/${extractionId}`);
  }

  // Invoice methods
  async getInvoices(params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<ApiResponse<{ invoices: Invoice[]; pagination: PaginationInfo }>> {
    return this.client.get('/invoices', { params });
  }

  async getInvoice(invoiceId: string): Promise<ApiResponse<Invoice>> {
    return this.client.get(`/invoices/${invoiceId}`);
  }

  async updateInvoice(invoiceId: string, data: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    return this.client.put(`/invoices/${invoiceId}`, data);
  }

  async deleteInvoice(invoiceId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.client.delete(`/invoices/${invoiceId}`);
  }

  async getInvoiceStatistics(): Promise<ApiResponse<InvoiceStatistics>> {
    return this.client.get('/invoices/statistics');
  }

  async exportInvoices(filename?: string): Promise<ApiResponse<{ download_url: string }>> {
    return this.client.post('/invoices/export', { filename });
  }

  async backupInvoices(): Promise<ApiResponse<{ backup_path: string }>> {
    return this.client.post('/invoices/backup');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.client.get('/health', {
      baseURL: API_URL.replace('/api/v1', ''), // Health endpoint is at root
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;