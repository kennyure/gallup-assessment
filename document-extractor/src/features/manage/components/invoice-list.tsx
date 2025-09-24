"use client";

import { useEffect } from "react";
import { useManageStore } from "@/stores/manage-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Invoice } from "@/types/api";

interface InvoiceListProps {
  onInvoiceSelected: (invoice: Invoice) => void;
}

export function InvoiceList({ onInvoiceSelected }: InvoiceListProps) {
  const {
    filteredInvoices,
    loading,
    loadInvoices
  } = useManageStore();

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading invoices...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice List</CardTitle>
        <CardDescription>
          {filteredInvoices.length} invoices found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredInvoices.map((invoice, index) => (
            <div
              key={`${invoice.id}-${invoice.created_at || index}`}
              className="p-3 border rounded cursor-pointer hover:bg-gray-50"
              onClick={() => onInvoiceSelected(invoice)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{invoice.invoice_number}</p>
                  <p className="text-sm text-gray-500">{invoice.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(invoice.total_amount || invoice.total || 0).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}