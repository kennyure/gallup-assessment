"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  File,
  X
} from "lucide-react";
import { useUploadStore } from "@/stores/upload-store";
import { useUploadService } from "../hooks/use-upload-service";
import type { ExtractionResult } from "@/types/api";

export function FileUploadList() {
  const { uploadedFiles, removeFile } = useUploadStore();
  const { retryFile } = useUploadService();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'uploaded':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getStatusText = (fileItem: {
    status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'error';
    progress: number;
    error?: string;
    extractionResult?: ExtractionResult;
  }) => {
    switch (fileItem.status) {
      case 'uploading':
        return `Uploading... ${fileItem.progress}%`;
      case 'uploaded':
        return 'Upload complete';
      case 'processing':
        return 'Extracting data...';
      case 'completed':
        return `Extracted • Confidence: ${Math.round((fileItem.extractionResult?.confidence_score || 0) * 100)}%`;
      case 'error':
        return `Error: ${fileItem.error}`;
      default:
        return 'Ready';
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-700">Uploaded Files</h4>
      {uploadedFiles.map((fileItem) => (
        <Card key={fileItem.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {getStatusIcon(fileItem.status)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-700 truncate">
                  {fileItem.file.name}
                </p>
                <p className="text-sm text-gray-500">
                  {getStatusText(fileItem)}
                </p>
                {(fileItem.status === 'uploading' || fileItem.status === 'processing') && (
                  <Progress
                    value={fileItem.status === 'uploading' ? fileItem.progress : 50}
                    className="mt-2 h-2"
                  />
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {fileItem.status === 'error' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => retryFile(fileItem)}
                >
                  Retry
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(fileItem.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}