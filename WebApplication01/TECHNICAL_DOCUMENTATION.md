# Product Management System - Technical Documentation

## 1. Approach to the Requirement

### Development Process Steps

1. **Requirements Analysis**
   - Identify core entities: Products, Categories, Variants, Attributes
   - Define scalability requirements and consistency guarantees
   - Identify critical edge cases

2. **Database Design**
   - Design normalized schema for strong consistency
   - Plan for extensibility (new attributes/features)
   - Define indexes for performance optimization

3. **API Design**
   - RESTful endpoints following best practices
   - Input validation strategy
   - Error handling and response standardization

4. **Implementation**
   - Set up EF Core with migrations
   - Implement repository pattern for data access
   - Build service layer with business logic
   - Create API controllers with validation

5. **Performance Optimization**
   - Implement Redis caching strategy
   - Add optimistic concurrency control
   - Query optimization with proper indexing

6. **Testing & Documentation**
   - Unit tests for business logic
   - Integration tests for APIs
   - API documentation with Swagger

---

## 2. Database Design

### Choice: SQL Server (Relational Database)

**Why SQL Server?**

1. **Strong Consistency**: ACID transactions ensure data integrity for critical e-commerce operations
2. **Complex Relationships**: Products have multiple relationships (categories, variants, attributes)
3. **Query Flexibility**: Complex queries for filtering, searching, and reporting
4. **Data Integrity**: Foreign keys and constraints prevent orphaned data
5. **Mature Ecosystem**: Excellent tooling, EF Core support, and enterprise features

**Why NOT NoSQL?**

- Product inventory requires strong consistency (can't oversell)
- Complex relational data (variants, categories, attributes)
- Need for ACID transactions (price updates, stock management)
- Schema benefits from structure and validation

### Database Schema

#### Core Tables

**1. Products**
```sql
- Id (PK, GUID)
- SKU (Unique, Indexed)
- Name
- Description
- BasePrice
- IsActive
- CreatedAt
- UpdatedAt
- RowVersion (for optimistic concurrency)
```

**2. Categories**
```sql
- Id (PK, GUID)
- Name
- ParentCategoryId (FK, Self-referencing for hierarchy)
- Description
- IsActive
```

**3. ProductCategories** (Many-to-Many)
```sql
- ProductId (FK)
- CategoryId (FK)
- IsPrimary (bool - one primary category per product)
```

**4. ProductVariants**
```sql
- Id (PK, GUID)
- ProductId (FK)
- SKU (Unique)
- Name (e.g., "Red - Large")
- Price (can override base price)
- StockQuantity
- IsActive
- RowVersion
```

**5. Attributes** (Extensible attribute system)
```sql
- Id (PK, GUID)
- Name (e.g., "Color", "Size", "Material")
- DataType (String, Number, Boolean, Date)
- IsRequired
```

**6. ProductAttributes**
```sql
- Id (PK, GUID)
- ProductId (FK)
- AttributeId (FK)
- Value (stored as string, parsed based on DataType)
```

**7. VariantAttributes**
```sql
- Id (PK, GUID)
- VariantId (FK)
- AttributeId (FK)
- Value
```

**8. ProductImages**
```sql
- Id (PK, GUID)
- ProductId (FK)
- ImageUrl
- AltText
- DisplayOrder
- IsPrimary
```

### Supporting Extensibility

The **Attributes** system (EAV pattern - Entity-Attribute-Value) allows:
- Adding new product properties without schema changes
- Different products having different attributes
- Type-safe attribute values with DataType field
- Easy filtering and searching on custom attributes

**Example**: Adding "Sustainability Rating" or "Fabric Type" requires only inserting new Attribute records, not altering tables.

### Indexes for Performance

```sql
- Products: SKU (Unique), Name, IsActive, CreatedAt
- ProductVariants: SKU (Unique), ProductId, StockQuantity
- ProductCategories: ProductId, CategoryId (Composite)
- ProductAttributes: ProductId, AttributeId (Composite)
- Categories: ParentCategoryId
```

---

## 3. Technology Stack Components

### Core Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | ASP.NET Core 8.0 | Web API framework |
| **Database** | SQL Server | Primary data store |
| **ORM** | Entity Framework Core 8.0 | Object-relational mapping |
| **Validation** | FluentValidation | Input validation |
| **Caching** | Redis (StackExchange.Redis) | Distributed caching |
| **API Documentation** | Swagger/OpenAPI | API documentation |
| **Serialization** | System.Text.Json | JSON handling |

### ORM Framework: Entity Framework Core

**Features Used:**
- Code-First migrations for version control
- Navigation properties for relationships
- Query optimization with Include/ThenInclude
- Change tracking for concurrency
- DbContext pooling for performance

**Configuration:**
- Fluent API for entity configuration
- Value converters for custom types
- Global query filters (soft delete)
- Index definitions

### Validation: FluentValidation

**Why FluentValidation over Data Annotations?**

1. **Separation of Concerns**: Validation logic separate from models
2. **Testability**: Easy to unit test validators
3. **Complexity**: Supports complex validation rules and dependencies
4. **Reusability**: Validators can be composed and reused
5. **Async Support**: Async validation rules (e.g., database checks)

**Example Validators:**
- `CreateProductValidator`: Validates product creation
- `UpdateProductValidator`: Validates updates with different rules
- `ProductVariantValidator`: Validates variant-specific rules

### Caching: Redis

**Cache Strategy:**

1. **Cache-Aside Pattern**
   - Check cache first
   - On miss, query database
   - Store result in cache

2. **Cache Keys:**
   ```
   product:{id}
   product:sku:{sku}
   products:category:{categoryId}:page:{page}
   product:{id}:variants
   ```

3. **TTL Strategy:**
   - Product details: 1 hour
   - Product lists: 15 minutes
   - Category data: 4 hours
   - Invalidate on updates

4. **Cache Invalidation:**
   - On product update: Clear product-specific keys
   - On variant update: Clear product and variant keys
   - On category change: Clear category-related keys

### Concurrency Control

**Optimistic Concurrency with RowVersion:**

1. **How it Works:**
   - Each entity has a `RowVersion` (timestamp) column
   - EF Core checks RowVersion on update
   - If changed, throws `DbUpdateConcurrencyException`

2. **Implementation:**
   ```csharp
   [Timestamp]
   public byte[] RowVersion { get; set; }
   ```

3. **Handling Conflicts:**
   - Catch exception in service layer
   - Return conflict error to client
   - Client can retry with latest data

4. **Critical Operations:**
   - Stock quantity updates (prevent overselling)
   - Price updates (prevent race conditions)
   - Product activation/deactivation

---

## 4. API and Data Handling

### API Design Principles

1. **RESTful Architecture**
   - Resource-based URLs
   - HTTP verbs for operations (GET, POST, PUT, DELETE)
   - Proper status codes

2. **Versioning**
   - URL versioning: `/api/v1/products`
   - Allows breaking changes without affecting clients

3. **Pagination**
   - All list endpoints support pagination
   - Default page size: 20
   - Max page size: 100

4. **Filtering & Sorting**
   - Query parameters for filtering
   - Sort by multiple fields
   - Search functionality

### API Endpoints

#### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products (paginated, filtered) |
| GET | `/api/v1/products/{id}` | Get product by ID |
| GET | `/api/v1/products/sku/{sku}` | Get product by SKU |
| POST | `/api/v1/products` | Create new product |
| PUT | `/api/v1/products/{id}` | Update product |
| DELETE | `/api/v1/products/{id}` | Delete product (soft delete) |
| GET | `/api/v1/products/{id}/variants` | Get product variants |

#### Product Variants

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/products/{productId}/variants` | Create variant |
| PUT | `/api/v1/products/{productId}/variants/{variantId}` | Update variant |
| DELETE | `/api/v1/products/{productId}/variants/{variantId}` | Delete variant |
| PATCH | `/api/v1/products/{productId}/variants/{variantId}/stock` | Update stock |

#### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories` | List categories (tree structure) |
| GET | `/api/v1/categories/{id}` | Get category |
| POST | `/api/v1/categories` | Create category |
| PUT | `/api/v1/categories/{id}` | Update category |
| GET | `/api/v1/categories/{id}/products` | Get products in category |

### Input Processing & Validation

**1. Request Flow:**
```
Client Request → Model Binding → FluentValidation → Controller → Service → Repository → Database
```

**2. Validation Layers:**

- **Model Binding**: Basic type validation
- **FluentValidation**: Business rule validation
- **Service Layer**: Complex business logic validation
- **Database**: Constraint validation (last resort)

**3. Validation Rules Examples:**

```csharp
// Product Creation
- Name: Required, 3-200 characters
- SKU: Required, unique, alphanumeric
- BasePrice: > 0
- Categories: At least one category
- Attributes: Valid attribute IDs, correct data types

// Variant Creation
- SKU: Required, unique
- Price: >= 0 (can be 0 if using base price)
- StockQuantity: >= 0
- Attributes: Must match product's allowed attributes
```

**4. Error Response Format:**

```json
{
  "success": false,
  "errors": [
    {
      "field": "SKU",
      "message": "SKU must be unique"
    }
  ],
  "timestamp": "2025-11-20T20:32:03Z"
}
```

### Output Validation & Formatting

**1. DTOs (Data Transfer Objects):**
- Separate models for requests and responses
- Never expose database entities directly
- Control what data is sent to clients

**2. Response Structure:**

```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 150,
    "totalPages": 8
  }
}
```

**3. Null Handling:**
- Nullable reference types enabled
- Explicit null checks
- Default values for optional fields

---

## 5. Performance Optimization

### Caching Strategy

**1. Multi-Level Caching:**

- **L1 - Memory Cache**: Hot data (categories, attributes)
- **L2 - Redis**: Distributed cache for scalability
- **L3 - Database**: Source of truth

**2. Cache Patterns:**

**Read-Through Cache:**
```csharp
public async Task<Product> GetProductAsync(Guid id)
{
    var cacheKey = $"product:{id}";
    
    // Try cache first
    var cached = await _cache.GetAsync<Product>(cacheKey);
    if (cached != null) return cached;
    
    // Cache miss - query database
    var product = await _dbContext.Products
        .Include(p => p.Categories)
        .Include(p => p.Attributes)
        .FirstOrDefaultAsync(p => p.Id == id);
    
    // Store in cache
    if (product != null)
    {
        await _cache.SetAsync(cacheKey, product, TimeSpan.FromHours(1));
    }
    
    return product;
}
```

**Write-Through Cache:**
```csharp
public async Task UpdateProductAsync(Product product)
{
    // Update database
    _dbContext.Products.Update(product);
    await _dbContext.SaveChangesAsync();
    
    // Invalidate cache
    await _cache.RemoveAsync($"product:{product.Id}");
    await _cache.RemoveAsync($"product:sku:{product.SKU}");
}
```

**3. Cache Invalidation Strategies:**

- **Time-based**: TTL for automatic expiration
- **Event-based**: Invalidate on updates
- **Pattern-based**: Clear related keys (e.g., all category caches)

### Concurrency Handling

**1. Optimistic Concurrency Control:**

```csharp
public async Task<Result> UpdateProductAsync(UpdateProductRequest request)
{
    try
    {
        var product = await _dbContext.Products.FindAsync(request.Id);
        
        // Update properties
        product.Name = request.Name;
        product.Price = request.Price;
        // RowVersion is automatically checked by EF Core
        
        await _dbContext.SaveChangesAsync();
        return Result.Success();
    }
    catch (DbUpdateConcurrencyException)
    {
        return Result.Failure("Product was modified by another user. Please refresh and try again.");
    }
}
```

**2. Stock Management Concurrency:**

```csharp
// Use database transaction with serializable isolation for critical stock updates
public async Task<Result> DecrementStockAsync(Guid variantId, int quantity)
{
    using var transaction = await _dbContext.Database.BeginTransactionAsync(
        IsolationLevel.Serializable);
    
    try
    {
        var variant = await _dbContext.ProductVariants
            .FirstOrDefaultAsync(v => v.Id == variantId);
        
        if (variant.StockQuantity < quantity)
        {
            return Result.Failure("Insufficient stock");
        }
        
        variant.StockQuantity -= quantity;
        await _dbContext.SaveChangesAsync();
        await transaction.CommitAsync();
        
        return Result.Success();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

**3. Distributed Locking (Redis):**

For operations requiring distributed locks across multiple instances:

```csharp
public async Task<Result> ProcessOrderAsync(Order order)
{
    var lockKey = $"lock:order:{order.Id}";
    var lockValue = Guid.NewGuid().ToString();
    
    // Acquire distributed lock
    var acquired = await _redis.StringSetAsync(
        lockKey, 
        lockValue, 
        TimeSpan.FromSeconds(30),
        When.NotExists
    );
    
    if (!acquired)
    {
        return Result.Failure("Order is being processed");
    }
    
    try
    {
        // Process order
        await ProcessOrderItemsAsync(order);
        return Result.Success();
    }
    finally
    {
        // Release lock
        await _redis.KeyDeleteAsync(lockKey);
    }
}
```

### Database Query Optimization

**1. Eager Loading:**
```csharp
// Load related data in single query
var products = await _dbContext.Products
    .Include(p => p.Categories)
    .Include(p => p.Variants)
    .Include(p => p.Images)
    .ToListAsync();
```

**2. Projection:**
```csharp
// Select only needed fields
var productSummaries = await _dbContext.Products
    .Select(p => new ProductSummaryDto
    {
        Id = p.Id,
        Name = p.Name,
        Price = p.BasePrice
    })
    .ToListAsync();
```

**3. AsNoTracking:**
```csharp
// Read-only queries don't need change tracking
var products = await _dbContext.Products
    .AsNoTracking()
    .ToListAsync();
```

**4. Compiled Queries:**
```csharp
// Pre-compile frequently used queries
private static readonly Func<AppDbContext, Guid, Task<Product>> GetProductById =
    EF.CompileAsyncQuery((AppDbContext context, Guid id) =>
        context.Products.FirstOrDefault(p => p.Id == id));
```

---

## 6. Edge Cases & Error Handling

### Critical Edge Cases Covered

1. **Concurrent Stock Updates**
   - Optimistic concurrency prevents overselling
   - Transaction isolation for stock decrements

2. **Duplicate SKUs**
   - Unique constraint on database
   - Validation before insert
   - Proper error messages

3. **Orphaned Variants**
   - Cascade delete configured
   - Soft delete preserves history

4. **Invalid Attribute Values**
   - Type validation based on DataType
   - Required attribute enforcement

5. **Circular Category References**
   - Validation prevents parent = child
   - Recursive query limits depth

6. **Cache Inconsistency**
   - Cache invalidation on updates
   - TTL as safety net

7. **Large Result Sets**
   - Mandatory pagination
   - Max page size limits

8. **Null/Empty Inputs**
   - FluentValidation catches all
   - Nullable reference types

9. **Price Precision**
   - Decimal type with proper precision
   - Validation for negative prices

10. **Image Upload Failures**
    - Rollback product creation
    - Retry mechanism

---

## 7. Scalability Considerations

### Horizontal Scalability

1. **Stateless API**: No server-side session state
2. **Distributed Cache**: Redis for shared cache across instances
3. **Database Connection Pooling**: Efficient connection reuse
4. **Load Balancing**: Multiple API instances behind load balancer

### Vertical Scalability

1. **Database Indexing**: Optimized queries
2. **Query Optimization**: Proper use of EF Core features
3. **Caching**: Reduce database load
4. **Async/Await**: Non-blocking I/O operations

### Future Enhancements

1. **Read Replicas**: Separate read/write databases
2. **CQRS**: Command Query Responsibility Segregation
3. **Event Sourcing**: Audit trail and state reconstruction
4. **Message Queue**: Async processing for heavy operations
5. **CDN**: Static asset delivery
6. **ElasticSearch**: Advanced product search

---

## 8. Security Considerations

1. **SQL Injection**: Prevented by EF Core parameterization
2. **Input Validation**: FluentValidation on all inputs
3. **Authentication/Authorization**: Ready for JWT/OAuth integration
4. **Rate Limiting**: Prevent abuse (can be added)
5. **HTTPS**: Enforced in production
6. **Sensitive Data**: Connection strings in environment variables

---

## Conclusion

This architecture provides:
- ✅ **Strong Consistency**: ACID transactions, optimistic concurrency
- ✅ **Scalability**: Caching, pagination, optimized queries
- ✅ **Extensibility**: Attribute system for new features
- ✅ **Reliability**: Comprehensive error handling and edge cases
- ✅ **Performance**: Multi-level caching, query optimization
- ✅ **Maintainability**: Clean architecture, separation of concerns
