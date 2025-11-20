using FluentValidation;
using Microsoft.EntityFrameworkCore;
using WebApplication01.Application.DTOs.Products;
using WebApplication01.Infrastructure.Data;

namespace WebApplication01.Application.Validators;

public class CreateProductVariantRequestValidator : AbstractValidator<CreateProductVariantRequest>
{
    private readonly ApplicationDbContext _context;
    
    public CreateProductVariantRequestValidator(ApplicationDbContext context)
    {
        _context = context;
        
        RuleFor(x => x.SKU)
            .NotEmpty().WithMessage("SKU is required")
            .Length(3, 50).WithMessage("SKU must be between 3 and 50 characters")
            .Matches("^[a-zA-Z0-9-_]+$").WithMessage("SKU must contain only alphanumeric characters, hyphens, and underscores")
            .MustAsync(BeUniqueSKU).WithMessage("SKU already exists");
        
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .Length(3, 200).WithMessage("Name must be between 3 and 200 characters");
        
        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).When(x => x.Price.HasValue)
            .WithMessage("Price must be greater than or equal to 0")
            .LessThan(1000000).When(x => x.Price.HasValue)
            .WithMessage("Price must be less than 1,000,000");
        
        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Stock quantity must be greater than or equal to 0");
        
        RuleFor(x => x.Attributes)
            .MustAsync(AllAttributesExist).WithMessage("One or more attribute IDs are invalid");
    }
    
    private async Task<bool> BeUniqueSKU(string sku, CancellationToken cancellationToken)
    {
        return !await _context.ProductVariants.AnyAsync(v => v.SKU == sku, cancellationToken);
    }
    
    private async Task<bool> AllAttributesExist(List<VariantAttributeRequest> attributes, CancellationToken cancellationToken)
    {
        if (!attributes.Any()) return true;
        
        var attributeIds = attributes.Select(a => a.AttributeId).ToList();
        var existingCount = await _context.Attributes
            .Where(a => attributeIds.Contains(a.Id))
            .CountAsync(cancellationToken);
        
        return existingCount == attributeIds.Count;
    }
}
