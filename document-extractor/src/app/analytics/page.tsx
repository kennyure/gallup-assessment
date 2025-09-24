"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="View insights and analytics about your invoices"
      />
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Analytics dashboard coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}