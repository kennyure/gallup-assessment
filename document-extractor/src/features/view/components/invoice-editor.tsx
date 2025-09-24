"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Building,
  DollarSign,
  Package,
  Save,
  X,
  Plus,
  Trash2
} from "lucide-react";
import { useViewStore } from "@/stores/view-store";

export function InvoiceEditor() {
  const {
    selectedInvoice,
    editedData,
    setIsEditing,
    updateEditedField,
    saveChanges,
    resetEditedData
  } = useViewStore();

  const [saving, setSaving] = useState(false);

  if (!selectedInvoice || !editedData) {
    return null;
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveChanges();
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    resetEditedData();
    setIsEditing(false);
  };

  const addLineItem = () => {
    const items = editedData.items || [];
    const newItem = {
      item_number: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    };
    updateEditedField('items', [...items, newItem]);
  };

  const removeLineItem = (index: number) => {
    const items = editedData.items || [];
    const newItems = items.filter((_, i) => i !== index);
    updateEditedField('items', newItems);
  };

  const updateLineItem = (index: number, field: string, value: string | number) => {
    const items = [...(editedData.items || [])];
    items[index] = { ...items[index], [field]: value };

    // Auto-calculate total for line item
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? Number(value) : items[index].quantity;
      const unitPrice = field === 'unit_price' ? Number(value) : items[index].unit_price;
      items[index].total = quantity * unitPrice;
    }

    updateEditedField('items', items);

    // Recalculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    updateEditedField('subtotal', subtotal);

    // Recalculate tax and total
    const taxRate = editedData.tax_rate || 0;
    const tax = subtotal * taxRate;
    updateEditedField('tax_amount', tax);
    updateEditedField('total_amount', subtotal + tax);
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
                Edit Invoice {editedData.invoice_number}
              </CardTitle>
              <CardDescription>
                Make changes to the invoice details below
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_number">Invoice Number</Label>
                <Input
                  id="invoice_number"
                  value={editedData.invoice_number || ''}
                  onChange={(e) => updateEditedField('invoice_number', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="invoice_date">Invoice Date</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={editedData.invoice_date ? editedData.invoice_date.split('T')[0] : ''}
                  onChange={(e) => updateEditedField('invoice_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="po_number">PO Number</Label>
                <Input
                  id="po_number"
                  value={editedData.po_number || ''}
                  onChange={(e) => updateEditedField('po_number', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="terms">Terms</Label>
                <Input
                  id="terms"
                  value={editedData.terms || ''}
                  onChange={(e) => updateEditedField('terms', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                value={editedData.customer_name || ''}
                onChange={(e) => updateEditedField('customer_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="customer_id">Customer ID</Label>
              <Input
                id="customer_id"
                value={editedData.customer_id || ''}
                onChange={(e) => updateEditedField('customer_id', e.target.value)}
              />
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium">Billing Address</Label>
              <div className="space-y-2 mt-2">
                <Input
                  placeholder="Street Address"
                  value={editedData.billing_street || ''}
                  onChange={(e) => updateEditedField('billing_street', e.target.value)}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="City"
                    value={editedData.billing_city || ''}
                    onChange={(e) => updateEditedField('billing_city', e.target.value)}
                  />
                  <Input
                    placeholder="State"
                    value={editedData.billing_state || ''}
                    onChange={(e) => updateEditedField('billing_state', e.target.value)}
                  />
                  <Input
                    placeholder="ZIP"
                    value={editedData.billing_zip || ''}
                    onChange={(e) => updateEditedField('billing_zip', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Line Items ({editedData.items?.length || 0})
            </CardTitle>
            <Button onClick={addLineItem} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {editedData.items?.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Item {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div>
                    <Label htmlFor={`item_number_${index}`}>Item #</Label>
                    <Input
                      id={`item_number_${index}`}
                      value={item.item_number || ''}
                      onChange={(e) => updateLineItem(index, 'item_number', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`description_${index}`}>Description</Label>
                    <Input
                      id={`description_${index}`}
                      value={item.description || ''}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`quantity_${index}`}>Quantity</Label>
                    <Input
                      id={`quantity_${index}`}
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity || 0}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unit_price_${index}`}>Unit Price</Label>
                    <Input
                      id={`unit_price_${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price || 0}
                      onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-sm text-gray-600">
                    Total: ${(item.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                No line items. Click &quot;Add Item&quot; to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Invoice Totals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="subtotal">Subtotal</Label>
                <Input
                  id="subtotal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedData.subtotal || 0}
                  onChange={(e) => updateEditedField('subtotal', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={((editedData.tax_rate || 0) * 100).toFixed(2)}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) / 100 || 0;
                    updateEditedField('tax_rate', rate);
                    const tax = (editedData.subtotal || 0) * rate;
                    updateEditedField('tax_amount', tax);
                    updateEditedField('total_amount', (editedData.subtotal || 0) + tax);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="tax_amount">Tax Amount</Label>
                <Input
                  id="tax_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedData.tax_amount || 0}
                  onChange={(e) => updateEditedField('tax_amount', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Amount</span>
              <div className="w-32">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedData.total_amount || 0}
                  onChange={(e) => updateEditedField('total_amount', parseFloat(e.target.value) || 0)}
                  className="text-right font-bold text-lg"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}