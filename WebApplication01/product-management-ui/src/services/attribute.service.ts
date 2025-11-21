import apiClient from '../lib/api-client';
import type { ApiResponse, Attribute } from '../types';

const API_VERSION = 'v1';
const BASE_PATH = `/api/${API_VERSION}/attributes`;

export const attributeApi = {
    // Get all attributes
    getAttributes: async (): Promise<ApiResponse<Attribute[]>> => {
        // TODO: Remove mock when backend is ready
        try {
            const response = await apiClient.get<ApiResponse<Attribute[]>>(BASE_PATH);
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch attributes, using mock data');
            return {
                success: true,
                data: [
                    { id: '1', name: 'Color', dataType: 'String', isRequired: false, displayOrder: 1, createdAt: '', updatedAt: '' },
                    { id: '2', name: 'Size', dataType: 'String', isRequired: false, displayOrder: 2, createdAt: '', updatedAt: '' },
                    { id: '3', name: 'Material', dataType: 'String', isRequired: false, displayOrder: 3, createdAt: '', updatedAt: '' },
                    { id: '4', name: 'Brand', dataType: 'String', isRequired: false, displayOrder: 4, createdAt: '', updatedAt: '' },
                    { id: '5', name: 'Weight', dataType: 'Number', isRequired: false, displayOrder: 5, createdAt: '', updatedAt: '' },
                ]
            };
        }
    },

    // Get attribute by ID
    getAttributeById: async (id: string): Promise<ApiResponse<Attribute>> => {
        const response = await apiClient.get<ApiResponse<Attribute>>(`${BASE_PATH}/${id}`);
        return response.data;
    },
};
