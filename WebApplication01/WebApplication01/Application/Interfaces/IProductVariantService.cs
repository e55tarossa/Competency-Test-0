using WebApplication01.Application.DTOs;
using WebApplication01.Application.DTOs.Products;

namespace WebApplication01.Application.Interfaces;

/// <summary>
/// Service interface for managing product variants
/// </summary>
public interface IProductVariantService
{
    /// <summary>
    /// Get all variants for a specific product
    /// </summary>
    Task<ApiResponse<List<ProductVariantDto>>> GetVariantsByProductIdAsync(Guid productId);
    
    /// <summary>
    /// Create a new product variant
    /// </summary>
    Task<ApiResponse<ProductVariantDto>> CreateVariantAsync(Guid productId, CreateProductVariantRequest request);
    
    /// <summary>
    /// Update an existing product variant
    /// </summary>
    Task<ApiResponse<ProductVariantDto>> UpdateVariantAsync(Guid productId, Guid variantId, UpdateProductVariantRequest request);
    
    /// <summary>
    /// Delete a product variant
    /// </summary>
    Task<ApiResponse<bool>> DeleteVariantAsync(Guid productId, Guid variantId);
    
    /// <summary>
    /// Update stock quantity for a variant (increment or decrement)
    /// </summary>
    /// <param name="productId">Product identifier</param>
    /// <param name="variantId">Variant identifier</param>
    /// <param name="quantity">Quantity to add (positive) or remove (negative)</param>
    Task<ApiResponse<ProductVariantDto>> UpdateStockAsync(Guid productId, Guid variantId, int quantity);
}
