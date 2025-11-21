import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Edit, Save, X, Package } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../../services/product.service';
import { useToastStore } from '../../store/toast.store';
import type { Product, ProductVariant, CreateVariantRequest, UpdateVariantRequest } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../lib/utils';

const variantSchema = z.object({
    sku: z.string().min(3, 'SKU must be at least 3 characters'),
    name: z.string().min(3, 'Name must be at least 3 characters'),
    price: z.string().optional().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), 'Price must be a valid number'),
    stockQuantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, 'Stock must be a valid number'),
    isActive: z.boolean(),
});

type VariantFormData = z.infer<typeof variantSchema>;

interface VariantModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

const VariantModal: React.FC<VariantModalProps> = ({ product, isOpen, onClose }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
    const queryClient = useQueryClient();
    const addToast = useToastStore((state) => state.addToast);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<VariantFormData>({
        resolver: zodResolver(variantSchema),
        defaultValues: {
            isActive: true,
            stockQuantity: '0',
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateVariantRequest) => productApi.createVariant(product!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            addToast({ type: 'success', message: 'Variant created successfully' });
            setIsAdding(false);
            reset();
        },
        onError: (error) => {
            addToast({ type: 'error', message: error.message || 'Failed to create variant' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateVariantRequest }) =>
            productApi.updateVariant(product!.id, id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            addToast({ type: 'success', message: 'Variant updated successfully' });
            setEditingVariant(null);
            reset();
        },
        onError: (error) => {
            addToast({ type: 'error', message: error.message || 'Failed to update variant' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (variantId: string) => productApi.deleteVariant(product!.id, variantId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            addToast({ type: 'success', message: 'Variant deleted successfully' });
        },
        onError: (error) => {
            addToast({ type: 'error', message: error.message || 'Failed to delete variant' });
        },
    });

    const onSubmit = (data: VariantFormData) => {
        const payload = {
            ...data,
            price: data.price ? parseFloat(data.price) : undefined,
            stockQuantity: parseInt(data.stockQuantity),
            attributes: [], // TODO: Add attribute management
        };

        if (editingVariant) {
            updateMutation.mutate({
                id: editingVariant.id,
                data: payload as UpdateVariantRequest,
            });
        } else {
            createMutation.mutate(payload as CreateVariantRequest);
        }
    };

    const handleEdit = (variant: ProductVariant) => {
        setEditingVariant(variant);
        setIsAdding(false);
        setValue('sku', variant.sku);
        setValue('name', variant.name);
        setValue('price', variant.price?.toString() || '');
        setValue('stockQuantity', variant.stockQuantity.toString());
        setValue('isActive', variant.isActive);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingVariant(null);
        reset();
    };

    if (!product) return null;

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Variants for ${product.name}`}
            description="Manage product variants and stock levels"
            size="lg"
        >
            <div className="space-y-6">
                {/* List of Variants */}
                {!isAdding && !editingVariant && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                    setIsAdding(true);
                                    reset({ isActive: true, stockQuantity: '0' });
                                }}
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                Add Variant
                            </Button>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SKU</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stock</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {product.variants && product.variants.length > 0 ? (
                                        product.variants.map((variant) => (
                                            <tr key={variant.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">{variant.sku}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{variant.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                    {variant.price ? formatCurrency(variant.price) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                    <Badge variant={variant.stockQuantity > 0 ? 'default' : 'danger'}>
                                                        {variant.stockQuantity}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <Badge variant={variant.isActive ? 'success' : 'default'}>
                                                        {variant.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(variant)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Edit className="w-4 h-4 text-amber-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteMutation.mutate(variant.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Package className="w-8 h-8 opacity-50" />
                                                    <p>No variants found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Add/Edit Form */}
                {(isAdding || editingVariant) && (
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {isAdding ? 'Add New Variant' : 'Edit Variant'}
                            </h3>
                            <Button variant="ghost" size="sm" onClick={handleCancel}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="SKU"
                                {...register('sku')}
                                error={errors.sku?.message}
                                placeholder="e.g., VAR-001"
                                disabled={!!editingVariant}
                            />
                            <Input
                                label="Name"
                                {...register('name')}
                                error={errors.name?.message}
                                placeholder="e.g., Size L, Red"
                            />
                            <Input
                                label="Price Override (Optional)"
                                type="number"
                                step="0.01"
                                {...register('price')}
                                error={errors.price?.message}
                                placeholder="Leave empty to use base price"
                            />
                            <Input
                                label="Stock Quantity"
                                type="number"
                                {...register('stockQuantity')}
                                error={errors.stockQuantity?.message}
                                placeholder="0"
                            />
                        </div>

                        <div className="flex items-center pt-2">
                            <label className="flex items-center cursor-pointer gap-3">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        {...register('isActive')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Active Status
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="outline" type="button" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isLoading}
                                leftIcon={isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Save className="w-4 h-4" />}
                            >
                                {isLoading ? 'Saving...' : 'Save Variant'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
};

export default VariantModal;
