import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add timestamp to prevent caching
        if (config.params) {
            config.params._t = Date.now();
        } else {
            config.params = { _t: Date.now() };
        }

        // Log request in development
        if (import.meta.env.DEV) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
                params: config.params,
                data: config.data,
            });
        }

        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Log response in development
        if (import.meta.env.DEV) {
            console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                data: response.data,
            });
        }

        return response;
    },
    (error: AxiosError<ApiResponse<unknown>>) => {
        // Handle different error types
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            console.error(`[API Error] ${status}`, {
                url: error.config?.url,
                errors: data?.errors,
            });

            // Handle specific status codes
            switch (status) {
                case 400:
                    // Bad Request - validation errors
                    break;
                case 401:
                    // Unauthorized
                    console.error('Unauthorized access');
                    break;
                case 403:
                    // Forbidden
                    console.error('Access forbidden');
                    break;
                case 404:
                    // Not Found
                    console.error('Resource not found');
                    break;
                case 409:
                    // Conflict - concurrency error
                    console.error('Concurrency conflict - resource was modified');
                    break;
                case 500:
                    // Internal Server Error
                    console.error('Server error');
                    break;
                default:
                    console.error('Unknown error occurred');
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('[API Error] No response received', {
                url: error.config?.url,
                message: 'Network error or server is not responding',
            });
        } else {
            // Error in request configuration
            console.error('[API Error] Request configuration error', error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;

// Helper function to handle API errors
export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse<unknown>>;

        if (axiosError.response?.data?.errors && axiosError.response.data.errors.length > 0) {
            return axiosError.response.data.errors.map(e => e.message).join(', ');
        }

        if (axiosError.response?.status === 409) {
            return 'This resource was modified by another user. Please refresh and try again.';
        }

        if (axiosError.response?.status === 404) {
            return 'Resource not found.';
        }

        if (axiosError.message === 'Network Error') {
            return 'Unable to connect to the server. Please check your connection.';
        }

        return axiosError.message || 'An unexpected error occurred';
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

// Helper function to check if error is a validation error
export const isValidationError = (error: unknown): boolean => {
    if (axios.isAxiosError(error)) {
        return error.response?.status === 400;
    }
    return false;
};

// Helper function to check if error is a concurrency error
export const isConcurrencyError = (error: unknown): boolean => {
    if (axios.isAxiosError(error)) {
        return error.response?.status === 409;
    }
    return false;
};
