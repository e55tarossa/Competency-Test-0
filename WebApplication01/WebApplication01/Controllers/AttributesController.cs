using Microsoft.AspNetCore.Mvc;
using WebApplication01.Application.DTOs;
using WebApplication01.Application.DTOs.Attributes;
using WebApplication01.Application.Interfaces;

namespace WebApplication01.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class AttributesController : ControllerBase
{
    private readonly IAttributeService _attributeService;

    public AttributesController(IAttributeService attributeService)
    {
        _attributeService = attributeService;
    }

    /// <summary>
    /// Get all attributes
    /// </summary>
    /// <returns>List of attributes</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<AttributeListDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<AttributeListDto>>>> GetAttributes()
    {
        var result = await _attributeService.GetAllAttributesAsync();
        return Ok(result);
    }

    /// <summary>
    /// Get attribute by ID
    /// </summary>
    /// <param name="id">Attribute unique identifier</param>
    /// <returns>Attribute details</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<AttributeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AttributeDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AttributeDto>>> GetAttributeById(Guid id)
    {
        var result = await _attributeService.GetAttributeByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }
}
