using Microsoft.AspNetCore.Mvc;
using WebApplication01.Application.DTOs;
using WebApplication01.Application.DTOs.Categories;
using WebApplication01.Application.Interfaces;

namespace WebApplication01.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    /// <summary>
    /// Get all categories with optional filtering by active status
    /// </summary>
    /// <param name="isActive">Optional filter for active/inactive categories</param>
    /// <returns>List of categories</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<CategoryListDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<CategoryListDto>>>> GetCategories([FromQuery] bool? isActive = null)
    {
        var result = await _categoryService.GetAllCategoriesAsync(isActive);
        return Ok(result);
    }

    /// <summary>
    /// Get category by ID
    /// </summary>
    /// <param name="id">Category unique identifier</param>
    /// <returns>Category details</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategoryById(Guid id)
    {
        var result = await _categoryService.GetCategoryByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }
}
