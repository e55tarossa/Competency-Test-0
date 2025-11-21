import apiClient from '../lib/api-client';
import type { ApiResponse, Category } from '../types';

const API_VERSION = 'v1';
const BASE_PATH = `/api/${API_VERSION}/categories`;

export const categoryApi = {
    // Get all categories
    getCategories: async (): Promise<ApiResponse<Category[]>> => {
        // TODO: Remove mock when backend is ready
        try {
            const response = await apiClient.get<ApiResponse<Category[]>>(BASE_PATH);
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch categories, using mock data');
            return {
                success: true,
                data: [
                    { id: '1', name: 'Electronics', displayOrder: 1, isActive: true, createdAt: '', updatedAt: '' },
                    { id: '2', name: 'Clothing', displayOrder: 2, isActive: true, createdAt: '', updatedAt: '' },
                    { id: '3', name: 'Home & Garden', displayOrder: 3, isActive: true, createdAt: '', updatedAt: '' },
                    { id: '4', name: 'Books', displayOrder: 4, isActive: true, createdAt: '', updatedAt: '' },
                ]
            };
        }
    },

    // Get category by ID
    getCategoryById: async (id: string): Promise<ApiResponse<Category>> => {
        const response = await apiClient.get<ApiResponse<Category>>(`${BASE_PATH}/${id}`);
        return response.data;
    },
};
