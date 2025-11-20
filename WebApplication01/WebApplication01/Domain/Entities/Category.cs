namespace WebApplication01.Domain.Entities;

/// <summary>
/// Category entity supporting hierarchical category structure
/// </summary>
public class Category : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    
    // Self-referencing for hierarchy
    public Guid? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    
    // Navigation properties
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();
    public ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();
}
