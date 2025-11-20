namespace WebApplication01.Domain.Entities;

/// <summary>
/// Attribute definition (e.g., Color, Size, Material)
/// </summary>
public class Attribute : BaseEntity
{
    public string Name { get; set; } = null!;
    public AttributeDataType DataType { get; set; }
    public bool IsRequired { get; set; }
    
    // Navigation properties
    public ICollection<ProductAttribute> ProductAttributes { get; set; } = new List<ProductAttribute>();
    public ICollection<VariantAttribute> VariantAttributes { get; set; } = new List<VariantAttribute>();
}

/// <summary>
/// Supported data types for attributes
/// </summary>
public enum AttributeDataType
{
    String = 0,
    Number = 1,
    Boolean = 2,
    Date = 3,
    Decimal = 4
}
