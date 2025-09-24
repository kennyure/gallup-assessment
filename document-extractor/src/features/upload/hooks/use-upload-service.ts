import { useCallback } from "react";
import { toast } from "sonner";
import { useUploadStore } from "@/stores/upload-store";
import { ApiResponse, ExtractionResult, Invoice, UploadedDocument } from "@/types/api";

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'error';
  progress: number;
  documentId?: string;
  extractionResult?: ExtractionResult;
  error?: string;
}

export function useUploadService(onInvoiceExtracted?: (invoice: Invoice) => void) {
  const { updateFile } = useUploadStore();

  const extractData = useCallback(async (fileId: string, documentId: string) => {
    try {
      updateFile(fileId, { status: 'processing' });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/extract/${documentId}`, {
        method: 'POST',
      });

      const result: ApiResponse<ExtractionResult> = await response.json();

      if (result.success && result.data) {
        updateFile(fileId, {
          status: 'completed',
          extractionResult: result.data
        });

        toast.success(`Data extracted successfully from ${result.data.invoice_data.invoice_number}`);
        onInvoiceExtracted?.(result.data.invoice_data);
      } else {
        throw new Error(result.error || 'Extraction failed');
      }
    } catch (error) {
      updateFile(fileId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Extraction failed'
      });
      toast.error(`Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [updateFile, onInvoiceExtracted]);

  const uploadFile = useCallback(async (fileItem: UploadedFile) => {
    try {
      const formData = new FormData();
      formData.append('file', fileItem.file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        updateFile(fileItem.id, {
          progress: Math.min(fileItem.progress + 10, 90)
        });
      }, 200);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      const result: ApiResponse<UploadedDocument> = await response.json();

      if (result.success && result.data) {
        updateFile(fileItem.id, {
          status: 'uploaded',
          progress: 100,
          documentId: result.data.document_id
        });

        toast.success(`File ${fileItem.file.name} uploaded successfully`);

        // Automatically start extraction
        extractData(fileItem.id, result.data.document_id);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      updateFile(fileItem.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      });
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [updateFile, extractData]);

  const retryFile = useCallback((fileItem: UploadedFile) => {
    updateFile(fileItem.id, {
      status: 'uploading',
      progress: 0,
      error: undefined
    });
    uploadFile(fileItem);
  }, [updateFile, uploadFile]);

  return {
    uploadFile,
    extractData,
    retryFile
  };
}