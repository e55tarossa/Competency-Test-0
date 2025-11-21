// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    errors?: ApiError[];
    metadata?: PaginationMetadata;
    timestamp?: string;
}

export interface ApiError {
    field?: string;
    message: string;
}

export interface PaginationMetadata {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Product Types
export interface Product {
    id: string;
    sku: string;
    name: string;
    description?: string;
    basePrice: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    rowVersion?: string;
    categories: Category[];
    primaryCategory?: Category;
    attributes: ProductAttribute[];
    images: ProductImage[];
    variants?: ProductVariant[];
}

export interface ProductVariant {
    id: string;
    productId: string;
    sku: string;
    name: string;
    price?: number;
    stockQuantity: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    rowVersion?: string;
    attributes: VariantAttribute[];
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Attribute {
    id: string;
    name: string;
    description?: string;
    dataType: 'String' | 'Number' | 'Boolean' | 'Date';
    isRequired: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductAttribute {
    attributeId: string;
    attribute?: Attribute;
    value: string;
}

export interface VariantAttribute {
    attributeId: string;
    attribute?: Attribute;
    value: string;
}

export interface ProductImage {
    id?: string;
    imageUrl: string;
    altText?: string;
    displayOrder: number;
    isPrimary: boolean;
}

// Request Types
export interface CreateProductRequest {
    sku: string;
    name: string;
    description?: string;
    basePrice: number;
    isActive: boolean;
    categoryIds: string[];
    primaryCategoryId?: string;
    attributes: ProductAttributeRequest[];
    images: ProductImageRequest[];
}

export interface UpdateProductRequest {
    name: string;
    description?: string;
    basePrice: number;
    isActive: boolean;
    categoryIds: string[];
    primaryCategoryId?: string;
    attributes: ProductAttributeRequest[];
    images: ProductImageRequest[];
}

export interface ProductAttributeRequest {
    attributeId: string;
    value: string;
}

export interface ProductImageRequest {
    imageUrl: string;
    altText?: string;
    displayOrder: number;
    isPrimary: boolean;
}

export interface CreateVariantRequest {
    sku: string;
    name: string;
    price?: number;
    stockQuantity: number;
    isActive: boolean;
    attributes: VariantAttributeRequest[];
}

export interface UpdateVariantRequest {
    name: string;
    price?: number;
    stockQuantity: number;
    isActive: boolean;
    attributes: VariantAttributeRequest[];
}

export interface VariantAttributeRequest {
    attributeId: string;
    value: string;
}

export interface UpdateStockRequest {
    quantity: number;
}

// Query Parameters
export interface ProductQueryParams {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    categoryId?: string;
    isActive?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'name' | 'price' | 'sku' | 'createdAt';
    sortDescending?: boolean;
}

// UI State Types
export interface ProductFilters {
    searchTerm: string;
    categoryId: string;
    isActive: boolean | null;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
    sortDescending: boolean;
}

export interface TableState {
    page: number;
    pageSize: number;
    sortBy: string;
    sortDescending: boolean;
}
