"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Calendar, DollarSign, BarChart3 } from "lucide-react";
import { useManageStore } from "@/stores/manage-store";

export function InvoiceStatistics() {
  const { statistics, loadStatistics } = useManageStore();

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!statistics) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Invoices</p>
            <p className="text-2xl font-bold">{statistics.total_invoices}</p>
          </div>
          <Building className="h-8 w-8 text-blue-500" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Items</p>
            <p className="text-2xl font-bold">{statistics.total_items}</p>
          </div>
          <Calendar className="h-8 w-8 text-green-500" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold">{formatCurrency(statistics.total_amount)}</p>
          </div>
          <DollarSign className="h-8 w-8 text-yellow-500" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg Invoice</p>
            <p className="text-2xl font-bold">
              {formatCurrency(statistics.total_invoices > 0 ? statistics.total_amount / statistics.total_invoices : 0)}
            </p>
          </div>
          <BarChart3 className="h-8 w-8 text-purple-500" />
        </CardContent>
      </Card>
    </div>
  );
}