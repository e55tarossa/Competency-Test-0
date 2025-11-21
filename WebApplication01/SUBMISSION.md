# Product Management System - Assignment Submission

## 📋 Submission Information

**Project**: E-Commerce Product Management System  
**Date**: November 21, 2025  
**Developer**: Hoang Phuc

---

## 🎯 Project Overview

A full-stack e-commerce product management system featuring a scalable RESTful API built with ASP.NET Core 8.0 and a modern React-based frontend. The system implements strong consistency, Redis caching, optimistic concurrency control, and comprehensive product variant management.

---

## 🏗️ Architecture & Approach

### Backend Architecture (ASP.NET Core 8.0)

**Layered Architecture:**
```
┌─────────────────────────────────────┐
│     Controllers (API Layer)         │
├─────────────────────────────────────┤
│   Application Services (Business)   │
├─────────────────────────────────────┤
│   Domain Models (Entities)          │
├─────────────────────────────────────┤
│   Data Access (EF Core + Redis)     │
└─────────────────────────────────────┘
```

**Key Design Decisions:**

1. **Repository Pattern**: Abstracted data access for testability and flexibility
2. **Service Layer**: Business logic separated from controllers
3. **DTO Pattern**: Request/Response objects separate from domain entities
4. **Dependency Injection**: All services registered in IoC container
5. **Cache-Aside Pattern**: Redis caching with automatic invalidation

### Frontend Architecture (React + TypeScript)

**Component-Based Architecture:**
```
┌─────────────────────────────────────┐
│     App (Main Container)            │
├─────────────────────────────────────┤
│   Pages (ProductList)               │
├─────────────────────────────────────┤
│   Components (ProductForm, etc.)    │
├─────────────────────────────────────┤
│   Services (API Clients)            │
├─────────────────────────────────────┤
│   Store (Zustand State Management)  │
└─────────────────────────────────────┘
```

**Key Features:**
- React Query for server state management
- Zustand for client state management
- React Hook Form + Zod for form validation
- TailwindCSS for styling with dark theme
- TypeScript for type safety

---

## 💾 Database Design

### Core Tables

#### 1. **Products**
```sql
- Id (GUID, PK)
- SKU (NVARCHAR(100), Unique Index)
- Name (NVARCHAR(200), Index)
- Description (NVARCHAR(MAX))
- BasePrice (DECIMAL(18,2))
- IsActive (BIT, Index)
- PrimaryCategoryId (GUID, FK)
- RowVersion (TIMESTAMP) -- Optimistic Concurrency
- CreatedAt, UpdatedAt
```

#### 2. **ProductVariants**
```sql
- Id (GUID, PK)
- ProductId (GUID, FK, Index)
- SKU (NVARCHAR(100), Unique Index)
- Name (NVARCHAR(200))
- Price (DECIMAL(18,2), Nullable)
- StockQuantity (INT, Index)
- IsActive (BIT)
- RowVersion (TIMESTAMP)
- CreatedAt, UpdatedAt
```

#### 3. **Categories**
```sql
- Id (GUID, PK)
- Name (NVARCHAR(100), Index)
- Description (NVARCHAR(500))
- ParentCategoryId (GUID, FK, Nullable)
- DisplayOrder (INT)
- IsActive (BIT)
```

#### 4. **Attributes** (EAV Pattern)
```sql
- Id (GUID, PK)
- Name (NVARCHAR(100))
- DataType (NVARCHAR(50)) -- String, Number, Boolean
- IsRequired (BIT)
```

#### 5. **ProductAttributes** & **VariantAttributes**
```sql
- Id (GUID, PK)
- ProductId/VariantId (GUID, FK)
- AttributeId (GUID, FK)
- Value (NVARCHAR(500))
```

### Indexes Strategy

- **Primary Keys**: Clustered indexes on all Id columns
- **Foreign Keys**: Non-clustered indexes for join performance
- **Search Fields**: Indexes on SKU, Name, IsActive
- **Composite Indexes**: (ProductId, IsActive) for filtered queries

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| ASP.NET Core | 8.0 | Web API Framework |
| Entity Framework Core | 8.0 | ORM for database access |
| SQL Server | 2019+ | Relational database |
| Redis | Latest | Distributed caching |
| FluentValidation | 11.x | Input validation |
| Swagger/OpenAPI | Latest | API documentation |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| React Query | 5.x | Server state management |
| Zustand | 4.x | Client state management |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |
| TailwindCSS | 3.x | Styling |
| Axios | 1.x | HTTP client |

### Development Tools
- Rider
- SQL Server Management Studio
- Redis Desktop Manager
- Postman
- Git

---

## 🚀 Setup & Installation

### Prerequisites
```bash
- .NET 8.0 SDK
- Node.js 18+ & npm
- SQL Server (LocalDB or full instance)
- Redis Server (optional for development)
```

### Backend Setup

1. **Clone Repository**
```bash
git clone 
cd WebApplication01
```

2. **Install Redis (Windows)**
```powershell
choco install redis-64
redis-server
```

3. **Update Configuration**
Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ProductManagementDb;Trusted_Connection=True;",
    "Redis": "localhost:6379"
  }
}
```

4. **Apply Migrations**
```bash
dotnet ef database update --project WebApplication01
```

5. **Run Backend**
```bash
dotnet run --project WebApplication01
```
API available at: `https://localhost:7xxx`

### Frontend Setup

1. **Navigate to Frontend**
```bash
cd product-management-ui
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure API URL**
Edit `src/lib/api-client.ts`:
```typescript
baseURL: 'https://localhost:7xxx/api'
```

4. **Run Frontend**
```bash
npm run dev
```
UI available at: `http://localhost:3000`

---

## 📡 API Documentation

### Base URL
```
https://localhost:7xxx/api/v1
```

### Authentication
Currently no authentication (can be added with JWT)

### Endpoints

#### Products
```
GET    /products                    - List products (paginated)
GET    /products/{id}               - Get product by ID
GET    /products/sku/{sku}          - Get product by SKU
POST   /products                    - Create product
PUT    /products/{id}               - Update product
DELETE /products/{id}               - Delete product
```

#### Product Variants
```
GET    /products/{id}/variants      - Get product variants
POST   /products/{id}/variants      - Create variant
PUT    /products/{id}/variants/{variantId}  - Update variant
DELETE /products/{id}/variants/{variantId}  - Delete variant
PATCH  /products/{id}/variants/{variantId}/stock - Update stock
```

#### Categories
```
GET    /categories                  - List all categories
GET    /categories/{id}             - Get category by ID
POST   /categories                  - Create category
PUT    /categories/{id}             - Update category
DELETE /categories/{id}             - Delete category
```

#### Attributes
```
GET    /attributes                  - List all attributes
GET    /attributes/{id}             - Get attribute by ID
POST   /attributes                  - Create attribute
PUT    /attributes/{id}             - Update attribute
DELETE /attributes/{id}             - Delete attribute
```

### Query Parameters (GET /products)
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

### Sample Request/Response

**Create Product:**
```json
POST /api/v1/products
{
  "sku": "SHIRT-COTTON-001",
  "name": "Classic Cotton T-Shirt",
  "description": "Comfortable cotton t-shirt",
  "basePrice": 29.99,
  "isActive": true,
  "categoryIds": ["category-guid"],
  "attributes": [
    {
      "attributeId": "color-attribute-guid",
      "value": "Blue"
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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "product-guid",
    "sku": "SHIRT-COTTON-001",
    "name": "Classic Cotton T-Shirt",
    "basePrice": 29.99,
    "isActive": true,
    "categories": [...],
    "attributes": [...],
    "images": [...],
    "createdAt": "2025-11-21T14:30:00Z"
  },
  "message": "Product created successfully"
}
```

---

## 🔒 Concurrency Control

### Optimistic Concurrency Implementation

**Problem**: Prevent data loss when multiple users edit the same product simultaneously.

**Solution**: RowVersion (Timestamp) column on all entities.

**How it works:**
1. Entity includes `RowVersion` (byte[]) property
2. EF Core automatically checks RowVersion on updates
3. If RowVersion changed, throws `DbUpdateConcurrencyException`
4. API returns 409 Conflict with error message

**Example:**
```csharp
public class Product
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    
    [Timestamp]
    public byte[] RowVersion { get; set; } // Concurrency token
}
```

### Stock Update Concurrency

**Special handling for stock updates:**
```csharp
using var transaction = await _context.Database
    .BeginTransactionAsync(IsolationLevel.Serializable);

var variant = await _context.ProductVariants
    .FirstOrDefaultAsync(v => v.Id == variantId);

variant.StockQuantity += request.Quantity;

if (variant.StockQuantity < 0)
    throw new InvalidOperationException("Insufficient stock");

await _context.SaveChangesAsync();
await transaction.CommitAsync();
```

---

## ⚡ Performance Optimizations

### 1. Redis Caching Strategy

**Cache Keys:**
```
product:{id}
product:sku:{sku}
product:{id}:variants
products:list:{hash}
```

**TTL:**
- Products: 1 hour
- Variants: 30 minutes
- Lists: 5 minutes

**Invalidation:**
- On Create/Update/Delete
- Cascade to related entities

### 2. Database Optimizations

- **Indexes**: Strategic indexes on frequently queried columns
- **AsNoTracking**: Used for read-only queries (30% faster)
- **Pagination**: Mandatory to prevent large result sets
- **Eager Loading**: `.Include()` to avoid N+1 queries
- **Projection**: Select only needed columns with `.Select()`

### 3. Query Examples

```csharp
// Efficient paginated query with filtering
var products = await _context.Products
    .AsNoTracking()
    .Include(p => p.Categories)
    .Include(p => p.Images)
    .Where(p => p.IsActive && p.Name.Contains(searchTerm))
    .OrderBy(p => p.Name)
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync();
```

---

## ✅ Testing Coverage

### Manual Testing

**Test Scenarios Covered:**

1. **Product CRUD Operations**
   - ✅ Create product with categories and attributes
   - ✅ Update product details
   - ✅ Delete product (cascade to variants)
   - ✅ Search and filter products

2. **Variant Management**
   - ✅ Create product variants
   - ✅ Update variant stock
   - ✅ Concurrency conflict handling

3. **Edge Cases**
   - ✅ Duplicate SKU validation
   - ✅ Invalid price ranges
   - ✅ Negative stock prevention
   - ✅ Concurrent stock updates

### Testing Tools

- **Swagger UI**: Interactive API testing
- **Postman**: Automated API testing (collection available)
- **Browser**: Frontend integration testing

---

## 📊 Environment Variables

### Backend (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ProductManagementDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True",
    "Redis": "localhost:6379"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000"]
  }
}
```

### Frontend (.env)

```env
VITE_API_BASE_URL=https://localhost:7xxx/api
VITE_API_VERSION=v1
```

---

## ⚠️ Known Limitations

### Current Limitations

1. **Authentication & Authorization**
   - No user authentication implemented
   - No role-based access control
   - All endpoints are publicly accessible

2. **File Upload**
   - Images stored as URLs only
   - No actual file upload to server/cloud storage
   - Base64 support for demo purposes only

3. **Search**
   - Basic string matching only
   - No full-text search
   - No fuzzy matching or relevance ranking

4. **Caching**
   - Simple cache invalidation (delete on update)
   - No cache warming strategy
   - No distributed cache synchronization

5. **Validation**
   - Limited business rule validation
   - No inventory reservation system
   - No price history tracking

6. **Testing**
   - No unit tests implemented
   - No integration tests
   - Manual testing only

7. **Monitoring**
   - No application monitoring
   - No performance metrics
   - Basic logging only

---

## 🚀 Future Improvements

### Short-term (1-3 months)

1. **Authentication & Security**
   - Implement JWT authentication
   - Add role-based authorization (Admin, Manager, Viewer)
   - API rate limiting
   - Input sanitization

2. **Enhanced Search**
   - Elasticsearch integration for full-text search
   - Faceted search (filter by multiple attributes)
   - Search suggestions/autocomplete

3. **File Management**
   - Azure Blob Storage / AWS S3 integration
   - Image optimization and resizing
   - CDN integration for images

4. **Testing**
   - Unit tests with xUnit
   - Integration tests with WebApplicationFactory
   - Frontend tests with Jest/React Testing Library
   - E2E tests with Playwright

### Medium-term (3-6 months)

5. **Advanced Features**
   - Product reviews and ratings
   - Inventory reservation system
   - Price history and promotions
   - Bulk import/export (CSV, Excel)

6. **Performance**
   - GraphQL API for flexible queries
   - Server-side rendering (SSR) for SEO
   - Progressive Web App (PWA)
   - WebSocket for real-time stock updates

7. **Analytics**
   - Product view tracking
   - Sales analytics dashboard
   - Inventory forecasting
   - Performance metrics (Application Insights)

### Long-term (6-12 months)

8. **Scalability**
   - Microservices architecture
   - Event-driven architecture (RabbitMQ/Kafka)
   - CQRS pattern for read/write separation
   - Kubernetes deployment

---

## 📦 Postman Collection

A Postman collection is included in the repository for easy API testing.

**Location**: `/postman/Product-Management-API.postman_collection.json`

**Environment Variables**:
```json
{
  "baseUrl": "https://localhost:7xxx/api/v1",
  "productId": "",
  "variantId": "",
  "categoryId": ""
}
```

**Collection Includes**:
- All CRUD operations for Products, Variants, Categories, Attributes
- Sample requests with valid payloads
- Tests for response validation
- Environment variable automation

---

## 📝 Code Quality

### Best Practices Implemented

- ✅ **SOLID Principles**: Single Responsibility, Dependency Inversion
- ✅ **Clean Code**: Meaningful names, small functions
- ✅ **Error Handling**: Consistent error responses
- ✅ **Async/Await**: All I/O operations are async
- ✅ **Dependency Injection**: All services registered in DI container
- ✅ **Separation of Concerns**: Layered architecture
- ✅ **Type Safety**: TypeScript on frontend, strong typing on backend

---

## 🎨 UI/UX Features

### Frontend Highlights

1. **Modern Dark Theme**
   - Dark blue header matching brand
   - Dark glassmorphism effects
   - Consistent color palette
   - Smooth animations and transitions

2. **Responsive Design**
   - Mobile-first approach
   - Adaptive layouts
   - Touch-friendly controls

3. **User Experience**
   - Real-time form validation
   - Loading states and skeletons
   - Toast notifications for feedback
   - Optimistic UI updates

4. **Data Management**
   - Pagination with page size control
   - Advanced filtering and search
   - Sorting by multiple columns
   - Inline editing (variants)

---

## 📚 Documentation

### Available Documentation

1. **README.md** - Setup and quick start guide
2. **SUBMISSION.md** (this file) - Complete project documentation
3. **IMPLEMENTATION_SUMMARY.md** - Frontend implementation details
4. **API Documentation** - Swagger UI at root URL
5. **Code Comments** - Inline documentation in code

---

## 🔗 Repository Structure

```
WebApplication01/
├── WebApplication01/              # Backend API
│   ├── Controllers/               # API Controllers
│   ├── Application/
│   │   ├── DTOs/                  # Data Transfer Objects
│   │   ├── Interfaces/            # Service interfaces
│   │   ├── Services/              # Business logic
│   │   └── Validators/            # FluentValidation
│   ├── Domain/
│   │   └── Entities/              # Domain models
│   └── Infrastructure/
│       ├── Data/                  # DbContext, configurations
│       └── Caching/               # Redis implementation
├── product-management-ui/         # Frontend React App
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── services/              # API clients
│   │   ├── store/                 # State management
│   │   ├── types/                 # TypeScript types
│   │   └── lib/                   # Utilities
│   └── public/                    # Static assets
├── postman/                       # Postman collection
├── README.md                      # Setup guide
└── SUBMISSION.md                  # This file
```

---

## 🎯 Assignment Requirements Checklist

### Backend Requirements
- ✅ RESTful API design with proper HTTP methods
- ✅ SQL Server database with EF Core
- ✅ Strong consistency with optimistic concurrency
- ✅ Redis caching for performance
- ✅ FluentValidation for input validation
- ✅ Proper error handling and responses
- ✅ API documentation with Swagger
- ✅ Pagination and filtering
- ✅ Product variants support
- ✅ Stock management with concurrency control

### Frontend Requirements
- ✅ React-based UI
- ✅ Integration with backend APIs
- ✅ Form validation
- ✅ Error handling and user feedback
- ✅ Responsive design
- ✅ Loading states
- ✅ CRUD operations for products
- ✅ Variant management UI
- ✅ Category and attribute selection

### Additional Features
- ✅ Dark theme UI
- ✅ Image upload support
- ✅ Real-time form validation
- ✅ Toast notifications
- ✅ Advanced filtering
- ✅ Optimistic UI updates

---

**Thank you for reviewing this submission!** 🚀
