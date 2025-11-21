using WebApplication01.Application.DTOs;
using WebApplication01.Application.DTOs.Categories;

namespace WebApplication01.Application.Interfaces;

public interface ICategoryService
{
    Task<ApiResponse<List<CategoryListDto>>> GetAllCategoriesAsync(bool? isActive = null);
    Task<ApiResponse<CategoryDto>> GetCategoryByIdAsync(Guid id);
}
