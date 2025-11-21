using Microsoft.EntityFrameworkCore;
using WebApplication01.Application.DTOs;
using WebApplication01.Application.DTOs.Attributes;
using WebApplication01.Application.Interfaces;
using WebApplication01.Infrastructure.Caching;
using WebApplication01.Infrastructure.Data;

namespace WebApplication01.Application.Services;

public class AttributeService : IAttributeService
{
    private readonly ApplicationDbContext _context;
    private readonly ICacheService _cache;

    public AttributeService(ApplicationDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<ApiResponse<List<AttributeListDto>>> GetAllAttributesAsync()
    {
        var cacheKey = "attributes:all";

        // Try cache first
        var cached = await _cache.GetAsync<List<AttributeListDto>>(cacheKey);
        if (cached != null)
        {
            return ApiResponse<List<AttributeListDto>>.SuccessResponse(cached);
        }

        var attributes = await _context.Attributes
            .AsNoTracking()
            .OrderBy(a => a.Name)
            .Select(a => new AttributeListDto
            {
                Id = a.Id,
                Name = a.Name,
                DataType = a.DataType.ToString(),
                IsRequired = a.IsRequired
            })
            .ToListAsync();

        // Cache the result for 1 hour
        await _cache.SetAsync(cacheKey, attributes, TimeSpan.FromHours(1));

        return ApiResponse<List<AttributeListDto>>.SuccessResponse(attributes);
    }

    public async Task<ApiResponse<AttributeDto>> GetAttributeByIdAsync(Guid id)
    {
        var cacheKey = $"attribute:{id}";

        // Try cache first
        var cached = await _cache.GetAsync<AttributeDto>(cacheKey);
        if (cached != null)
        {
            return ApiResponse<AttributeDto>.SuccessResponse(cached);
        }

        var attribute = await _context.Attributes
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        if (attribute == null)
        {
            return ApiResponse<AttributeDto>.ErrorResponse("AttributeId", "Attribute not found");
        }

        var dto = new AttributeDto
        {
            Id = attribute.Id,
            Name = attribute.Name,
            DataType = attribute.DataType.ToString(),
            IsRequired = attribute.IsRequired,
            CreatedAt = attribute.CreatedAt,
            UpdatedAt = attribute.UpdatedAt
        };

        // Cache the result for 1 hour
        await _cache.SetAsync(cacheKey, dto, TimeSpan.FromHours(1));

        return ApiResponse<AttributeDto>.SuccessResponse(dto);
    }
}
