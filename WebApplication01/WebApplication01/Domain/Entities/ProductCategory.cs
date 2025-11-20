namespace WebApplication01.Domain.Entities;

/// <summary>
/// Junction table for many-to-many relationship between Products and Categories
/// </summary>
public class ProductCategory
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    
    /// <summary>
    /// Indicates if this is the primary category for the product
    /// </summary>
    public bool IsPrimary { get; set; }
}
