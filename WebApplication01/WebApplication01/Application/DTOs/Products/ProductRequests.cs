namespace WebApplication01.Application.DTOs.Products;

public class CreateProductRequest
{
    public string SKU { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal BasePrice { get; set; }
    public bool IsActive { get; set; } = true;
    
    public List<Guid> CategoryIds { get; set; } = new();
    public Guid? PrimaryCategoryId { get; set; }
    public List<ProductAttributeRequest> Attributes { get; set; } = new();
    public List<ProductImageRequest> Images { get; set; } = new();
}

public class UpdateProductRequest
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal BasePrice { get; set; }
    public bool IsActive { get; set; }
    
    public List<Guid> CategoryIds { get; set; } = new();
    public Guid? PrimaryCategoryId { get; set; }
    public List<ProductAttributeRequest> Attributes { get; set; } = new();
    public List<ProductImageRequest> Images { get; set; } = new();
}

public class ProductAttributeRequest
{
    public Guid AttributeId { get; set; }
    public string Value { get; set; } = null!;
}

public class ProductImageRequest
{
    public string ImageUrl { get; set; } = null!;
    public string AltText { get; set; } = null!;
    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }
}

public class CreateProductVariantRequest
{
    public string SKU { get; set; } = null!;
    public string Name { get; set; } = null!;
    public decimal? Price { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public List<VariantAttributeRequest> Attributes { get; set; } = new();
}

public class UpdateProductVariantRequest
{
    public string Name { get; set; } = null!;
    public decimal? Price { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
    public List<VariantAttributeRequest> Attributes { get; set; } = new();
}

public class VariantAttributeRequest
{
    public Guid AttributeId { get; set; }
    public string Value { get; set; } = null!;
}

public class UpdateStockRequest
{
    public int Quantity { get; set; }
}

public class ProductQueryParameters
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public Guid? CategoryId { get; set; }
    public bool? IsActive { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? SortBy { get; set; } = "CreatedAt";
    public bool SortDescending { get; set; } = true;
}
