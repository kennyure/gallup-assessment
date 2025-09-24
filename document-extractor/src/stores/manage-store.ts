import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Invoice, InvoiceStatistics } from '@/types/api';

interface ManageState {
  invoices: Invoice[];
  filteredInvoices: Invoice[];
  loading: boolean;
  searchQuery: string;
  dateFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  statistics: InvoiceStatistics | null;
  selectedInvoice: Invoice | null;

  // Actions
  setInvoices: (invoices: Invoice[]) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setDateFilter: (filter: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setStatistics: (stats: InvoiceStatistics) => void;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  filterAndSortInvoices: () => void;
  deleteInvoice: (invoiceId: string) => void;
  loadInvoices: () => Promise<void>;
  loadStatistics: () => Promise<void>;
}

export const useManageStore = create<ManageState>()(
  devtools(
    (set, get) => ({
      invoices: [],
      filteredInvoices: [],
      loading: true,
      searchQuery: '',
      dateFilter: 'all',
      sortBy: 'invoice_date',
      sortOrder: 'desc',
      statistics: null,
      selectedInvoice: null,

      setInvoices: (invoices) => {
        set({ invoices }, false, 'setInvoices');
        get().filterAndSortInvoices();
      },

      setLoading: (loading) =>
        set({ loading }, false, 'setLoading'),

      setSearchQuery: (searchQuery) => {
        set({ searchQuery }, false, 'setSearchQuery');
        get().filterAndSortInvoices();
      },

      setDateFilter: (dateFilter) => {
        set({ dateFilter }, false, 'setDateFilter');
        get().filterAndSortInvoices();
      },

      setSortBy: (sortBy) => {
        set({ sortBy }, false, 'setSortBy');
        get().filterAndSortInvoices();
      },

      setSortOrder: (sortOrder) => {
        set({ sortOrder }, false, 'setSortOrder');
        get().filterAndSortInvoices();
      },

      setStatistics: (statistics) =>
        set({ statistics }, false, 'setStatistics'),

      setSelectedInvoice: (selectedInvoice) =>
        set({ selectedInvoice }, false, 'setSelectedInvoice'),

      filterAndSortInvoices: () => {
        const { invoices, searchQuery, dateFilter, sortBy, sortOrder } = get();
        let filtered = [...invoices];

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(invoice =>
            invoice.invoice_number.toLowerCase().includes(query) ||
            invoice.customer_name.toLowerCase().includes(query) ||
            (invoice.po_number && invoice.po_number.toLowerCase().includes(query))
          );
        }

        // Date filter
        if (dateFilter !== 'all') {
          const now = new Date();
          const filterDate = new Date();

          switch (dateFilter) {
            case 'today':
              filterDate.setHours(0, 0, 0, 0);
              filtered = filtered.filter(invoice =>
                new Date(invoice.invoice_date) >= filterDate
              );
              break;
            case 'week':
              filterDate.setDate(now.getDate() - 7);
              filtered = filtered.filter(invoice =>
                new Date(invoice.invoice_date) >= filterDate
              );
              break;
            case 'month':
              filterDate.setMonth(now.getMonth() - 1);
              filtered = filtered.filter(invoice =>
                new Date(invoice.invoice_date) >= filterDate
              );
              break;
            case 'year':
              filterDate.setFullYear(now.getFullYear() - 1);
              filtered = filtered.filter(invoice =>
                new Date(invoice.invoice_date) >= filterDate
              );
              break;
          }
        }

        // Sort
        filtered.sort((a, b) => {
          let aValue: string | number | Date;
          let bValue: string | number | Date;

          switch (sortBy) {
            case 'invoice_date':
              aValue = new Date(a.invoice_date);
              bValue = new Date(b.invoice_date);
              break;
            case 'total':
              aValue = a.total_amount || a.total;
              bValue = b.total_amount || b.total;
              break;
            case 'customer_name':
              aValue = a.customer_name.toLowerCase();
              bValue = b.customer_name.toLowerCase();
              break;
            case 'invoice_number':
              aValue = a.invoice_number.toLowerCase();
              bValue = b.invoice_number.toLowerCase();
              break;
            default:
              aValue = a.created_at || '';
              bValue = b.created_at || '';
          }

          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });

        set({ filteredInvoices: filtered }, false, 'filterAndSortInvoices');
      },

      deleteInvoice: (invoiceId) => {
        const { invoices } = get();
        const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId);
        set({ invoices: updatedInvoices }, false, 'deleteInvoice');
        get().filterAndSortInvoices();
      },

      loadInvoices: async () => {
        try {
          set({ loading: true }, false, 'loadInvoices:start');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/invoices`);
          const result = await response.json();

          if (result.success && result.data && result.data.invoices) {
            get().setInvoices(result.data.invoices);
          } else {
            throw new Error(result.error || 'Failed to load invoices');
          }
        } catch (error) {
          console.error('Error loading invoices:', error);
          throw error;
        } finally {
          set({ loading: false }, false, 'loadInvoices:end');
        }
      },

      loadStatistics: async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/invoices/statistics`);
          const result = await response.json();

          if (result.success && result.data) {
            get().setStatistics(result.data.statistics);
          }
        } catch (error) {
          console.error('Error loading statistics:', error);
        }
      },
    }),
    { name: 'manage-store' }
  )
);