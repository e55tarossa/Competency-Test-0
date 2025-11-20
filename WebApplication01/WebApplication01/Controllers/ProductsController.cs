using Microsoft.AspNetCore.Mvc;
using WebApplication01.Application.DTOs;
using WebApplication01.Application.DTOs.Products;
using WebApplication01.Application.Services;

namespace WebApplication01.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IProductVariantService _variantService;
    
    public ProductsController(IProductService productService, IProductVariantService variantService)
    {
        _productService = productService;
        _variantService = variantService;
    }
    
    /// <summary>
    /// Get paginated list of products with filtering and sorting
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<ProductSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResponse<ProductSummaryDto>>> GetProducts([FromQuery] ProductQueryParameters parameters)
    {
        var result = await _productService.GetProductsAsync(parameters);
        return Ok(result);
    }
    
    /// <summary>
    /// Get product by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetProductById(Guid id)
    {
        var result = await _productService.GetProductByIdAsync(id);
        
        if (!result.Success)
        {
            return NotFound(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Get product by SKU
    /// </summary>
    [HttpGet("sku/{sku}")]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetProductBySku(string sku)
    {
        var result = await _productService.GetProductBySkuAsync(sku);
        
        if (!result.Success)
        {
            return NotFound(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Create a new product
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<ProductDto>>> CreateProduct([FromBody] CreateProductRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => new ErrorDetail { Field = "Validation", Message = e.ErrorMessage })
                .ToList();
            
            return BadRequest(ApiResponse<ProductDto>.ErrorResponse(errors));
        }
        
        var result = await _productService.CreateProductAsync(request);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return CreatedAtAction(nameof(GetProductById), new { id = result.Data!.Id }, result);
    }
    
    /// <summary>
    /// Update an existing product
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<ProductDto>>> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => new ErrorDetail { Field = "Validation", Message = e.ErrorMessage })
                .ToList();
            
            return BadRequest(ApiResponse<ProductDto>.ErrorResponse(errors));
        }
        
        var result = await _productService.UpdateProductAsync(id, request);
        
        if (!result.Success)
        {
            if (result.Errors?.Any(e => e.Field == "Id") == true)
            {
                return NotFound(result);
            }
            
            if (result.Errors?.Any(e => e.Field == "Concurrency") == true)
            {
                return Conflict(result);
            }
            
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    /// <summary> 
    /// Delete a product
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteProduct(Guid id)
    {
        var result = await _productService.DeleteProductAsync(id);
        
        if (!result.Success)
        {
            return NotFound(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Get all variants for a product
    /// </summary>
    [HttpGet("{productId:guid}/variants")]
    [ProducesResponseType(typeof(ApiResponse<List<ProductVariantDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<List<ProductVariantDto>>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<List<ProductVariantDto>>>> GetProductVariants(Guid productId)
    {
        var result = await _variantService.GetVariantsByProductIdAsync(productId);
        
        if (!result.Success)
        {
            return NotFound(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Create a new product variant
    /// </summary>
    [HttpPost("{productId:guid}/variants")]
    [ProducesResponseType(typeof(ApiResponse<ProductVariantDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<ProductVariantDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<ProductVariantDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ProductVariantDto>>> CreateVariant(Guid productId, [FromBody] CreateProductVariantRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => new ErrorDetail { Field = "Validation", Message = e.ErrorMessage })
                .ToList();
            
            return BadRequest(ApiResponse<ProductVariantDto>.ErrorResponse(errors));
        }
        
        var result = await _variantService.CreateVariantAsync(productId, request);
        
        if (!result.Success)
        {
            if (result.Errors?.Any(e => e.Field == "ProductId") == true)
            {
                return NotFound(result);
            }
            
            return BadRequest(result);
        }
        
        return CreatedAtAction(nameof(GetProductVariants), new { productId }, result);
    }
    
    /// <summary>
    /// Update a product variant
    /// </summary>
    [HttpPut("{productId:guid}/variants/{variantId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ProductVariantDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProductVariantDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<ProductVariantDto>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<ProductVariantDto>), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<ProductVariantDto>>> UpdateVariant(
        Guid productId, 
        Guid variantId, 
        [FromBody] UpdateProductVariantRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => new ErrorDetail { Field = "Validation", Message = e.ErrorMessage })
                .ToList();
            
            return BadRequest(ApiResponse<ProductVariantDto>.ErrorResponse(errors));
        }
        
        var result = await _variantService.UpdateVariantAsync(productId, variantId, request);
        
        if (!result.Success)
        {
            if (result.Errors?.Any(e => e.Field == "VariantId") == true)
            {
                return NotFound(result);
            }
            
            if (result.Errors?.Any(e => e.Field == "Concurrency") == true)
            {
                return Conflict(result);
            }
            
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Delete a product variant
    /// </summary>
    [HttpDelete("{productId:guid}/variants/{variantId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteVariant(Guid productId, Guid variantId)
    {
        var result = await _variantService.DeleteVariantAsync(productId, variantId);
        
        if (!result.Success)
        {
            return NotFound(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Update stock quantity for a variant (increment or decrement)
    /// </summary>
    [HttpPatch("{productId:guid}/variants/{variantId:guid}/stock")]
    [ProducesResponseType(typeof(ApiResponse<ProductVariantDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProductVariantDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<ProductVariantDto>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<ProductVariantDto>), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<ProductVariantDto>>> UpdateStock(
        Guid productId, 
        Guid variantId, 
        [FromBody] UpdateStockRequest request)
    {
        var result = await _variantService.UpdateStockAsync(productId, variantId, request.Quantity);
        
        if (!result.Success)
        {
            if (result.Errors?.Any(e => e.Field == "VariantId") == true)
            {
                return NotFound(result);
            }
            
            if (result.Errors?.Any(e => e.Field == "Concurrency") == true)
            {
                return Conflict(result);
            }
            
            return BadRequest(result);
        }
        
        return Ok(result);
    }
}
