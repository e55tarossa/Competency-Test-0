using Microsoft.EntityFrameworkCore;
using WebApplication01.Application.DTOs;
using WebApplication01.Application.DTOs.Products;
using WebApplication01.Application.Interfaces;
using WebApplication01.Domain.Entities;
using WebApplication01.Infrastructure.Caching;
using WebApplication01.Infrastructure.Data;

namespace WebApplication01.Application.Services;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;
    private readonly ICacheService _cache;
    private const int MaxPageSize = 100;
    
    public ProductService(ApplicationDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }
    
    public async Task<PagedResponse<ProductSummaryDto>> GetProductsAsync(ProductQueryParameters parameters)
    {
        // Validate and adjust pagination
        parameters.Page = Math.Max(1, parameters.Page);
        parameters.PageSize = Math.Min(Math.Max(1, parameters.PageSize), MaxPageSize);
        
        var query = _context.Products.AsNoTracking().AsQueryable();
        
        // Apply filters
        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var searchTerm = parameters.SearchTerm.ToLower();
            query = query.Where(p => 
                p.Name.ToLower().Contains(searchTerm) || 
                p.SKU.ToLower().Contains(searchTerm) ||
                p.Description.ToLower().Contains(searchTerm));
        }
        
        if (parameters.IsActive.HasValue)
        {
            query = query.Where(p => p.IsActive == parameters.IsActive.Value);
        }
        
        if (parameters.MinPrice.HasValue)
        {
            query = query.Where(p => p.BasePrice >= parameters.MinPrice.Value);
        }
        
        if (parameters.MaxPrice.HasValue)
        {
            query = query.Where(p => p.BasePrice <= parameters.MaxPrice.Value);
        }
        
        if (parameters.CategoryId.HasValue)
        {
            query = query.Where(p => p.ProductCategories.Any(pc => pc.CategoryId == parameters.CategoryId.Value));
        }
        
        // Get total count before pagination
        var totalCount = await query.CountAsync();
        
        // Apply sorting
        query = parameters.SortBy?.ToLower() switch
        {
            "name" => parameters.SortDescending 
                ? query.OrderByDescending(p => p.Name) 
                : query.OrderBy(p => p.Name),
            "price" => parameters.SortDescending 
                ? query.OrderByDescending(p => p.BasePrice) 
                : query.OrderBy(p => p.BasePrice),
            "sku" => parameters.SortDescending 
                ? query.OrderByDescending(p => p.SKU) 
                : query.OrderBy(p => p.SKU),
            _ => parameters.SortDescending 
                ? query.OrderByDescending(p => p.CreatedAt) 
                : query.OrderBy(p => p.CreatedAt)
        };
        
        // Apply pagination
        var products = await query
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(p => new ProductSummaryDto
            {
                Id = p.Id,
                SKU = p.SKU,
                Name = p.Name,
                BasePrice = p.BasePrice,
                IsActive = p.IsActive,
                PrimaryImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary) != null 
                    ? p.Images.First(i => i.IsPrimary).ImageUrl 
                    : p.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault() != null
                        ? p.Images.OrderBy(i => i.DisplayOrder).First().ImageUrl
                        : null,
                PrimaryCategoryName = p.ProductCategories.FirstOrDefault(pc => pc.IsPrimary) != null
                    ? p.ProductCategories.First(pc => pc.IsPrimary).Category.Name
                    : p.ProductCategories.FirstOrDefault() != null
                        ? p.ProductCategories.First().Category.Name
                        : null
            })
            .ToListAsync();
        
        var totalPages = (int)Math.Ceiling(totalCount / (double)parameters.PageSize);
        
        return new PagedResponse<ProductSummaryDto>
        {
            Success = true,
            Data = products,
            Metadata = new PaginationMetadata
            {
                Page = parameters.Page,
                PageSize = parameters.PageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            }
        };
    }
    
    public async Task<ApiResponse<ProductDto>> GetProductByIdAsync(Guid id)
    {
        var cacheKey = $"product:{id}";
        
        // Try cache first
        var cached = await _cache.GetAsync<ProductDto>(cacheKey);
        if (cached != null)
        {
            return ApiResponse<ProductDto>.SuccessResponse(cached);
        }
        
        // Cache miss - query database
        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.ProductCategories)
                .ThenInclude(pc => pc.Category)
            .Include(p => p.ProductAttributes)
                .ThenInclude(pa => pa.Attribute)
            .Include(p => p.Images)
            .Include(p => p.Variants)
                .ThenInclude(v => v.VariantAttributes)
                    .ThenInclude(va => va.Attribute)
            .FirstOrDefaultAsync(p => p.Id == id);
        
        if (product == null)
        {
            return ApiResponse<ProductDto>.ErrorResponse("Id", "Product not found");
        }
        
        var dto = MapToProductDto(product);
        
        // Cache the result
        await _cache.SetAsync(cacheKey, dto, TimeSpan.FromHours(1));
        
        return ApiResponse<ProductDto>.SuccessResponse(dto);
    }
    
    public async Task<ApiResponse<ProductDto>> GetProductBySkuAsync(string sku)
    {
        var cacheKey = $"product:sku:{sku}";
        
        // Try cache first
        var cached = await _cache.GetAsync<ProductDto>(cacheKey);
        if (cached != null)
        {
            return ApiResponse<ProductDto>.SuccessResponse(cached);
        }
        
        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.ProductCategories)
                .ThenInclude(pc => pc.Category)
            .Include(p => p.ProductAttributes)
                .ThenInclude(pa => pa.Attribute)
            .Include(p => p.Images)
            .Include(p => p.Variants)
                .ThenInclude(v => v.VariantAttributes)
                    .ThenInclude(va => va.Attribute)
            .FirstOrDefaultAsync(p => p.SKU == sku);
        
        if (product == null)
        {
            return ApiResponse<ProductDto>.ErrorResponse("SKU", "Product not found");
        }
        
        var dto = MapToProductDto(product);
        
        // Cache the result
        await _cache.SetAsync(cacheKey, dto, TimeSpan.FromHours(1));
        
        return ApiResponse<ProductDto>.SuccessResponse(dto);
    }
    
    public async Task<ApiResponse<ProductDto>> CreateProductAsync(CreateProductRequest request)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            SKU = request.SKU,
            Name = request.Name,
            Description = request.Description,
            BasePrice = request.BasePrice,
            IsActive = request.IsActive
        };
        
        // Add categories
        foreach (var categoryId in request.CategoryIds)
        {
            product.ProductCategories.Add(new ProductCategory
            {
                ProductId = product.Id,
                CategoryId = categoryId,
                IsPrimary = categoryId == request.PrimaryCategoryId
            });
        }
        
        // Add attributes
        foreach (var attr in request.Attributes)
        {
            product.ProductAttributes.Add(new ProductAttribute
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                AttributeId = attr.AttributeId,
                Value = attr.Value
            });
        }
        
        // Add images
        foreach (var img in request.Images)
        {
            product.Images.Add(new ProductImage
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                ImageUrl = img.ImageUrl,
                AltText = img.AltText,
                DisplayOrder = img.DisplayOrder,
                IsPrimary = img.IsPrimary
            });
        }
        
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        
        // Reload with includes
        var createdProduct = await _context.Products
            .Include(p => p.ProductCategories)
                .ThenInclude(pc => pc.Category)
            .Include(p => p.ProductAttributes)
                .ThenInclude(pa => pa.Attribute)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .FirstAsync(p => p.Id == product.Id);
        
        var dto = MapToProductDto(createdProduct);
        
        // Cache the new product
        await _cache.SetAsync($"product:{product.Id}", dto, TimeSpan.FromHours(1));
        await _cache.SetAsync($"product:sku:{product.SKU}", dto, TimeSpan.FromHours(1));
        
        return ApiResponse<ProductDto>.SuccessResponse(dto);
    }
    
    public async Task<ApiResponse<ProductDto>> UpdateProductAsync(Guid id, UpdateProductRequest request)
    {
        try
        {
            // First, delete existing related entities to make EF not confuse with concurrency
            var existingCategories = await _context.ProductCategories
                .Where(pc => pc.ProductId == id)
                .ToListAsync();
            
            var existingAttributes = await _context.ProductAttributes
                .Where(pa => pa.ProductId == id)
                .ToListAsync();
            
            var existingImages = await _context.ProductImages
                .Where(pi => pi.ProductId == id)
                .ToListAsync();
            
            _context.ProductCategories.RemoveRange(existingCategories);
            _context.ProductAttributes.RemoveRange(existingAttributes);
            _context.ProductImages.RemoveRange(existingImages);
            
            // Now get the product (without related entities since we deleted them)
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id);
            
            if (product == null)
            {
                return ApiResponse<ProductDto>.ErrorResponse("Id", "Product not found");
            }
            
            // Update basic properties
            product.Name = request.Name;
            product.Description = request.Description;
            product.BasePrice = request.BasePrice;
            product.IsActive = request.IsActive;
            
            // Add new categories
            var newCategories = request.CategoryIds.Select(categoryId => new ProductCategory
            {
                ProductId = product.Id,
                CategoryId = categoryId,
                IsPrimary = categoryId == request.PrimaryCategoryId
            }).ToList();
            
            await _context.ProductCategories.AddRangeAsync(newCategories);
            
            // Add new attributes
            var newAttributes = request.Attributes.Select(attr => new ProductAttribute
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                AttributeId = attr.AttributeId,
                Value = attr.Value
            }).ToList();
            
            await _context.ProductAttributes.AddRangeAsync(newAttributes);
            
            // Add new images
            var newImages = request.Images.Select(img => new ProductImage
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                ImageUrl = img.ImageUrl,
                AltText = img.AltText,
                DisplayOrder = img.DisplayOrder,
                IsPrimary = img.IsPrimary
            }).ToList();
            
            await _context.ProductImages.AddRangeAsync(newImages);
            
            await _context.SaveChangesAsync();
            
            // Invalidate cache
            await _cache.RemoveAsync($"product:{product.Id}");
            await _cache.RemoveAsync($"product:sku:{product.SKU}");
            
            // Reload and return
            var updatedProduct = await _context.Products
                .AsNoTracking()
                .Include(p => p.ProductCategories)
                    .ThenInclude(pc => pc.Category)
                .Include(p => p.ProductAttributes)
                    .ThenInclude(pa => pa.Attribute)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                    .ThenInclude(v => v.VariantAttributes)
                        .ThenInclude(va => va.Attribute)
                .FirstAsync(p => p.Id == id);
            
            var dto = MapToProductDto(updatedProduct);
            
            return ApiResponse<ProductDto>.SuccessResponse(dto);
        }
        catch (DbUpdateConcurrencyException)
        {
            return ApiResponse<ProductDto>.ErrorResponse("Concurrency", 
                "Product was modified by another user. Please refresh and try again.");
        }
    }
    
    public async Task<ApiResponse<bool>> DeleteProductAsync(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        
        if (product == null)
        {
            return ApiResponse<bool>.ErrorResponse("Id", "Product not found");
        }
        
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        
        // Invalidate cache
        await _cache.RemoveAsync($"product:{id}");
        await _cache.RemoveAsync($"product:sku:{product.SKU}");
        
        return ApiResponse<bool>.SuccessResponse(true);
    }
    
    private ProductDto MapToProductDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            SKU = product.SKU,
            Name = product.Name,
            Description = product.Description,
            BasePrice = product.BasePrice,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt,
            Categories = product.ProductCategories.Select(pc => new CategoryDto
            {
                Id = pc.Category.Id,
                Name = pc.Category.Name,
                Description = pc.Category.Description,
                IsPrimary = pc.IsPrimary
            }).ToList(),
            Attributes = product.ProductAttributes.Select(pa => new ProductAttributeDto
            {
                AttributeId = pa.Attribute.Id,
                AttributeName = pa.Attribute.Name,
                Value = pa.Value,
                DataType = pa.Attribute.DataType.ToString()
            }).ToList(),
            Images = product.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                AltText = i.AltText,
                DisplayOrder = i.DisplayOrder,
                IsPrimary = i.IsPrimary
            }).ToList(),
            Variants = product.Variants.Select(v => new ProductVariantDto
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
            }).ToList()
        };
    }
}
