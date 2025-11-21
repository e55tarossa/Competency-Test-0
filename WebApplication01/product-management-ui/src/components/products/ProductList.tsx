import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    Plus,
    Filter,
    RefreshCw,
    Edit,
    Trash2,
    Eye,
    Package,
} from 'lucide-react';
import { productApi } from '../../services/product.service';
import { useProductStore } from '../../store/product.store';
import type { Product } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Loading from '../ui/Loading';
import ProductForm from './ProductForm';
import DeleteProductModal from './DeleteProductModal';
import VariantModal from './VariantModal';

const ProductList: React.FC = () => {
    const {
        filters,
        setFilters,
        resetFilters,
        tableState,
        setTableState,
        selectedProduct,
        setSelectedProduct,
        isCreateModalOpen: createModalOpen,
        setCreateModalOpen,
        isEditModalOpen: editModalOpen,
        setEditModalOpen,
        isDeleteModalOpen: deleteModalOpen,
        setDeleteModalOpen,
        isVariantModalOpen: variantModalOpen,
        setVariantModalOpen,
    } = useProductStore();

    const [showFilters, setShowFilters] = useState(false);

    // Fetch products with React Query
    const {
        data: productsResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['products', filters, tableState],
        queryFn: () =>
            productApi.getProducts({
                page: tableState.page,
                pageSize: tableState.pageSize,
                searchTerm: filters.searchTerm || undefined,
                categoryId: filters.categoryId || undefined,
                isActive: filters.isActive ?? undefined,
                minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
                maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
                sortBy: tableState.sortBy as any,
                sortDescending: tableState.sortDescending,
            }),
        staleTime: 30000, // 30 seconds
    });

    const products = productsResponse?.data || [];
    const metadata = productsResponse?.metadata;

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setEditModalOpen(true);
    };

    const handleDelete = (product: Product) => {
        setSelectedProduct(product);
        setDeleteModalOpen(true);
    };

    const handleViewVariants = (product: Product) => {
        setSelectedProduct(product);
        setVariantModalOpen(true);
    };

    const handleSort = (field: string) => {
        if (tableState.sortBy === field) {
            setTableState({ sortDescending: !tableState.sortDescending });
        } else {
            setTableState({ sortBy: field, sortDescending: false });
        }
    };

    if (isLoading) {
        return <Loading message="Loading products..." />;
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="text-red-600 text-center">
                    <p className="text-lg font-semibold">Error loading products</p>
                    <p className="text-sm mt-2">{error?.message || 'An unexpected error occurred'}</p>
                </div>
                <Button onClick={() => refetch()} leftIcon={<RefreshCw className="w-4 h-4" />}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Products</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage your product catalog
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        leftIcon={<Filter className="w-4 h-4" />}
                        className="glass-card hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        Filters
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                        className="glass-card hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setCreateModalOpen(true)}
                        leftIcon={<Plus className="w-4 h-4" />}
                        className="shadow-lg shadow-blue-500/20"
                    >
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="glass-card rounded-2xl p-6 animate-slide-down">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Input
                            label="Search"
                            placeholder="Search by name, SKU..."
                            value={filters.searchTerm}
                            onChange={(e) => setFilters({ searchTerm: e.target.value })}
                            leftIcon={<Search className="w-4 h-4" />}
                            className="premium-input"
                        />
                        <Input
                            label="Min Price"
                            type="number"
                            placeholder="0.00"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({ minPrice: e.target.value })}
                            className="premium-input"
                        />
                        <Input
                            label="Max Price"
                            type="number"
                            placeholder="1000.00"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ maxPrice: e.target.value })}
                            className="premium-input"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Status
                            </label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-700/50 dark:border-gray-700 bg-gray-900/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-100 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 hover:border-gray-600/50 transition-all duration-200"
                                value={filters.isActive === null ? 'all' : filters.isActive.toString()}
                                onChange={(e) =>
                                    setFilters({
                                        isActive: e.target.value === 'all' ? null : e.target.value === 'true',
                                    })
                                }
                            >
                                <option value="all">All Statuses</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button variant="ghost" onClick={resetFilters} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            Reset Filters
                        </Button>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    onClick={() => handleSort('sku')}>
                                    <div className="flex items-center gap-2">
                                        SKU {tableState.sortBy === 'sku' && (tableState.sortDescending ? '↓' : '↑')}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-2">
                                        Product {tableState.sortBy === 'name' && (tableState.sortDescending ? '↓' : '↑')}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    onClick={() => handleSort('price')}>
                                    <div className="flex items-center gap-2">
                                        Price {tableState.sortBy === 'price' && (tableState.sortDescending ? '↓' : '↑')}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Variants
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    onClick={() => handleSort('createdAt')}>
                                    <div className="flex items-center gap-2">
                                        Created {tableState.sortBy === 'createdAt' && (tableState.sortDescending ? '↓' : '↑')}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                                <Package className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">No products found</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters or create a new product</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="premium-table-row group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                                                {product.sku}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {product.name}
                                                </span>
                                                {product.description && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                                        {product.description}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(product.basePrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={product.isActive ? 'success' : 'default'} className="shadow-sm">
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${product.variants && product.variants.length > 0 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                {product.variants?.length || 0} variants
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(product.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewVariants(product)}
                                                    title="View Variants"
                                                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(product)}
                                                    title="Edit"
                                                    className="hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(product)}
                                                    title="Delete"
                                                    className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {metadata && metadata.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing <span className="font-medium text-gray-900 dark:text-white">{(metadata.page - 1) * metadata.pageSize + 1}</span> to{' '}
                            <span className="font-medium text-gray-900 dark:text-white">{Math.min(metadata.page * metadata.pageSize, metadata.totalCount)}</span> of{' '}
                            <span className="font-medium text-gray-900 dark:text-white">{metadata.totalCount}</span> results
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setTableState({ page: tableState.page - 1 })}
                                disabled={!metadata.hasPreviousPage}
                                className="glass-card hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
                                Page {metadata.page} of {metadata.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setTableState({ page: tableState.page + 1 })}
                                disabled={!metadata.hasNextPage}
                                className="glass-card hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {(createModalOpen || editModalOpen) && (
                <ProductForm
                    product={editModalOpen ? selectedProduct || undefined : undefined}
                    onClose={() => {
                        setCreateModalOpen(false);
                        setEditModalOpen(false);
                        setSelectedProduct(null);
                    }}
                />
            )}

            <DeleteProductModal
                product={selectedProduct}
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedProduct(null);
                }}
            />

            <VariantModal
                product={selectedProduct}
                isOpen={variantModalOpen}
                onClose={() => {
                    setVariantModalOpen(false);
                    setSelectedProduct(null);
                }}
            />
        </div>
    );
};

export default ProductList;
