using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AttributeEntity = WebApplication01.Domain.Entities.Attribute;

namespace WebApplication01.Infrastructure.Data.Configurations;

public class AttributeConfiguration : IEntityTypeConfiguration<AttributeEntity>
{
    public void Configure(EntityTypeBuilder<AttributeEntity> builder)
    {
        builder.ToTable("Attributes");
        
        builder.HasKey(a => a.Id);
        
        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.HasIndex(a => a.Name);
        
        builder.Property(a => a.DataType)
            .IsRequired()
            .HasConversion<int>();
        
        builder.Property(a => a.IsRequired)
            .IsRequired()
            .HasDefaultValue(false);
        
        builder.Property(a => a.CreatedAt)
            .IsRequired();
        
        builder.Property(a => a.UpdatedAt)
            .IsRequired();
        
        builder.Property(a => a.RowVersion)
            .IsRowVersion();
    }
}
