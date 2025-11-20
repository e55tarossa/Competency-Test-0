using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApplication01.Domain.Entities;

namespace WebApplication01.Infrastructure.Data.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("ProductImages");
        
        builder.HasKey(i => i.Id);
        
        builder.Property(i => i.ImageUrl)
            .IsRequired()
            .HasMaxLength(500);
        
        builder.Property(i => i.AltText)
            .HasMaxLength(200);
        
        builder.Property(i => i.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);
        
        builder.Property(i => i.IsPrimary)
            .IsRequired()
            .HasDefaultValue(false);
        
        // Index for querying images by product
        builder.HasIndex(i => i.ProductId);
        builder.HasIndex(i => new { i.ProductId, i.DisplayOrder });
        builder.HasIndex(i => new { i.ProductId, i.IsPrimary });
    }
}
