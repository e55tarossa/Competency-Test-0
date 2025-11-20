using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApplication01.Domain.Entities;

namespace WebApplication01.Infrastructure.Data.Configurations;

public class VariantAttributeConfiguration : IEntityTypeConfiguration<VariantAttribute>
{
    public void Configure(EntityTypeBuilder<VariantAttribute> builder)
    {
        builder.ToTable("VariantAttributes");
        
        builder.HasKey(va => va.Id);
        
        builder.Property(va => va.Value)
            .IsRequired()
            .HasMaxLength(500);
        
        // Composite index for efficient querying
        builder.HasIndex(va => new { va.VariantId, va.AttributeId });
        
        // Relationships
        builder.HasOne(va => va.Attribute)
            .WithMany(a => a.VariantAttributes)
            .HasForeignKey(va => va.AttributeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
