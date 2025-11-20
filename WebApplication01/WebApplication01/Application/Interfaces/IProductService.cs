using WebApplication01.Application.DTOs;
using WebApplication01.Application.DTOs.Products;

namespace WebApplication01.Application.Interfaces;

/// <summary>
/// Service interface for managing products
/// </summary>
public interface IProductService
{
    /// <summary>
    /// Get paginated list of products with optional filtering and sorting
    /// </summary>
    Task<PagedResponse<ProductSummaryDto>> GetProductsAsync(ProductQueryParameters parameters);
    
    /// <summary>
    /// Get product by unique identifier
    /// </summary>
    Task<ApiResponse<ProductDto>> GetProductByIdAsync(Guid id);
    
    /// <summary>
    /// Get product by SKU
    /// </summary>
    Task<ApiResponse<ProductDto>> GetProductBySkuAsync(string sku);
    
    /// <summary>
    /// Create a new product
    /// </summary>
    Task<ApiResponse<ProductDto>> CreateProductAsync(CreateProductRequest request);
    
    /// <summary>
    /// Update an existing product
    /// </summary>
    Task<ApiResponse<ProductDto>> UpdateProductAsync(Guid id, UpdateProductRequest request);
    
    /// <summary>
    /// Delete a product
    /// </summary>
    Task<ApiResponse<bool>> DeleteProductAsync(Guid id);
}
