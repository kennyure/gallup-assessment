import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Invoice, InvoiceStatistics } from '@/types/api';

interface AnalyticsMetrics {
  totalRevenue: number;
  averageInvoiceValue: number;
  monthlyGrowth: number;
  topCustomers: Array<{
    name: string;
    totalAmount: number;
    invoiceCount: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    invoiceCount: number;
  }>;
  recentActivity: Array<{
    date: string;
    action: string;
    description: string;
  }>;
}

interface AnalyticsState {
  metrics: AnalyticsMetrics | null;
  statistics: InvoiceStatistics | null;
  loading: boolean;
  dateRange: string;
  selectedMetric: string;

  // Actions
  setMetrics: (metrics: AnalyticsMetrics) => void;
  setStatistics: (statistics: InvoiceStatistics) => void;
  setLoading: (loading: boolean) => void;
  setDateRange: (range: string) => void;
  setSelectedMetric: (metric: string) => void;
  loadAnalytics: () => Promise<void>;
  calculateMetrics: (invoices: Invoice[]) => AnalyticsMetrics;
  exportAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    (set, get) => ({
      metrics: null,
      statistics: null,
      loading: true,
      dateRange: 'all',
      selectedMetric: 'revenue',

      setMetrics: (metrics) =>
        set({ metrics }, false, 'setMetrics'),

      setStatistics: (statistics) =>
        set({ statistics }, false, 'setStatistics'),

      setLoading: (loading) =>
        set({ loading }, false, 'setLoading'),

      setDateRange: (dateRange) => {
        set({ dateRange }, false, 'setDateRange');
        get().loadAnalytics();
      },

      setSelectedMetric: (selectedMetric) =>
        set({ selectedMetric }, false, 'setSelectedMetric'),

      calculateMetrics: (invoices) => {
        const totalRevenue = invoices.reduce((sum, invoice) =>
          sum + (invoice.total_amount || invoice.total || 0), 0
        );

        const averageInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

        // Calculate top customers
        const customerMap = new Map();
        invoices.forEach(invoice => {
          const customer = invoice.customer_name;
          const amount = invoice.total_amount || invoice.total || 0;

          if (customerMap.has(customer)) {
            const existing = customerMap.get(customer);
            customerMap.set(customer, {
              name: customer,
              totalAmount: existing.totalAmount + amount,
              invoiceCount: existing.invoiceCount + 1
            });
          } else {
            customerMap.set(customer, {
              name: customer,
              totalAmount: amount,
              invoiceCount: 1
            });
          }
        });

        const topCustomers = Array.from(customerMap.values())
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 5);

        // Calculate monthly revenue (simplified)
        const monthlyMap = new Map();
        invoices.forEach(invoice => {
          const date = new Date(invoice.invoice_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const amount = invoice.total_amount || invoice.total || 0;

          if (monthlyMap.has(monthKey)) {
            const existing = monthlyMap.get(monthKey);
            monthlyMap.set(monthKey, {
              month: monthKey,
              revenue: existing.revenue + amount,
              invoiceCount: existing.invoiceCount + 1
            });
          } else {
            monthlyMap.set(monthKey, {
              month: monthKey,
              revenue: amount,
              invoiceCount: 1
            });
          }
        });

        const monthlyRevenue = Array.from(monthlyMap.values())
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-12); // Last 12 months

        // Calculate growth (simplified - comparing last two months if available)
        let monthlyGrowth = 0;
        if (monthlyRevenue.length >= 2) {
          const lastMonth = monthlyRevenue[monthlyRevenue.length - 1];
          const prevMonth = monthlyRevenue[monthlyRevenue.length - 2];
          monthlyGrowth = prevMonth.revenue > 0
            ? ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
            : 0;
        }

        // Generate recent activity
        const recentActivity = invoices
          .sort((a, b) => new Date(b.created_at || b.invoice_date).getTime() - new Date(a.created_at || a.invoice_date).getTime())
          .slice(0, 10)
          .map(invoice => ({
            date: invoice.created_at || invoice.invoice_date,
            action: 'Invoice Created',
            description: `Invoice ${invoice.invoice_number} for ${invoice.customer_name} - $${(invoice.total_amount || invoice.total || 0).toFixed(2)}`
          }));

        return {
          totalRevenue,
          averageInvoiceValue,
          monthlyGrowth,
          topCustomers,
          monthlyRevenue,
          recentActivity
        };
      },

      loadAnalytics: async () => {
        try {
          set({ loading: true }, false, 'loadAnalytics:start');

          // Load invoices and statistics
          const [invoicesResponse, statsResponse] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/invoices`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/invoices/statistics`)
          ]);

          const invoicesResult = await invoicesResponse.json();
          const statsResult = await statsResponse.json();

          if (invoicesResult.success && invoicesResult.data) {
            const invoices = invoicesResult.data.invoices || [];
            const metrics = get().calculateMetrics(invoices);
            set({ metrics }, false, 'loadAnalytics:setMetrics');
          }

          if (statsResult.success && statsResult.data) {
            set({ statistics: statsResult.data.statistics }, false, 'loadAnalytics:setStatistics');
          }
        } catch (error) {
          console.error('Error loading analytics:', error);
        } finally {
          set({ loading: false }, false, 'loadAnalytics:end');
        }
      },

      exportAnalytics: () => {
        const { metrics, statistics } = get();
        const exportData = {
          metrics,
          statistics,
          exportDate: new Date().toISOString(),
          dateRange: get().dateRange
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },
    }),
    { name: 'analytics-store' }
  )
);