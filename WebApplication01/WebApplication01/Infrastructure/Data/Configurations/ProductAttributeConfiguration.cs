using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApplication01.Domain.Entities;

namespace WebApplication01.Infrastructure.Data.Configurations;

public class ProductAttributeConfiguration : IEntityTypeConfiguration<ProductAttribute>
{
    public void Configure(EntityTypeBuilder<ProductAttribute> builder)
    {
        builder.ToTable("ProductAttributes");
        
        builder.HasKey(pa => pa.Id);
        
        builder.Property(pa => pa.Value)
            .IsRequired()
            .HasMaxLength(500);
        
        // Composite index for efficient querying
        builder.HasIndex(pa => new { pa.ProductId, pa.AttributeId });
        
        // Relationships
        builder.HasOne(pa => pa.Attribute)
            .WithMany(a => a.ProductAttributes)
            .HasForeignKey(pa => pa.AttributeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
