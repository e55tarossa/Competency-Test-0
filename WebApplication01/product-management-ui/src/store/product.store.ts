import { create } from 'zustand';
import type { Product, ProductFilters, TableState } from '../types';

interface ProductStore {
    // Selected product
    selectedProduct: Product | null;
    setSelectedProduct: (product: Product | null) => void;

    // Filters
    filters: ProductFilters;
    setFilters: (filters: Partial<ProductFilters>) => void;
    resetFilters: () => void;

    // Table state
    tableState: TableState;
    setTableState: (state: Partial<TableState>) => void;

    // UI state
    isCreateModalOpen: boolean;
    isEditModalOpen: boolean;
    isDeleteModalOpen: boolean;
    isVariantModalOpen: boolean;
    setCreateModalOpen: (open: boolean) => void;
    setEditModalOpen: (open: boolean) => void;
    setDeleteModalOpen: (open: boolean) => void;
    setVariantModalOpen: (open: boolean) => void;

    // Loading states
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const defaultFilters: ProductFilters = {
    searchTerm: '',
    categoryId: '',
    isActive: null,
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
    sortDescending: false,
};

const defaultTableState: TableState = {
    page: 1,
    pageSize: 20,
    sortBy: 'name',
    sortDescending: false,
};

export const useProductStore = create<ProductStore>((set) => ({
    // Selected product
    selectedProduct: null,
    setSelectedProduct: (product) => set({ selectedProduct: product }),

    // Filters
    filters: defaultFilters,
    setFilters: (filters) =>
        set((state) => ({
            filters: { ...state.filters, ...filters },
            tableState: { ...state.tableState, page: 1 }, // Reset to first page on filter change
        })),
    resetFilters: () =>
        set({
            filters: defaultFilters,
            tableState: { ...defaultTableState },
        }),

    // Table state
    tableState: defaultTableState,
    setTableState: (state) =>
        set((prev) => ({
            tableState: { ...prev.tableState, ...state },
        })),

    // UI state
    isCreateModalOpen: false,
    isEditModalOpen: false,
    isDeleteModalOpen: false,
    isVariantModalOpen: false,
    setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
    setEditModalOpen: (open) => set({ isEditModalOpen: open }),
    setDeleteModalOpen: (open) => set({ isDeleteModalOpen: open }),
    setVariantModalOpen: (open) => set({ isVariantModalOpen: open }),

    // Loading states
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
}));
