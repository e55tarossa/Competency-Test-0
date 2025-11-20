namespace WebApplication01.Domain.Entities;

/// <summary>
/// Product variant entity (e.g., different sizes, colors)
/// </summary>
public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    
    public string SKU { get; set; } = null!;
    public string Name { get; set; } = null!;
    
    /// <summary>
    /// Variant-specific price. If null, uses product's base price
    /// </summary>
    public decimal? Price { get; set; }
    
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public ICollection<VariantAttribute> VariantAttributes { get; set; } = new List<VariantAttribute>();
}
