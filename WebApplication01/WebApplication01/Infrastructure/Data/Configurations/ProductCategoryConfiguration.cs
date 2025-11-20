using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApplication01.Domain.Entities;

namespace WebApplication01.Infrastructure.Data.Configurations;

public class ProductCategoryConfiguration : IEntityTypeConfiguration<ProductCategory>
{
    public void Configure(EntityTypeBuilder<ProductCategory> builder)
    {
        builder.ToTable("ProductCategories");
        
        // Composite key
        builder.HasKey(pc => new { pc.ProductId, pc.CategoryId });
        
        builder.Property(pc => pc.IsPrimary)
            .IsRequired()
            .HasDefaultValue(false);
        
        // Relationships
        builder.HasOne(pc => pc.Product)
            .WithMany(p => p.ProductCategories)
            .HasForeignKey(pc => pc.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(pc => pc.Category)
            .WithMany(c => c.ProductCategories)
            .HasForeignKey(pc => pc.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Index for querying products by category
        builder.HasIndex(pc => pc.CategoryId);
        builder.HasIndex(pc => pc.IsPrimary);
    }
}
