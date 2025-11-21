namespace WebApplication01.Application.DTOs.Products;

public class ProductDto
{
    public Guid Id { get; set; }
    public string SKU { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal BasePrice { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public List<CategoryDto> Categories { get; set; } = new();
    public List<ProductAttributeDto> Attributes { get; set; } = new();
    public List<ProductImageDto> Images { get; set; } = new();
    public List<ProductVariantDto> Variants { get; set; } = new();
}

public class ProductSummaryDto
{
    public Guid Id { get; set; }
    public string SKU { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal BasePrice { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public string? PrimaryCategoryName { get; set; }
    public List<ProductVariantDto> Variants { get; set; } = new();
}

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsPrimary { get; set; }
}

public class ProductAttributeDto
{
    public Guid AttributeId { get; set; }
    public string AttributeName { get; set; } = null!;
    public string Value { get; set; } = null!;
    public string DataType { get; set; } = null!;
}

public class ProductImageDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = null!;
    public string AltText { get; set; } = null!;
    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }
}

public class ProductVariantDto
{
    public Guid Id { get; set; }
    public string SKU { get; set; } = null!;
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
    public List<VariantAttributeDto> Attributes { get; set; } = new();
}

public class VariantAttributeDto
{
    public Guid AttributeId { get; set; }
    public string AttributeName { get; set; } = null!;
    public string Value { get; set; } = null!;
}
