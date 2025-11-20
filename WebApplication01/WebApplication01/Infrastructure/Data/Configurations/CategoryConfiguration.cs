using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApplication01.Domain.Entities;

namespace WebApplication01.Infrastructure.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");
        
        builder.HasKey(c => c.Id);
        
        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.HasIndex(c => c.Name);
        
        builder.Property(c => c.Description)
            .HasMaxLength(500);
        
        builder.Property(c => c.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
        
        builder.Property(c => c.CreatedAt)
            .IsRequired();
        
        builder.Property(c => c.UpdatedAt)
            .IsRequired();
        
        builder.Property(c => c.RowVersion)
            .IsRowVersion();
        
        // Self-referencing relationship for hierarchy
        builder.HasOne(c => c.ParentCategory)
            .WithMany(c => c.SubCategories)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete for hierarchy
        
        builder.HasIndex(c => c.ParentCategoryId);
    }
}
