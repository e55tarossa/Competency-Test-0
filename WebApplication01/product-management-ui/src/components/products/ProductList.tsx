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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Loading from '../ui/Loading';

const ProductList: React.FC = () => {
    const {
        filters,
        setFilters,
        resetFilters,
        tableState,
        setTableState,
        setSelectedProduct,
        setCreateModalOpen,
        setEditModalOpen,
        setDeleteModalOpen,
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage your product catalog
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        leftIcon={<Filter className="w-4 h-4" />}
                    >
                        Filters
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setCreateModalOpen(true)}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <Card variant="bordered">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Input
                                label="Search"
                                placeholder="Search by name, SKU..."
                                value={filters.searchTerm}
                                onChange={(e) => setFilters({ searchTerm: e.target.value })}
                                leftIcon={<Search className="w-4 h-4" />}
                            />
                            <Input
                                label="Min Price"
                                type="number"
                                placeholder="0.00"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ minPrice: e.target.value })}
                            />
                            <Input
                                label="Max Price"
                                type="number"
                                placeholder="1000.00"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ maxPrice: e.target.value })}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Status
                                </label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={filters.isActive === null ? 'all' : filters.isActive.toString()}
                                    onChange={(e) =>
                                        setFilters({
                                            isActive: e.target.value === 'all' ? null : e.target.value === 'true',
                                        })
                                    }
                                >
                                    <option value="all">All</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" onClick={resetFilters}>
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Products Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => handleSort('sku')}>
                                    SKU {tableState.sortBy === 'sku' && (tableState.sortDescending ? '↓' : '↑')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => handleSort('name')}>
                                    Name {tableState.sortBy === 'name' && (tableState.sortDescending ? '↓' : '↑')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => handleSort('price')}>
                                    Price {tableState.sortBy === 'price' && (tableState.sortDescending ? '↓' : '↑')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Variants
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => handleSort('createdAt')}>
                                    Created {tableState.sortBy === 'createdAt' && (tableState.sortDescending ? '↓' : '↑')}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-lg font-medium">No products found</p>
                                        <p className="text-sm mt-1">Try adjusting your filters or create a new product</p>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {product.sku}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                            <div className="font-medium">{product.name}</div>
                                            {product.description && (
                                                <div className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-1">
                                                    {product.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {formatCurrency(product.basePrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={product.isActive ? 'success' : 'default'}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {product.variants?.length || 0} variants
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(product.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewVariants(product)}
                                                    title="View Variants"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(product)}
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(product)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
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
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {(metadata.page - 1) * metadata.pageSize + 1} to{' '}
                            {Math.min(metadata.page * metadata.pageSize, metadata.totalCount)} of{' '}
                            {metadata.totalCount} results
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setTableState({ page: tableState.page - 1 })}
                                disabled={!metadata.hasPreviousPage}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Page {metadata.page} of {metadata.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setTableState({ page: tableState.page + 1 })}
                                disabled={!metadata.hasNextPage}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ProductList;
