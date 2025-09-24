"use client";

import { PageHeader } from "@/components/layout/page-header";
import { InvoiceList } from "@/features/manage/components/invoice-list";
import { InvoiceStatistics } from "@/features/manage/components/invoice-statistics";
import { useRouter } from "next/navigation";
import { Invoice } from "@/types/api";

export default function ManagePage() {
  const router = useRouter();

  const handleInvoiceSelected = (invoice: Invoice) => {
    router.push(`/view?invoice=${invoice.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Invoices"
        description="View, search, and manage all your processed invoices"
      />
      <InvoiceStatistics />
      <InvoiceList onInvoiceSelected={handleInvoiceSelected} />
    </div>
  );
}