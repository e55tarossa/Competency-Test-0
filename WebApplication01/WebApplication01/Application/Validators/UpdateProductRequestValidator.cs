using FluentValidation;
using Microsoft.EntityFrameworkCore;
using WebApplication01.Application.DTOs.Products;
using WebApplication01.Infrastructure.Data;

namespace WebApplication01.Application.Validators;

public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    private readonly ApplicationDbContext _context;
    
    public UpdateProductRequestValidator(ApplicationDbContext context)
    {
        _context = context;
        
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .Length(3, 200).WithMessage("Name must be between 3 and 200 characters");
        
        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters");
        
        RuleFor(x => x.BasePrice)
            .GreaterThan(0).WithMessage("Base price must be greater than 0")
            .LessThan(1000000).WithMessage("Base price must be less than 1,000,000");
        
        RuleFor(x => x.CategoryIds)
            .NotEmpty().WithMessage("At least one category is required")
            .MustAsync(AllCategoriesExist).WithMessage("One or more category IDs are invalid");
        
        RuleFor(x => x.PrimaryCategoryId)
            .Must((request, primaryId) => !primaryId.HasValue || request.CategoryIds.Contains(primaryId.Value))
            .WithMessage("Primary category must be one of the selected categories");
        
        RuleFor(x => x.Attributes)
            .MustAsync(AllAttributesExist).WithMessage("One or more attribute IDs are invalid");
        
        RuleFor(x => x.Images)
            .Must(HaveAtMostOnePrimaryImage).WithMessage("Only one image can be marked as primary");
    }
    
    private async Task<bool> AllCategoriesExist(List<Guid> categoryIds, CancellationToken cancellationToken)
    {
        if (!categoryIds.Any()) return true;
        
        var existingCount = await _context.Categories
            .Where(c => categoryIds.Contains(c.Id))
            .CountAsync(cancellationToken);
        
        return existingCount == categoryIds.Count;
    }
    
    private async Task<bool> AllAttributesExist(List<ProductAttributeRequest> attributes, CancellationToken cancellationToken)
    {
        if (!attributes.Any()) return true;
        
        var attributeIds = attributes.Select(a => a.AttributeId).ToList();
        var existingCount = await _context.Attributes
            .Where(a => attributeIds.Contains(a.Id))
            .CountAsync(cancellationToken);
        
        return existingCount == attributeIds.Count;
    }
    
    private bool HaveAtMostOnePrimaryImage(List<ProductImageRequest> images)
    {
        return images.Count(i => i.IsPrimary) <= 1;
    }
}
