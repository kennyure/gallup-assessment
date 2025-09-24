import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Invoice, InvoiceItem } from '@/types/api';

interface ViewState {
  selectedInvoice: Invoice | null;
  isEditing: boolean;
  editedData: Partial<Invoice>;
  loading: boolean;

  // Actions
  setSelectedInvoice: (invoice: Invoice | null) => void;
  setIsEditing: (editing: boolean) => void;
  setEditedData: (data: Partial<Invoice>) => void;
  updateEditedField: (field: string, value: string | number | boolean | InvoiceItem[]) => void;
  resetEditedData: () => void;
  setLoading: (loading: boolean) => void;
  saveChanges: () => Promise<void>;
  loadInvoiceById: (invoiceId: string) => Promise<void>;
}

export const useViewStore = create<ViewState>()(
  devtools(
    (set, get) => ({
      selectedInvoice: null,
      isEditing: false,
      editedData: {},
      loading: false,

      setSelectedInvoice: (selectedInvoice) => {
        set({ selectedInvoice }, false, 'setSelectedInvoice');
        if (selectedInvoice) {
          set({ editedData: { ...selectedInvoice } }, false, 'setInitialEditedData');
        }
      },

      setIsEditing: (isEditing) => {
        set({ isEditing }, false, 'setIsEditing');
        if (!isEditing) {
          get().resetEditedData();
        }
      },

      setEditedData: (editedData) =>
        set({ editedData }, false, 'setEditedData'),

      updateEditedField: (field, value) => {
        const { editedData } = get();
        set({
          editedData: { ...editedData, [field]: value }
        }, false, 'updateEditedField');
      },

      resetEditedData: () => {
        const { selectedInvoice } = get();
        set({
          editedData: selectedInvoice ? { ...selectedInvoice } : {}
        }, false, 'resetEditedData');
      },

      setLoading: (loading) =>
        set({ loading }, false, 'setLoading'),

      saveChanges: async () => {
        const { selectedInvoice, editedData } = get();
        if (!selectedInvoice || !selectedInvoice.id) return;

        try {
          set({ loading: true }, false, 'saveChanges:start');

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/invoices/${selectedInvoice.id}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(editedData),
            }
          );

          const result = await response.json();

          if (result.success && result.data) {
            set({
              selectedInvoice: result.data.invoice,
              editedData: { ...result.data.invoice },
              isEditing: false
            }, false, 'saveChanges:success');
          } else {
            throw new Error(result.error || 'Failed to save changes');
          }
        } catch (error) {
          console.error('Error saving changes:', error);
          throw error;
        } finally {
          set({ loading: false }, false, 'saveChanges:end');
        }
      },

      loadInvoiceById: async (invoiceId) => {
        try {
          set({ loading: true }, false, 'loadInvoiceById:start');

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/invoices/${invoiceId}`
          );
          const result = await response.json();

          if (result.success && result.data) {
            get().setSelectedInvoice(result.data.invoice);
          } else {
            throw new Error(result.error || 'Failed to load invoice');
          }
        } catch (error) {
          console.error('Error loading invoice:', error);
          throw error;
        } finally {
          set({ loading: false }, false, 'loadInvoiceById:end');
        }
      },
    }),
    { name: 'view-store' }
  )
);