using Microsoft.EntityFrameworkCore;
using WebApplication01.Application.DTOs;
using WebApplication01.Application.DTOs.Products;
using WebApplication01.Application.Interfaces;
using WebApplication01.Domain.Entities;
using WebApplication01.Infrastructure.Caching;
using WebApplication01.Infrastructure.Data;

namespace WebApplication01.Application.Services;

public class ProductVariantService : IProductVariantService
{
    private readonly ApplicationDbContext _context;
    private readonly ICacheService _cache;
    
    public ProductVariantService(ApplicationDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }
    
    public async Task<ApiResponse<List<ProductVariantDto>>> GetVariantsByProductIdAsync(Guid productId)
    {
        var cacheKey = $"product:{productId}:variants";
        
        // Try cache first
        var cached = await _cache.GetAsync<List<ProductVariantDto>>(cacheKey);
        if (cached != null)
        {
            return ApiResponse<List<ProductVariantDto>>.SuccessResponse(cached);
        }
        
        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.Variants)
                .ThenInclude(v => v.VariantAttributes)
                    .ThenInclude(va => va.Attribute)
            .FirstOrDefaultAsync(p => p.Id == productId);
        
        if (product == null)
        {
            return ApiResponse<List<ProductVariantDto>>.ErrorResponse("ProductId", "Product not found");
        }
        
        var variants = product.Variants.Select(v => new ProductVariantDto
        {
            Id = v.Id,
            SKU = v.SKU,
            Name = v.Name,
            Price = v.Price ?? product.BasePrice,
            StockQuantity = v.StockQuantity,
            IsActive = v.IsActive,
            Attributes = v.VariantAttributes.Select(va => new VariantAttributeDto
            {
                AttributeId = va.Attribute.Id,
                AttributeName = va.Attribute.Name,
                Value = va.Value
            }).ToList()
        }).ToList();
        
        // Cache the result
        await _cache.SetAsync(cacheKey, variants, TimeSpan.FromMinutes(30));
        
        return ApiResponse<List<ProductVariantDto>>.SuccessResponse(variants);
    }
    
    public async Task<ApiResponse<ProductVariantDto>> CreateVariantAsync(Guid productId, CreateProductVariantRequest request)
    {
        var product = await _context.Products.FindAsync(productId);
        
        if (product == null)
        {
            return ApiResponse<ProductVariantDto>.ErrorResponse("ProductId", "Product not found");
        }
        
        var variant = new ProductVariant
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            SKU = request.SKU,
            Name = request.Name,
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            IsActive = request.IsActive
        };
        
        // Add attributes
        foreach (var attr in request.Attributes)
        {
            variant.VariantAttributes.Add(new VariantAttribute
            {
                Id = Guid.NewGuid(),
                VariantId = variant.Id,
                AttributeId = attr.AttributeId,
                Value = attr.Value
            });
        }
        
        _context.ProductVariants.Add(variant);
        await _context.SaveChangesAsync();
        
        // Reload with includes
        var createdVariant = await _context.ProductVariants
            .Include(v => v.Product)
            .Include(v => v.VariantAttributes)
                .ThenInclude(va => va.Attribute)
            .FirstAsync(v => v.Id == variant.Id);
        
        var dto = new ProductVariantDto
        {
            Id = createdVariant.Id,
            SKU = createdVariant.SKU,
            Name = createdVariant.Name,
            Price = createdVariant.Price ?? createdVariant.Product.BasePrice,
            StockQuantity = createdVariant.StockQuantity,
            IsActive = createdVariant.IsActive,
            Attributes = createdVariant.VariantAttributes.Select(va => new VariantAttributeDto
            {
                AttributeId = va.Attribute.Id,
                AttributeName = va.Attribute.Name,
                Value = va.Value
            }).ToList()
        };
        
        // Invalidate product cache
        await InvalidateProductCache(productId);
        
        return ApiResponse<ProductVariantDto>.SuccessResponse(dto);
    }
    
    public async Task<ApiResponse<ProductVariantDto>> UpdateVariantAsync(Guid productId, Guid variantId, UpdateProductVariantRequest request)
    {
        try
        {
            var variant = await _context.ProductVariants
                .Include(v => v.Product)
                .Include(v => v.VariantAttributes)
                .FirstOrDefaultAsync(v => v.Id == variantId && v.ProductId == productId);
            
            if (variant == null)
            {
                return ApiResponse<ProductVariantDto>.ErrorResponse("VariantId", "Variant not found");
            }
            
            // Update properties
            variant.Name = request.Name;
            variant.Price = request.Price;
            variant.StockQuantity = request.StockQuantity;
            variant.IsActive = request.IsActive;
            
            // Update attributes
            variant.VariantAttributes.Clear();
            foreach (var attr in request.Attributes)
            {
                variant.VariantAttributes.Add(new VariantAttribute
                {
                    Id = Guid.NewGuid(),
                    VariantId = variant.Id,
                    AttributeId = attr.AttributeId,
                    Value = attr.Value
                });
            }
            
            await _context.SaveChangesAsync();
            
            // Reload with includes
            var updatedVariant = await _context.ProductVariants
                .Include(v => v.Product)
                .Include(v => v.VariantAttributes)
                    .ThenInclude(va => va.Attribute)
                .FirstAsync(v => v.Id == variantId);
            
            var dto = new ProductVariantDto
            {
                Id = updatedVariant.Id,
                SKU = updatedVariant.SKU,
                Name = updatedVariant.Name,
                Price = updatedVariant.Price ?? updatedVariant.Product.BasePrice,
                StockQuantity = updatedVariant.StockQuantity,
                IsActive = updatedVariant.IsActive,
                Attributes = updatedVariant.VariantAttributes.Select(va => new VariantAttributeDto
                {
                    AttributeId = va.Attribute.Id,
                    AttributeName = va.Attribute.Name,
                    Value = va.Value
                }).ToList()
            };
            
            // Invalidate cache
            await InvalidateProductCache(productId);
            
            return ApiResponse<ProductVariantDto>.SuccessResponse(dto);
        }
        catch (DbUpdateConcurrencyException)
        {
            return ApiResponse<ProductVariantDto>.ErrorResponse("Concurrency", 
                "Variant was modified by another user. Please refresh and try again.");
        }
    }
    
    public async Task<ApiResponse<bool>> DeleteVariantAsync(Guid productId, Guid variantId)
    {
        var variant = await _context.ProductVariants
            .FirstOrDefaultAsync(v => v.Id == variantId && v.ProductId == productId);
        
        if (variant == null)
        {
            return ApiResponse<bool>.ErrorResponse("VariantId", "Variant not found");
        }
        
        _context.ProductVariants.Remove(variant);
        await _context.SaveChangesAsync();
        
        // Invalidate cache
        await InvalidateProductCache(productId);
        
        return ApiResponse<bool>.SuccessResponse(true);
    }
    
    public async Task<ApiResponse<ProductVariantDto>> UpdateStockAsync(Guid productId, Guid variantId, int quantity)
    {
        // Use serializable transaction for stock updates to prevent race conditions
        using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        
        try
        {
            var variant = await _context.ProductVariants
                .Include(v => v.Product)
                .Include(v => v.VariantAttributes)
                    .ThenInclude(va => va.Attribute)
                .FirstOrDefaultAsync(v => v.Id == variantId && v.ProductId == productId);
            
            if (variant == null)
            {
                return ApiResponse<ProductVariantDto>.ErrorResponse("VariantId", "Variant not found");
            }
            
            // Validate stock quantity
            if (quantity < 0 && Math.Abs(quantity) > variant.StockQuantity)
            {
                return ApiResponse<ProductVariantDto>.ErrorResponse("Quantity", "Insufficient stock");
            }
            
            variant.StockQuantity += quantity;
            
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            
            var dto = new ProductVariantDto
            {
                Id = variant.Id,
                SKU = variant.SKU,
                Name = variant.Name,
                Price = variant.Price ?? variant.Product.BasePrice,
                StockQuantity = variant.StockQuantity,
                IsActive = variant.IsActive,
                Attributes = variant.VariantAttributes.Select(va => new VariantAttributeDto
                {
                    AttributeId = va.Attribute.Id,
                    AttributeName = va.Attribute.Name,
                    Value = va.Value
                }).ToList()
            };
            
            // Invalidate cache
            await InvalidateProductCache(productId);
            
            return ApiResponse<ProductVariantDto>.SuccessResponse(dto);
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync();
            return ApiResponse<ProductVariantDto>.ErrorResponse("Concurrency", 
                "Stock was modified by another user. Please refresh and try again.");
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
    
    private async Task InvalidateProductCache(Guid productId)
    {
        await _cache.RemoveAsync($"product:{productId}");
        await _cache.RemoveAsync($"product:{productId}:variants");
        
        // Also invalidate SKU cache if needed
        var product = await _context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == productId);
        if (product != null)
        {
            await _cache.RemoveAsync($"product:sku:{product.SKU}");
        }
    }
}
