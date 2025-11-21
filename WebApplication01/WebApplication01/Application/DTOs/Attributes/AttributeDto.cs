namespace WebApplication01.Application.DTOs.Attributes;

public class AttributeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string DataType { get; set; } = null!;
    public bool IsRequired { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class AttributeListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string DataType { get; set; } = null!;
    public bool IsRequired { get; set; }
}
