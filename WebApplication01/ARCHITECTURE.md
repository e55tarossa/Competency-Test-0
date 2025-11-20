# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  (Browser, Postman, Mobile App, etc.)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      API LAYER                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ProductsController                           │  │
│  │  - GET /api/v1/products                                  │  │
│  │  - POST /api/v1/products                                 │  │
│  │  - PUT /api/v1/products/{id}                             │  │
│  │  - PATCH .../variants/{id}/stock                         │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                  │
│  ┌────────────▼─────────────────────────────────────────────┐  │
│  │         FluentValidation Middleware                       │  │
│  │  - Request validation                                     │  │
│  │  - Business rule validation                               │  │
│  └────────────┬─────────────────────────────────────────────┘  │
└───────────────┼──────────────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │  ProductService      │    │ ProductVariantService         │  │
│  │  - Business Logic    │    │ - Stock Management            │  │
│  │  - Caching Logic     │    │ - Concurrency Control         │  │
│  │  - Error Handling    │    │ - Transaction Management      │  │
│  └──────┬───────────────┘    └───────────┬──────────────────┘  │
│         │                                 │                      │
└─────────┼─────────────────────────────────┼──────────────────────┘
          │                                 │
          │        ┌────────────────────────┘
          │        │
┌─────────▼────────▼──────────────────────────────────────────────┐
│                    CACHING LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              RedisCacheService                            │  │
│  │  - Cache-Aside Pattern                                   │  │
│  │  - TTL Management (1 hour)                               │  │
│  │  - Pattern-based Invalidation                            │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                  │
│  ┌────────────▼─────────────────────────────────────────────┐  │
│  │         Redis Server (localhost:6379)                     │  │
│  │  Keys: product:{id}, product:sku:{sku}, etc.            │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
          │
          │ Cache Miss
          │
┌─────────▼──────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         ApplicationDbContext (EF Core)                    │  │
│  │  - Change Tracking                                        │  │
│  │  - Optimistic Concurrency (RowVersion)                   │  │
│  │  - Automatic Timestamps                                  │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                  │
│  ┌────────────▼─────────────────────────────────────────────┐  │
│  │         Entity Configurations (Fluent API)                │  │
│  │  - ProductConfiguration                                   │  │
│  │  - CategoryConfiguration                                  │  │
│  │  - VariantConfiguration                                   │  │
│  └────────────┬─────────────────────────────────────────────┘  │
└───────────────┼──────────────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         SQL Server (ProductManagementDb)                  │  │
│  │                                                           │  │
│  │  Tables:                                                  │  │
│  │  ├─ Products (with indexes on SKU, Name, IsActive)      │  │
│  │  ├─ Categories (hierarchical)                            │  │
│  │  ├─ ProductCategories (many-to-many)                     │  │
│  │  ├─ ProductVariants (with stock tracking)                │  │
│  │  ├─ Attributes (EAV pattern)                             │  │
│  │  ├─ ProductAttributes                                    │  │
│  │  ├─ VariantAttributes                                    │  │
│  │  └─ ProductImages                                        │  │
│  │                                                           │  │
│  │  Features:                                                │  │
│  │  ├─ ACID Transactions                                    │  │
│  │  ├─ Foreign Key Constraints                              │  │
│  │  ├─ Unique Constraints (SKU)                             │  │
│  │  ├─ Indexes for Performance                              │  │
│  │  └─ RowVersion for Concurrency                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Request Flow Diagram

### Read Operation (GET Product)

```
Client Request
    │
    ▼
Controller (ProductsController)
    │
    ▼
Service (ProductService.GetProductByIdAsync)
    │
    ├─────────────────────────────┐
    │                             │
    ▼                             │
Check Redis Cache                 │
    │                             │
    ├─ Cache Hit? ────────────────┤
    │   (Return cached data)      │
    │                             │
    ▼ Cache Miss                  │
Query Database (EF Core)          │
    │                             │
    ▼                             │
Map to DTO                        │
    │                             │
    ▼                             │
Store in Redis Cache              │
    │                             │
    └─────────────────────────────┤
                                  │
                                  ▼
                          Return Response
                                  │
                                  ▼
                          Client receives JSON
```

### Write Operation (Update Product)

```
Client Request (PUT)
    │
    ▼
FluentValidation
    │
    ├─ Valid? ─────────┐
    │                  │
    ▼ Yes              ▼ No
Controller             Return 400 Bad Request
    │
    ▼
Service (ProductService.UpdateProductAsync)
    │
    ▼
Begin Transaction
    │
    ▼
Load Entity from Database
    │
    ▼
Check RowVersion (Optimistic Concurrency)
    │
    ├─ Conflict? ──────────┐
    │                      │
    ▼ No                   ▼ Yes
Update Entity              Return 409 Conflict
    │
    ▼
SaveChanges (RowVersion updated automatically)
    │
    ▼
Commit Transaction
    │
    ▼
Invalidate Redis Cache
    │  ├─ product:{id}
    │  ├─ product:sku:{sku}
    │  └─ product:{id}:variants
    │
    ▼
Return Updated DTO
    │
    ▼
Client receives 200 OK
```

### Stock Update Operation (PATCH Stock)

```
Client Request (PATCH)
    │
    ▼
Controller
    │
    ▼
Service (ProductVariantService.UpdateStockAsync)
    │
    ▼
Begin SERIALIZABLE Transaction
    │  (Prevents concurrent stock modifications)
    │
    ▼
Load Variant with Lock
    │
    ▼
Validate Stock Quantity
    │
    ├─ Sufficient? ────────┐
    │                      │
    ▼ Yes                  ▼ No
Update Stock               Return 400 Bad Request
    │                      "Insufficient stock"
    ▼
SaveChanges
    │
    ▼
Commit Transaction
    │
    ▼
Invalidate Cache
    │
    ▼
Return Updated Variant
    │
    ▼
Client receives 200 OK
```

## Data Flow Diagram

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │
       │ HTTP Request (JSON)
       │
       ▼
┌──────────────────────────────────────────┐
│         ASP.NET Core Pipeline            │
│  ┌────────────────────────────────────┐  │
│  │  1. Routing                         │  │
│  │  2. Model Binding                   │  │
│  │  3. FluentValidation                │  │
│  │  4. Controller Action               │  │
│  └────────────────────────────────────┘  │
└──────┬───────────────────────────────────┘
       │
       │ Request DTO
       │
       ▼
┌──────────────────────────────────────────┐
│         Service Layer                    │
│  ┌────────────────────────────────────┐  │
│  │  Business Logic                     │  │
│  │  ├─ Validation                      │  │
│  │  ├─ Authorization (future)          │  │
│  │  ├─ Caching Logic                   │  │
│  │  └─ Error Handling                  │  │
│  └────────────────────────────────────┘  │
└──────┬───────────────────────────────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│   Redis     │   │  Database   │
│   Cache     │   │  (EF Core)  │
│             │   │             │
│  Get/Set    │   │  LINQ       │
│  Delete     │   │  Queries    │
│  Pattern    │   │  Tracking   │
└─────────────┘   └─────────────┘
       │                 │
       │                 ▼
       │          ┌─────────────┐
       │          │ SQL Server  │
       │          │             │
       │          │ Transactions│
       │          │ Constraints │
       │          │ Indexes     │
       │          └─────────────┘
       │                 │
       └─────────┬───────┘
                 │
                 │ Domain Entity
                 │
                 ▼
┌──────────────────────────────────────────┐
│         Mapping Layer                    │
│  ┌────────────────────────────────────┐  │
│  │  Entity → DTO Mapping               │  │
│  │  ├─ ProductDto                      │  │
│  │  ├─ ProductSummaryDto                │  │
│  │  └─ ProductVariantDto                │  │
│  └────────────────────────────────────┘  │
└──────┬───────────────────────────────────┘
       │
       │ Response DTO
       │
       ▼
┌──────────────────────────────────────────┐
│         Response Wrapper                 │
│  ┌────────────────────────────────────┐  │
│  │  ApiResponse<T>                     │  │
│  │  ├─ success: true/false             │  │
│  │  ├─ data: T                         │  │
│  │  ├─ errors: []                      │  │
│  │  └─ timestamp                       │  │
│  └────────────────────────────────────┘  │
└──────┬───────────────────────────────────┘
       │
       │ HTTP Response (JSON)
       │
       ▼
┌──────────────┐
│   Client     │
└──────────────┘
```

## Concurrency Control Flow

```
┌─────────────┐                    ┌─────────────┐
│  Client A   │                    │  Client B   │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ GET /products/123                │
       ▼                                  │
   ┌────────┐                             │
   │ Product│                             │
   │ v1.0   │                             │
   └────────┘                             │
       │                                  │
       │                                  │ GET /products/123
       │                                  ▼
       │                              ┌────────┐
       │                              │ Product│
       │                              │ v1.0   │
       │                              └────────┘
       │                                  │
       │ PUT /products/123                │
       │ (Update price to $50)            │
       ▼                                  │
   ┌────────────────┐                     │
   │ Check RowVersion│                    │
   │ v1.0 == v1.0 ✓ │                    │
   └────────────────┘                     │
       │                                  │
       ▼                                  │
   ┌────────┐                             │
   │ Product│                             │
   │ v1.1   │                             │
   │ $50    │                             │
   └────────┘                             │
       │                                  │
       │ 200 OK                           │
       │                                  │
       │                                  │ PUT /products/123
       │                                  │ (Update price to $60)
       │                                  ▼
       │                              ┌────────────────┐
       │                              │ Check RowVersion│
       │                              │ v1.0 != v1.1 ✗ │
       │                              └────────────────┘
       │                                  │
       │                                  ▼
       │                              ┌────────────────┐
       │                              │ 409 Conflict   │
       │                              │ "Product was   │
       │                              │  modified"     │
       │                              └────────────────┘
       │                                  │
       │                                  ▼
       │                              Client B must
       │                              refresh and retry
```

## Caching Strategy Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CACHE LAYERS                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  L1: Memory Cache (Future Enhancement)               │  │
│  │  - Hot data (categories, attributes)                 │  │
│  │  - TTL: 4 hours                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼ Cache Miss                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  L2: Redis Distributed Cache                         │  │
│  │  - Product details: 1 hour TTL                       │  │
│  │  - Product lists: 15 minutes TTL                     │  │
│  │  - Variants: 30 minutes TTL                          │  │
│  │                                                       │  │
│  │  Cache Keys:                                         │  │
│  │  ├─ product:{guid}                                   │  │
│  │  ├─ product:sku:{sku}                                │  │
│  │  ├─ product:{guid}:variants                          │  │
│  │  └─ products:category:{guid}:page:{n}                │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼ Cache Miss                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  L3: Database (SQL Server)                           │  │
│  │  - Source of truth                                   │  │
│  │  - ACID transactions                                 │  │
│  │  - Indexed queries                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Cache Invalidation Events:
├─ Product Update → Clear product:{id}, product:sku:{sku}
├─ Variant Update → Clear product:{id}, product:{id}:variants
├─ Product Delete → Clear all related keys
└─ Category Change → Clear category-related keys
```

## Scalability Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    LOAD BALANCER                         │
│              (Future: Azure Load Balancer)               │
└────────┬────────────────────┬────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│  API Instance 1 │  │  API Instance 2 │  ... N instances
│  (Stateless)    │  │  (Stateless)    │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └────────┬───────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────────┐
│  Redis Cluster  │  │  SQL Server      │
│  (Distributed)  │  │  (Primary)       │
│                 │  │                  │
│  - Shared Cache │  │  ┌────────────┐  │
│  - Session      │  │  │ Read       │  │
│  - Locks        │  │  │ Replica    │  │
└─────────────────┘  │  │ (Future)   │  │
                     │  └────────────┘  │
                     └──────────────────┘

Horizontal Scaling:
✓ Stateless API instances
✓ Shared Redis cache
✓ Connection pooling
✓ No server-side sessions

Vertical Scaling:
✓ Database indexing
✓ Query optimization
✓ Connection pooling
✓ Async operations
```

This architecture supports:
- **Horizontal scaling**: Add more API instances behind load balancer
- **High availability**: Multiple instances, Redis cluster, SQL Server HA
- **Performance**: Multi-level caching, optimized queries
- **Consistency**: ACID transactions, optimistic concurrency
- **Maintainability**: Clean architecture, separation of concerns
