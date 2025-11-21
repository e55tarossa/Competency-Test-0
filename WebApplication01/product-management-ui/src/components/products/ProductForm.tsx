import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, Loader2, Tag, Layers } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { productApi } from '../../services/product.service';
import { categoryApi } from '../../services/category.service';
import { attributeApi } from '../../services/attribute.service';
import { useToastStore } from '../../store/toast.store';
import type { Product, CreateProductRequest, UpdateProductRequest, ProductImageRequest, ProductAttributeRequest } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card } from '../ui/Card';
import ImageUpload from './ImageUpload';

// Validation Schema
const productSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    sku: z.string().min(3, 'SKU must be at least 3 characters').regex(/^[A-Z0-9-]+$/, 'SKU must be alphanumeric with hyphens'),
    description: z.string().optional(),
    basePrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'Price must be a valid positive number'),
    isActive: z.boolean(),
    images: z.array(z.object({
        imageUrl: z.string(),
        altText: z.string().optional(),
        displayOrder: z.number(),
        isPrimary: z.boolean(),
    })).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
    product?: Product;
    onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
    const queryClient = useQueryClient();
    const addToast = useToastStore((state) => state.addToast);
    const isEditMode = !!product;

    // State for categories and attributes
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        product?.categories?.map(c => c.id) || []
    );
    const [attributeValues, setAttributeValues] = useState<Record<string, string>>(
        product?.attributes?.reduce((acc, attr) => ({ ...acc, [attr.attributeId]: attr.value }), {}) || {}
    );

    // Fetch categories and attributes
    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryApi.getCategories(),
    });

    const { data: attributesResponse } = useQuery({
        queryKey: ['attributes'],
        queryFn: () => attributeApi.getAttributes(),
    });

    const categories = categoriesResponse?.data || [];
    const attributes = attributesResponse?.data || [];

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product?.name || '',
            sku: product?.sku || '',
            description: product?.description || '',
            basePrice: product?.basePrice?.toString() || '',
            isActive: product?.isActive ?? true,
            images: product?.images?.map(img => ({
                imageUrl: img.imageUrl,
                altText: img.altText,
                displayOrder: img.displayOrder,
                isPrimary: img.isPrimary,
            })) || [],
        },
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateProductRequest) => productApi.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            addToast({
                type: 'success',
                message: 'Product created successfully',
            });
            onClose();
        },
        onError: (error) => {
            addToast({
                type: 'error',
                message: error.message || 'Failed to create product',
            });
        },
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: (data: UpdateProductRequest) => productApi.updateProduct(product!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            addToast({
                type: 'success',
                message: 'Product updated successfully',
            });
            onClose();
        },
        onError: (error) => {
            addToast({
                type: 'error',
                message: error.message || 'Failed to update product',
            });
        },
    });

    const onSubmit = (data: ProductFormData) => {
        const payload = {
            ...data,
            basePrice: parseFloat(data.basePrice),
            categoryIds: selectedCategories,
            attributes: Object.entries(attributeValues)
                .filter(([_, value]) => value.trim() !== '')
                .map(([attributeId, value]) => ({
                    attributeId,
                    value,
                })),
            images: data.images || [],
        };

        if (isEditMode) {
            updateMutation.mutate(payload as UpdateProductRequest);
        } else {
            createMutation.mutate(payload as CreateProductRequest);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    const handleCategoryToggle = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleAttributeChange = (attributeId: string, value: string) => {
        setAttributeValues(prev => ({
            ...prev,
            [attributeId]: value,
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
                <div className="flex items-center justify-between p-6 border-b border-gray-700/50 dark:border-gray-700 sticky top-0 bg-gray-900/80 dark:bg-gray-800/80 backdrop-blur-md z-10">
                    <h2 className="text-xl font-bold text-gray-100 dark:text-gray-100">
                        {isEditMode ? 'Edit Product' : 'Create New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Product Name"
                            {...register('name')}
                            error={errors.name?.message}
                            placeholder="e.g., Classic Cotton T-Shirt"
                        />
                        <Input
                            label="SKU"
                            {...register('sku')}
                            error={errors.sku?.message}
                            placeholder="e.g., SHIRT-COTTON-001"
                            disabled={isEditMode} // SKU typically shouldn't change
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-700/50 dark:border-gray-600/50 bg-gray-900/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 hover:border-gray-600/50 transition-all resize-none"
                            placeholder="Enter product description..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Base Price"
                            type="number"
                            step="0.01"
                            {...register('basePrice')}
                            error={errors.basePrice?.message}
                            placeholder="0.00"
                        />

                        <div className="flex items-center h-full pt-6">
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
                    </div>

                    {/* Categories */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Categories
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {categories.map((category) => (
                                <label
                                    key={category.id}
                                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${selectedCategories.includes(category.id)
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={() => handleCategoryToggle(category.id)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                        {category.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Attributes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Attributes
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {attributes.map((attribute) => (
                                <div key={attribute.id}>
                                    <Input
                                        label={attribute.name}
                                        value={attributeValues[attribute.id] || ''}
                                        onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                                        placeholder={`Enter ${attribute.name.toLowerCase()}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Product Images
                        </label>
                        <Controller
                            control={control}
                            name="images"
                            render={({ field: { value, onChange } }) => (
                                <ImageUpload
                                    images={value as ProductImageRequest[] || []}
                                    onChange={onChange}
                                />
                            )}
                        />
                    </div>

                    {/* Error Message */}
                    {(createMutation.isError || updateMutation.isError) && (
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                            {createMutation.error?.message || updateMutation.error?.message || 'An error occurred while saving'}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                            leftIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        >
                            {isLoading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ProductForm;
