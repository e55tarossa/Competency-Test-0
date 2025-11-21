using WebApplication01.Application.DTOs;
using WebApplication01.Application.DTOs.Attributes;

namespace WebApplication01.Application.Interfaces;

public interface IAttributeService
{
    Task<ApiResponse<List<AttributeListDto>>> GetAllAttributesAsync();
    Task<ApiResponse<AttributeDto>> GetAttributeByIdAsync(Guid id);
}
