import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ExtractionResult } from '@/types/api';

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'error';
  progress: number;
  documentId?: string;
  extractionResult?: ExtractionResult;
  error?: string;
}

interface UploadState {
  uploadedFiles: UploadedFile[];
  isProcessing: boolean;
  addFiles: (files: UploadedFile[]) => void;
  updateFile: (fileId: string, updates: Partial<UploadedFile>) => void;
  removeFile: (fileId: string) => void;
  setProcessing: (processing: boolean) => void;
  clearFiles: () => void;
}

export const useUploadStore = create<UploadState>()(
  devtools(
    (set) => ({
      uploadedFiles: [],
      isProcessing: false,

      addFiles: (files) =>
        set((state) => ({
          uploadedFiles: [...state.uploadedFiles, ...files],
        }), false, 'addFiles'),

      updateFile: (fileId, updates) =>
        set((state) => ({
          uploadedFiles: state.uploadedFiles.map((file) =>
            file.id === fileId ? { ...file, ...updates } : file
          ),
        }), false, 'updateFile'),

      removeFile: (fileId) =>
        set((state) => ({
          uploadedFiles: state.uploadedFiles.filter((file) => file.id !== fileId),
        }), false, 'removeFile'),

      setProcessing: (processing) =>
        set({ isProcessing: processing }, false, 'setProcessing'),

      clearFiles: () =>
        set({ uploadedFiles: [] }, false, 'clearFiles'),
    }),
    { name: 'upload-store' }
  )
);