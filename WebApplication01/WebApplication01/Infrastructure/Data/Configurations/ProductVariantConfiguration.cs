using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApplication01.Domain.Entities;

namespace WebApplication01.Infrastructure.Data.Configurations;

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("ProductVariants");
        
        builder.HasKey(v => v.Id);
        
        builder.Property(v => v.SKU)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.HasIndex(v => v.SKU)
            .IsUnique();
        
        builder.Property(v => v.Name)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(v => v.Price)
            .HasPrecision(18, 2);
        
        builder.Property(v => v.StockQuantity)
            .IsRequired()
            .HasDefaultValue(0);
        
        builder.HasIndex(v => v.StockQuantity);
        
        builder.Property(v => v.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
        
        builder.Property(v => v.CreatedAt)
            .IsRequired();
        
        builder.Property(v => v.UpdatedAt)
            .IsRequired();
        
        builder.Property(v => v.RowVersion)
            .IsRowVersion();
        
        // Index for querying variants by product
        builder.HasIndex(v => v.ProductId);
        
        // Relationships
        builder.HasMany(v => v.VariantAttributes)
            .WithOne(va => va.Variant)
            .HasForeignKey(va => va.VariantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
