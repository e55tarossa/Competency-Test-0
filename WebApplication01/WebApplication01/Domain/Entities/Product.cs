namespace WebApplication01.Domain.Entities;

/// <summary>
/// Product entity representing a product in the e-commerce system
/// </summary>
public class Product : BaseEntity
{
    public string SKU { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal BasePrice { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<ProductAttribute> ProductAttributes { get; set; } = new List<ProductAttribute>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
}
