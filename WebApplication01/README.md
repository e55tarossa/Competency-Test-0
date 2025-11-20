# Product Management System

A scalable e-commerce product management API built with ASP.NET Core 8.0, featuring strong consistency, Redis caching, and comprehensive product variant management.

## Features

- ✅ **RESTful API** - Clean, resource-based endpoints
- ✅ **Strong Consistency** - ACID transactions with optimistic concurrency control
- ✅ **Scalable Architecture** - Redis caching, pagination, efficient queries
- ✅ **Flexible Product Attributes** - EAV pattern for extensible product properties
- ✅ **Product Variants** - Support for different sizes, colors, etc.
- ✅ **Stock Management** - Concurrency-safe stock updates
- ✅ **Input Validation** - FluentValidation with comprehensive rules
- ✅ **Hierarchical Categories** - Support for category trees
- ✅ **API Documentation** - Swagger/OpenAPI integration

## Technology Stack

- **Framework**: ASP.NET Core 8.0
- **Database**: SQL Server
- **ORM**: Entity Framework Core 8.0
- **Caching**: Redis (StackExchange.Redis)
- **Validation**: FluentValidation
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- .NET 8.0 SDK
- SQL Server (LocalDB or full instance)
- Redis Server (optional for development)

## Getting Started

### 1. Clone the Repository

```bash
cd d:\Repositories\Competency-Test-0\WebApplication01
```

### 2. Install Redis (Optional)

**Windows (using Chocolatey):**
```powershell
choco install redis-64
redis-server
```

**Or use Docker:**
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

**Note**: If Redis is not available, you can temporarily disable caching by modifying the service registration.

### 3. Update Connection Strings

Edit `appsettings.json` if needed:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ProductManagementDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True",
    "Redis": "localhost:6379"
  }
}
```

### 4. Restore Packages

```bash
dotnet restore
```

### 5. Create Database Migration

```bash
dotnet ef migrations add InitialCreate --project WebApplication01
```

### 6. Apply Migrations

```bash
dotnet ef database update --project WebApplication01
```

Or migrations will be applied automatically when running in Development mode.

### 7. Run the Application

```bash
dotnet run --project WebApplication01
```

The API will be available at:
- HTTPS: `https://localhost:7xxx`
- HTTP: `http://localhost:5xxx`
- Swagger UI: `https://localhost:7xxx` (root)

## API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products (paginated, filtered) |
| GET | `/api/v1/products/{id}` | Get product by ID |
| GET | `/api/v1/products/sku/{sku}` | Get product by SKU |
| POST | `/api/v1/products` | Create new product |
| PUT | `/api/v1/products/{id}` | Update product |
| DELETE | `/api/v1/products/{id}` | Delete product |

### Product Variants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products/{productId}/variants` | Get product variants |
| POST | `/api/v1/products/{productId}/variants` | Create variant |
| PUT | `/api/v1/products/{productId}/variants/{variantId}` | Update variant |
| DELETE | `/api/v1/products/{productId}/variants/{variantId}` | Delete variant |
| PATCH | `/api/v1/products/{productId}/variants/{variantId}/stock` | Update stock |

## Query Parameters

### GET /api/v1/products

```
?page=1
&pageSize=20
&searchTerm=shirt
&categoryId={guid}
&isActive=true
&minPrice=10.00
&maxPrice=100.00
&sortBy=name
&sortDescending=false
```

## Example Requests

### Create Product

```json
POST /api/v1/products
{
  "sku": "SHIRT-001",
  "name": "Cotton T-Shirt",
  "description": "Comfortable cotton t-shirt",
  "basePrice": 29.99,
  "isActive": true,
  "categoryIds": ["{category-guid}"],
  "primaryCategoryId": "{category-guid}",
  "attributes": [
    {
      "attributeId": "{attribute-guid}",
      "value": "Cotton"
    }
  ],
  "images": [
    {
      "imageUrl": "https://example.com/image.jpg",
      "altText": "Cotton T-Shirt",
      "displayOrder": 0,
      "isPrimary": true
    }
  ]
}
```

### Create Variant

```json
POST /api/v1/products/{productId}/variants
{
  "sku": "SHIRT-001-RED-L",
  "name": "Red - Large",
  "price": 29.99,
  "stockQuantity": 100,
  "isActive": true,
  "attributes": [
    {
      "attributeId": "{color-attribute-guid}",
      "value": "Red"
    },
    {
      "attributeId": "{size-attribute-guid}",
      "value": "Large"
    }
  ]
}
```

### Update Stock

```json
PATCH /api/v1/products/{productId}/variants/{variantId}/stock
{
  "quantity": -5  // Decrease by 5 (e.g., after sale)
}
```

## Database Schema

### Core Tables

- **Products** - Main product information
- **Categories** - Hierarchical category structure
- **ProductCategories** - Many-to-many relationship
- **ProductVariants** - Product variations (size, color, etc.)
- **Attributes** - Extensible attribute definitions
- **ProductAttributes** - Product-level attribute values
- **VariantAttributes** - Variant-level attribute values
- **ProductImages** - Product images

## Architecture Highlights

### Caching Strategy

- **Cache-Aside Pattern**: Check cache first, query DB on miss
- **TTL**: 1 hour for products, 30 minutes for variants
- **Invalidation**: On updates, deletes
- **Keys**: `product:{id}`, `product:sku:{sku}`, `product:{id}:variants`

### Concurrency Control

- **Optimistic Concurrency**: RowVersion (timestamp) on all entities
- **Stock Updates**: Serializable transactions to prevent overselling
- **Conflict Handling**: Returns 409 Conflict with error message

### Validation

- **FluentValidation**: Comprehensive input validation
- **Async Validation**: Database checks for uniqueness
- **Type Validation**: Attribute value type checking
- **Business Rules**: Category requirements, price ranges, etc.

## Performance Considerations

1. **Indexes**: Strategic indexes on SKU, Name, CategoryId, StockQuantity
2. **AsNoTracking**: Used for read-only queries
3. **Pagination**: Mandatory with configurable page size (max 100)
4. **Eager Loading**: Include related data to avoid N+1 queries
5. **Connection Pooling**: Automatic with EF Core
6. **Redis**: Distributed cache for horizontal scaling

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "errors": [
    {
      "field": "SKU",
      "message": "SKU already exists"
    }
  ],
  "timestamp": "2025-11-20T20:32:03Z"
}
```

## Testing

### Using Swagger UI

1. Navigate to `https://localhost:7xxx`
2. Explore and test all endpoints interactively
3. View request/response schemas

### Using curl

```bash
# Get products
curl -X GET "https://localhost:7xxx/api/v1/products?page=1&pageSize=10"

# Create product
curl -X POST "https://localhost:7xxx/api/v1/products" \
  -H "Content-Type: application/json" \
  -d @product.json
```

## Troubleshooting

### Database Connection Issues

- Ensure SQL Server/LocalDB is running
- Check connection string in `appsettings.json`
- Verify database exists: `dotnet ef database update`

### Redis Connection Issues

- Ensure Redis server is running: `redis-cli ping`
- Check Redis connection string
- Temporarily disable caching if needed

### Migration Issues

```bash
# Remove last migration
dotnet ef migrations remove --project WebApplication01

# Recreate migration
dotnet ef migrations add InitialCreate --project WebApplication01

# Apply migration
dotnet ef database update --project WebApplication01
```

## Documentation

See `TECHNICAL_DOCUMENTATION.md` for detailed technical documentation including:
- Database design rationale
- Technology stack decisions
- API design principles
- Performance optimization strategies
- Scalability considerations

## License

This project is for assessment purposes.
