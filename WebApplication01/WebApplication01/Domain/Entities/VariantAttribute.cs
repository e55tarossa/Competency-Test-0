namespace WebApplication01.Domain.Entities;

/// <summary>
/// Variant attribute value (EAV pattern for variants)
/// </summary>
public class VariantAttribute
{
    public Guid Id { get; set; }
    
    public Guid VariantId { get; set; }
    public ProductVariant Variant { get; set; } = null!;
    
    public Guid AttributeId { get; set; }
    public Attribute Attribute { get; set; } = null!;
    
    /// <summary>
    /// Attribute value stored as string, parsed based on Attribute.DataType
    /// </summary>
    public string Value { get; set; } = null!;
}
