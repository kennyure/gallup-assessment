"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceViewer } from "@/features/view/components/invoice-viewer";
import { useViewStore } from "@/stores/view-store";

function ViewPageContent() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoice');
  const { selectedInvoice, loadInvoiceById } = useViewStore();

  useEffect(() => {
    if (invoiceId && invoiceId !== selectedInvoice?.id) {
      loadInvoiceById(invoiceId);
    }
  }, [invoiceId, selectedInvoice?.id, loadInvoiceById]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="View Invoice"
        description={selectedInvoice ? `Invoice ${selectedInvoice.invoice_number}` : "View and edit invoice details"}
      />
      <InvoiceViewer />
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewPageContent />
    </Suspense>
  );
}