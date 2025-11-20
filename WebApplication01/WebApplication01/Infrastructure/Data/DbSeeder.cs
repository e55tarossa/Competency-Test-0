using WebApplication01.Domain.Entities;
using WebApplication01.Infrastructure.Data;
using Attribute = WebApplication01.Domain.Entities.Attribute;

namespace WebApplication01.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Check if already seeded
        if (context.Products.Any())
        {
            return;
        }
        
        // Create Attributes
        var colorAttribute = new Attribute
        {
            Id = Guid.NewGuid(),
            Name = "Color",
            DataType = AttributeDataType.String,
            IsRequired = false
        };
        
        var sizeAttribute = new Attribute
        {
            Id = Guid.NewGuid(),
            Name = "Size",
            DataType = AttributeDataType.String,
            IsRequired = false
        };
        
        var materialAttribute = new Attribute
        {
            Id = Guid.NewGuid(),
            Name = "Material",
            DataType = AttributeDataType.String,
            IsRequired = false
        };
        
        context.Attributes.AddRange(colorAttribute, sizeAttribute, materialAttribute);
        
        // Create Categories
        var menCategory = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Men's Clothing",
            Description = "Clothing for men",
            IsActive = true
        };
        
        var womenCategory = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Women's Clothing",
            Description = "Clothing for women",
            IsActive = true
        };
        
        var shirtsCategory = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Shirts",
            Description = "All types of shirts",
            IsActive = true,
            ParentCategoryId = menCategory.Id
        };
        
        context.Categories.AddRange(menCategory, womenCategory, shirtsCategory);
        
        // Create Sample Product 1
        var product1 = new Product
        {
            Id = Guid.NewGuid(),
            SKU = "SHIRT-COTTON-001",
            Name = "Classic Cotton T-Shirt",
            Description = "Comfortable 100% cotton t-shirt perfect for everyday wear",
            BasePrice = 29.99m,
            IsActive = true
        };
        
        product1.ProductCategories.Add(new ProductCategory
        {
            ProductId = product1.Id,
            CategoryId = menCategory.Id,
            IsPrimary = true
        });
        
        product1.ProductCategories.Add(new ProductCategory
        {
            ProductId = product1.Id,
            CategoryId = shirtsCategory.Id,
            IsPrimary = false
        });
        
        product1.ProductAttributes.Add(new ProductAttribute
        {
            Id = Guid.NewGuid(),
            ProductId = product1.Id,
            AttributeId = materialAttribute.Id,
            Value = "100% Cotton"
        });
        
        product1.Images.Add(new ProductImage
        {
            Id = Guid.NewGuid(),
            ProductId = product1.Id,
            ImageUrl = "https://via.placeholder.com/500x500?text=Cotton+T-Shirt",
            AltText = "Classic Cotton T-Shirt",
            DisplayOrder = 0,
            IsPrimary = true
        });
        
        // Add variants for product 1
        var variant1 = new ProductVariant
        {
            Id = Guid.NewGuid(),
            ProductId = product1.Id,
            SKU = "SHIRT-COTTON-001-RED-M",
            Name = "Red - Medium",
            Price = null, // Uses base price
            StockQuantity = 50,
            IsActive = true
        };
        
        variant1.VariantAttributes.Add(new VariantAttribute
        {
            Id = Guid.NewGuid(),
            VariantId = variant1.Id,
            AttributeId = colorAttribute.Id,
            Value = "Red"
        });
        
        variant1.VariantAttributes.Add(new VariantAttribute
        {
            Id = Guid.NewGuid(),
            VariantId = variant1.Id,
            AttributeId = sizeAttribute.Id,
            Value = "Medium"
        });
        
        var variant2 = new ProductVariant
        {
            Id = Guid.NewGuid(),
            ProductId = product1.Id,
            SKU = "SHIRT-COTTON-001-BLUE-L",
            Name = "Blue - Large",
            Price = null,
            StockQuantity = 75,
            IsActive = true
        };
        
        variant2.VariantAttributes.Add(new VariantAttribute
        {
            Id = Guid.NewGuid(),
            VariantId = variant2.Id,
            AttributeId = colorAttribute.Id,
            Value = "Blue"
        });
        
        variant2.VariantAttributes.Add(new VariantAttribute
        {
            Id = Guid.NewGuid(),
            VariantId = variant2.Id,
            AttributeId = sizeAttribute.Id,
            Value = "Large"
        });
        
        product1.Variants.Add(variant1);
        product1.Variants.Add(variant2);
        
        // Create Sample Product 2
        var product2 = new Product
        {
            Id = Guid.NewGuid(),
            SKU = "SHIRT-POLO-001",
            Name = "Premium Polo Shirt",
            Description = "Elegant polo shirt with modern fit",
            BasePrice = 49.99m,
            IsActive = true
        };
        
        product2.ProductCategories.Add(new ProductCategory
        {
            ProductId = product2.Id,
            CategoryId = menCategory.Id,
            IsPrimary = true
        });
        
        product2.ProductAttributes.Add(new ProductAttribute
        {
            Id = Guid.NewGuid(),
            ProductId = product2.Id,
            AttributeId = materialAttribute.Id,
            Value = "Cotton Blend"
        });
        
        product2.Images.Add(new ProductImage
        {
            Id = Guid.NewGuid(),
            ProductId = product2.Id,
            ImageUrl = "https://via.placeholder.com/500x500?text=Polo+Shirt",
            AltText = "Premium Polo Shirt",
            DisplayOrder = 0,
            IsPrimary = true
        });
        
        var variant3 = new ProductVariant
        {
            Id = Guid.NewGuid(),
            ProductId = product2.Id,
            SKU = "SHIRT-POLO-001-BLACK-M",
            Name = "Black - Medium",
            Price = 49.99m,
            StockQuantity = 30,
            IsActive = true
        };
        
        variant3.VariantAttributes.Add(new VariantAttribute
        {
            Id = Guid.NewGuid(),
            VariantId = variant3.Id,
            AttributeId = colorAttribute.Id,
            Value = "Black"
        });
        
        variant3.VariantAttributes.Add(new VariantAttribute
        {
            Id = Guid.NewGuid(),
            VariantId = variant3.Id,
            AttributeId = sizeAttribute.Id,
            Value = "Medium"
        });
        
        product2.Variants.Add(variant3);
        
        context.Products.AddRange(product1, product2);
        
        await context.SaveChangesAsync();
    }
}
