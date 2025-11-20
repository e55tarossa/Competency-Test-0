using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApplication01.Domain.Entities;

namespace WebApplication01.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");
        
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.SKU)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.HasIndex(p => p.SKU)
            .IsUnique();
        
        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.HasIndex(p => p.Name);
        
        builder.Property(p => p.Description)
            .HasMaxLength(2000);
        
        builder.Property(p => p.BasePrice)
            .HasPrecision(18, 2)
            .IsRequired();
        
        builder.Property(p => p.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
        
        builder.HasIndex(p => p.IsActive);
        
        builder.Property(p => p.CreatedAt)
            .IsRequired();
        
        builder.HasIndex(p => p.CreatedAt);
        
        builder.Property(p => p.UpdatedAt)
            .IsRequired();
        
        // Optimistic concurrency
        builder.Property(p => p.RowVersion)
            .IsRowVersion();
        
        // Relationships
        builder.HasMany(p => p.Variants)
            .WithOne(v => v.Product)
            .HasForeignKey(v => v.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasMany(p => p.Images)
            .WithOne(i => i.Product)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasMany(p => p.ProductAttributes)
            .WithOne(pa => pa.Product)
            .HasForeignKey(pa => pa.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
