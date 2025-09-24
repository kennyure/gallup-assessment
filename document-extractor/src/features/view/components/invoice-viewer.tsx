"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Calendar,
  Building,
  Phone,
  DollarSign,
  Package,
  Edit,
  RefreshCw
} from "lucide-react";
import { useViewStore } from "@/stores/view-store";
import { InvoiceEditor } from "./invoice-editor";

export function InvoiceViewer() {
  const { selectedInvoice, loading, isEditing, setIsEditing } = useViewStore();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading invoice...</span>
        </CardContent>
      </Card>
    );
  }

  if (!selectedInvoice) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoice Selected</h3>
          <p className="text-gray-500">
            Select an invoice from the manage page or upload a new document to view details here.
          </p>
        </CardContent>
      </Card>
    );
  }

  // If editing mode is active, show the editor
  if (isEditing) {
    return <InvoiceEditor />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice {selectedInvoice.invoice_number}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(selectedInvoice.invoice_date)}
                </span>
                <Badge variant="default">Processed</Badge>
                {selectedInvoice.extraction_confidence && (
                  <Badge variant="secondary">
                    {Math.round(selectedInvoice.extraction_confidence * 100)}% Confidence
                  </Badge>
                )}
              </CardDescription>
            </div>
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Invoice
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">{selectedInvoice.customer_name}</h4>
              <p className="text-sm text-gray-500">Customer ID: {selectedInvoice.customer_id || 'N/A'}</p>
            </div>

            <div>
              <h5 className="font-medium text-sm text-gray-700 mb-2">Billing Address</h5>
              <div className="text-sm text-gray-600">
                <p>{selectedInvoice.billing_street || '[Street Address]'}</p>
                <p>
                  {selectedInvoice.billing_city || '[City]'}, {selectedInvoice.billing_state || '[ST]'} {selectedInvoice.billing_zip || '[ZIP]'}
                </p>
                {selectedInvoice.billing_phone && (
                  <p className="flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {selectedInvoice.billing_phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-sm text-gray-700 mb-2">Shipping Address</h5>
              <div className="text-sm text-gray-600">
                <p>{selectedInvoice.shipping_street || '[Street Address]'}</p>
                <p>
                  {selectedInvoice.shipping_city || '[City]'}, {selectedInvoice.shipping_state || '[ST]'} {selectedInvoice.shipping_zip || '[ZIP]'}
                </p>
                {selectedInvoice.shipping_phone && (
                  <p className="flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {selectedInvoice.shipping_phone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">PO Number</p>
                <p className="text-sm text-gray-600">{selectedInvoice.po_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Terms</p>
                <p className="text-sm text-gray-600">{selectedInvoice.terms || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Ship Date</p>
                <p className="text-sm text-gray-600">
                  {selectedInvoice.ship_date ? formatDate(selectedInvoice.ship_date) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Ship Via</p>
                <p className="text-sm text-gray-600">{selectedInvoice.ship_via || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">FOB</p>
                <p className="text-sm text-gray-600">{selectedInvoice.fob || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Salesperson</p>
                <p className="text-sm text-gray-600">{selectedInvoice.salesperson || 'N/A'}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax ({(selectedInvoice.tax_rate * 100).toFixed(2)}%)</span>
                <span className="text-sm font-medium">{formatCurrency(selectedInvoice.tax_amount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg">{formatCurrency(selectedInvoice.total_amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Line Items ({selectedInvoice.items?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2 text-sm font-medium text-gray-700">Item #</th>
                  <th className="pb-2 text-sm font-medium text-gray-700">Description</th>
                  <th className="pb-2 text-sm font-medium text-gray-700 text-right">Qty</th>
                  <th className="pb-2 text-sm font-medium text-gray-700 text-right">Unit Price</th>
                  <th className="pb-2 text-sm font-medium text-gray-700 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items?.map((item, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="py-2 text-sm text-gray-600">{item.item_number}</td>
                    <td className="py-2 text-sm text-gray-900">{item.description}</td>
                    <td className="py-2 text-sm text-gray-600 text-right">{item.quantity}</td>
                    <td className="py-2 text-sm text-gray-600 text-right">{formatCurrency(item.unit_price)}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      No line items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}