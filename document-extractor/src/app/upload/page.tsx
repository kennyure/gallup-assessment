"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DocumentUpload } from "@/features/upload/components/document-upload";
import { useRouter } from "next/navigation";
import { Invoice } from "@/types/api";

export default function UploadPage() {
  const router = useRouter();

  const handleInvoiceExtracted = (invoice: Invoice) => {
    // Navigate to view page with the extracted invoice
    router.push(`/view?invoice=${invoice.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Documents"
        description="Upload invoice documents for AI-powered data extraction"
      />
      <DocumentUpload onInvoiceExtracted={handleInvoiceExtracted} />
    </div>
  );
}