namespace WebApplication01.Domain.Entities;

/// <summary>
/// Product attribute value (EAV pattern)
/// </summary>
public class ProductAttribute
{
    public Guid Id { get; set; }
    
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    
    public Guid AttributeId { get; set; }
    public Attribute Attribute { get; set; } = null!;
    
    /// <summary>
    /// Attribute value stored as string, parsed based on Attribute.DataType
    /// </summary>
    public string Value { get; set; } = null!;
}
