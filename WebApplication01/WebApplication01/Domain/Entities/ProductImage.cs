namespace WebApplication01.Domain.Entities;

/// <summary>
/// Product image entity
/// </summary>
public class ProductImage
{
    public Guid Id { get; set; }
    
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    
    public string ImageUrl { get; set; } = null!;
    public string AltText { get; set; } = null!;
    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }
}
