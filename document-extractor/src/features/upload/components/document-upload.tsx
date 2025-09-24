"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle } from "lucide-react";
import { useUploadStore } from "@/stores/upload-store";
import { FileUploadList } from "./file-upload-list";
import { useUploadService } from "../hooks/use-upload-service";
import { Invoice } from "@/types/api";

interface DocumentUploadProps {
  onInvoiceExtracted: (invoice: Invoice) => void;
}

export function DocumentUpload({ onInvoiceExtracted }: DocumentUploadProps) {
  const { uploadedFiles, addFiles } = useUploadStore();
  const { uploadFile } = useUploadService(onInvoiceExtracted);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36),
      status: 'uploading' as const,
      progress: 0
    }));

    addFiles(newFiles);

    // Upload each file
    newFiles.forEach(fileItem => {
      uploadFile(fileItem);
    });
  }, [addFiles, uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 16 * 1024 * 1024, // 16MB
    multiple: true
  });

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`cursor-pointer text-center transition-colors ${
              isDragActive ? 'bg-blue-50' : ''
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p className="text-gray-500 mb-4">
              or click to select files
            </p>
            <p className="text-sm text-gray-400">
              Supports JPG, PNG, PDF up to 16MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Status */}
      {uploadedFiles.length > 0 && <FileUploadList />}

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro tip:</strong> For best results, ensure your invoice images are clear and well-lit.
          The AI can extract data from various invoice formats and layouts automatically.
        </AlertDescription>
      </Alert>
    </div>
  );
}