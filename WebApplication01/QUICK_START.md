# Quick Start Guide

## Running the Application

### 1. Prerequisites Check

Make sure you have:
- ✅ .NET 8.0 SDK installed
- ✅ SQL Server or LocalDB installed
- ⚠️ Redis (optional - see note below)

**Note on Redis**: The application is configured to use Redis for caching. If you don't have Redis installed:

**Option A - Install Redis:**
```powershell
# Using Chocolatey
choco install redis-64
redis-server

# Or using Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

**Option B - Disable Redis temporarily:**
Comment out Redis configuration in `Program.cs` lines 28-35 and replace the cache service with a memory cache.

### 2. Build and Run

```bash
# Navigate to project directory
cd d:\Repositories\Competency-Test-0\WebApplication01\WebApplication01

# Restore packages
dotnet restore

# Build
dotnet build

# Run
dotnet run
```

### 3. Access the API

The application will start and automatically:
- ✅ Apply database migrations
- ✅ Seed sample data (2 products with variants)
- ✅ Open Swagger UI

**Swagger UI**: Navigate to `https://localhost:7xxx` (port will be shown in console)

## Testing the API

### Using Swagger UI (Recommended)

1. Open browser to the HTTPS URL shown in console
2. You'll see all available endpoints
3. Click "Try it out" on any endpoint
4. Fill in parameters and click "Execute"

### Sample Test Flow

1. **List Products**
   - GET `/api/v1/products`
   - Should return 2 sample products

2. **Get Product Details**
   - GET `/api/v1/products/{id}`
   - Copy an ID from the list response
   - Should return full product details with variants

3. **Get Product by SKU**
   - GET `/api/v1/products/sku/SHIRT-COTTON-001`
   - Should return the cotton t-shirt

4. **Get Product Variants**
   - GET `/api/v1/products/{productId}/variants`
   - Should return variants with stock quantities

5. **Create New Product**
   - POST `/api/v1/products`
   - Use the example JSON below

6. **Update Stock**
   - PATCH `/api/v1/products/{productId}/variants/{variantId}/stock`
   - Body: `{ "quantity": -5 }` (decrease by 5)

### Example: Create Product

```json
{
  "sku": "JACKET-001",
  "name": "Winter Jacket",
  "description": "Warm winter jacket",
  "basePrice": 99.99,
  "isActive": true,
  "categoryIds": ["{copy-category-id-from-existing-product}"],
  "primaryCategoryId": "{same-category-id}",
  "attributes": [],
  "images": [
    {
      "imageUrl": "https://via.placeholder.com/500x500?text=Winter+Jacket",
      "altText": "Winter Jacket",
      "displayOrder": 0,
      "isPrimary": true
    }
  ]
}
```

**Note**: You'll need to get a valid category ID from an existing product first.

### Example: Create Variant

```json
{
  "sku": "JACKET-001-BLACK-L",
  "name": "Black - Large",
  "price": 99.99,
  "stockQuantity": 25,
  "isActive": true,
  "attributes": []
}
```

## Sample Data

The application seeds the following data:

### Attributes
- Color (String)
- Size (String)
- Material (String)

### Categories
- Men's Clothing
- Women's Clothing
- Shirts (subcategory of Men's Clothing)

### Products

**1. Classic Cotton T-Shirt** (SKU: SHIRT-COTTON-001)
- Price: $29.99
- Variants:
  - Red - Medium (50 in stock)
  - Blue - Large (75 in stock)

**2. Premium Polo Shirt** (SKU: SHIRT-POLO-001)
- Price: $49.99
- Variants:
  - Black - Medium (30 in stock)

## Common Operations

### Filter Products

```
GET /api/v1/products?searchTerm=shirt&minPrice=20&maxPrice=50&isActive=true
```

### Pagination

```
GET /api/v1/products?page=1&pageSize=10
```

### Sort Products

```
GET /api/v1/products?sortBy=price&sortDescending=false
```

## Troubleshooting

### "Unable to connect to Redis"

**Solution 1**: Start Redis server
```bash
redis-server
```

**Solution 2**: Temporarily disable Redis in `Program.cs`

### "Cannot open database"

**Solution**: Ensure SQL Server/LocalDB is running
```bash
# Check if LocalDB is installed
sqllocaldb info

# Start LocalDB
sqllocaldb start mssqllocaldb
```

### "Migration not applied"

**Solution**: Manually apply migration
```bash
dotnet ef database update
```

### "Port already in use"

**Solution**: Change port in `Properties/launchSettings.json` or kill the process using the port

## Next Steps

1. ✅ Explore all endpoints in Swagger UI
2. ✅ Test concurrency by updating the same product twice
3. ✅ Test stock management with negative quantities
4. ✅ Try filtering and pagination
5. ✅ Review the code structure
6. ✅ Read `TECHNICAL_DOCUMENTATION.md` for architecture details

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-11-20T20:32:03Z"
}
```

### Error Response
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

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "metadata": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 150,
    "totalPages": 8,
    "hasPrevious": false,
    "hasNext": true
  },
  "timestamp": "2025-11-20T20:32:03Z"
}
```

## Performance Tips

1. **Use Pagination**: Always specify page and pageSize
2. **Cache Warming**: First request will be slower (cache miss)
3. **Filtering**: Use filters to reduce result set
4. **Sorting**: Sort on indexed fields (name, price, createdAt)

## Development Tips

1. **Watch Mode**: Use `dotnet watch run` for auto-reload
2. **Logging**: Check console for EF Core SQL queries
3. **Database**: Use SQL Server Management Studio to inspect data
4. **Redis**: Use `redis-cli` to inspect cache keys

```bash
# Watch mode
dotnet watch run

# View Redis keys
redis-cli
> KEYS *
> GET product:{some-guid}
```

Enjoy testing the API! 🚀
