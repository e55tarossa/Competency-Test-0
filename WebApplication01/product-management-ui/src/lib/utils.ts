import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
    if (value === undefined || value === null || isNaN(value)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(value);
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(d);
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Parse number from string
 */
export function parseNumber(value: string): number | null {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
}

/**
 * Get stock status color
 */
export function getStockStatusColor(quantity: number): string {
    if (quantity === 0) return 'text-red-600 bg-red-50';
    if (quantity < 10) return 'text-orange-600 bg-orange-50';
    if (quantity < 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
}

/**
 * Get stock status text
 */
export function getStockStatusText(quantity: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    if (quantity < 50) return 'Medium Stock';
    return 'In Stock';
}

/**
 * Validate SKU format
 */
export function isValidSku(sku: string): boolean {
    // SKU should be 3-50 characters, alphanumeric with hyphens
    const skuRegex = /^[A-Z0-9-]{3,50}$/;
    return skuRegex.test(sku);
}

/**
 * Calculate pagination info
 */
export function getPaginationInfo(page: number, pageSize: number, totalCount: number) {
    const totalPages = Math.ceil(totalCount / pageSize);
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalCount);

    return {
        totalPages,
        startItem,
        endItem,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}

/**
 * Download file from URL
 */
export function downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const extension = getFileExtension(url).toLowerCase();
    return imageExtensions.includes(extension) || url.startsWith('data:image/');
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Convert file to Base64 string
 */
export function convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}
