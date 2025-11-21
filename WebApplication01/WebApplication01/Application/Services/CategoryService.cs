using Microsoft.EntityFrameworkCore;
using WebApplication01.Application.DTOs;
using WebApplication01.Application.DTOs.Categories;
using WebApplication01.Application.Interfaces;
using WebApplication01.Infrastructure.Caching;
using WebApplication01.Infrastructure.Data;

namespace WebApplication01.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;
    private readonly ICacheService _cache;

    public CategoryService(ApplicationDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<ApiResponse<List<CategoryListDto>>> GetAllCategoriesAsync(bool? isActive = null)
    {
        var cacheKey = $"categories:all:{isActive?.ToString() ?? "null"}";

        // Try cache first
        var cached = await _cache.GetAsync<List<CategoryListDto>>(cacheKey);
        if (cached != null)
        {
            return ApiResponse<List<CategoryListDto>>.SuccessResponse(cached);
        }

        var query = _context.Categories.AsNoTracking();

        if (isActive.HasValue)
        {
            query = query.Where(c => c.IsActive == isActive.Value);
        }

        var categories = await query
            .OrderBy(c => c.Name)
            .Select(c => new CategoryListDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IsActive = c.IsActive,
                ParentCategoryId = c.ParentCategoryId,
                SubCategoriesCount = c.SubCategories.Count
            })
            .ToListAsync();

        // Cache the result for 1 hour
        await _cache.SetAsync(cacheKey, categories, TimeSpan.FromHours(1));

        return ApiResponse<List<CategoryListDto>>.SuccessResponse(categories);
    }

    public async Task<ApiResponse<CategoryDto>> GetCategoryByIdAsync(Guid id)
    {
        var cacheKey = $"category:{id}";

        // Try cache first
        var cached = await _cache.GetAsync<CategoryDto>(cacheKey);
        if (cached != null)
        {
            return ApiResponse<CategoryDto>.SuccessResponse(cached);
        }

        var category = await _context.Categories
            .AsNoTracking()
            .Include(c => c.ParentCategory)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return ApiResponse<CategoryDto>.ErrorResponse("CategoryId", "Category not found");
        }

        var dto = new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            IsActive = category.IsActive,
            ParentCategoryId = category.ParentCategoryId,
            ParentCategoryName = category.ParentCategory?.Name,
            DisplayOrder = 0,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };

        // Cache the result for 1 hour
        await _cache.SetAsync(cacheKey, dto, TimeSpan.FromHours(1));

        return ApiResponse<CategoryDto>.SuccessResponse(dto);
    }
}
