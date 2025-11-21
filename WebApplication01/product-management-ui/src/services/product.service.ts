import apiClient from '../lib/api-client';
import type {
    ApiResponse,
    Product,
    ProductVariant,
    CreateProductRequest,
    UpdateProductRequest,
    CreateVariantRequest,
    UpdateVariantRequest,
    UpdateStockRequest,
    ProductQueryParams,
} from '../types';

const API_VERSION = 'v1';
const BASE_PATH = `/api/${API_VERSION}/products`;

// Product API
export const productApi = {
    // Get all products with filters and pagination
    getProducts: async (params?: ProductQueryParams): Promise<ApiResponse<Product[]>> => {
        const response = await apiClient.get<ApiResponse<Product[]>>(BASE_PATH, { params });
        return response.data;
    },

    // Get product by ID
    getProductById: async (id: string): Promise<ApiResponse<Product>> => {
        const response = await apiClient.get<ApiResponse<Product>>(`${BASE_PATH}/${id}`);
        return response.data;
    },

    // Get product by SKU
    getProductBySku: async (sku: string): Promise<ApiResponse<Product>> => {
        const response = await apiClient.get<ApiResponse<Product>>(`${BASE_PATH}/sku/${sku}`);
        return response.data;
    },

    // Create new product
    createProduct: async (data: CreateProductRequest): Promise<ApiResponse<Product>> => {
        const response = await apiClient.post<ApiResponse<Product>>(BASE_PATH, data);
        return response.data;
    },

    // Update product
    updateProduct: async (id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> => {
        const response = await apiClient.put<ApiResponse<Product>>(`${BASE_PATH}/${id}`, data);
        return response.data;
    },

    // Delete product
    deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
        const response = await apiClient.delete<ApiResponse<void>>(`${BASE_PATH}/${id}`);
        return response.data;
    },

    // --- Variant Methods ---

    // Get all variants for a product
    getVariants: async (productId: string): Promise<ApiResponse<ProductVariant[]>> => {
        const response = await apiClient.get<ApiResponse<ProductVariant[]>>(
            `${BASE_PATH}/${productId}/variants`
        );
        return response.data;
    },

    // Create new variant
    createVariant: async (
        productId: string,
        data: CreateVariantRequest
    ): Promise<ApiResponse<ProductVariant>> => {
        const response = await apiClient.post<ApiResponse<ProductVariant>>(
            `${BASE_PATH}/${productId}/variants`,
            data
        );
        return response.data;
    },

    // Update variant
    updateVariant: async (
        productId: string,
        variantId: string,
        data: UpdateVariantRequest
    ): Promise<ApiResponse<ProductVariant>> => {
        const response = await apiClient.put<ApiResponse<ProductVariant>>(
            `${BASE_PATH}/${productId}/variants/${variantId}`,
            data
        );
        return response.data;
    },

    // Update stock
    updateStock: async (
        productId: string,
        variantId: string,
        data: UpdateStockRequest
    ): Promise<ApiResponse<ProductVariant>> => {
        const response = await apiClient.patch<ApiResponse<ProductVariant>>(
            `${BASE_PATH}/${productId}/variants/${variantId}/stock`,
            data
        );
        return response.data;
    },

    // Delete variant
    deleteVariant: async (productId: string, variantId: string): Promise<ApiResponse<void>> => {
        const response = await apiClient.delete<ApiResponse<void>>(
            `${BASE_PATH}/${productId}/variants/${variantId}`
        );
        return response.data;
    },
};
