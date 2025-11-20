# API Testing Examples

## Complete Test Scenarios

### Scenario 1: Product Lifecycle

#### 1.1 Create Categories First

Before creating products, you need categories. Use the seeded categories or create new ones.

**Get Existing Categories** (if using seeded data):
```http
GET /api/v1/products
```
Look at the response to find category IDs in the products.

#### 1.2 Create a New Product

```http
POST /api/v1/products
Content-Type: application/json

{
  "sku": "DRESS-SUMMER-001",
  "name": "Summer Floral Dress",
  "description": "Light and breezy summer dress with floral pattern",
  "basePrice": 79.99,
  "isActive": true,
  "categoryIds": ["{category-guid-here}"],
  "primaryCategoryId": "{category-guid-here}",
  "attributes": [],
  "images": [
    {
      "imageUrl": "https://via.placeholder.com/500x500?text=Summer+Dress",
      "altText": "Summer Floral Dress",
      "displayOrder": 0,
      "isPrimary": true
    }
  ]
}
```

**Expected Response**: 201 Created
```json
{
  "success": true,
  "data": {
    "id": "{new-product-guid}",
    "sku": "DRESS-SUMMER-001",
    "name": "Summer Floral Dress",
    ...
  }
}
```

#### 1.3 Add Variants to Product

```http
POST /api/v1/products/{product-id}/variants
Content-Type: application/json

{
  "sku": "DRESS-SUMMER-001-RED-S",
  "name": "Red - Small",
  "price": 79.99,
  "stockQuantity": 50,
  "isActive": true,
  "attributes": []
}
```

Add more variants:
```json
{
  "sku": "DRESS-SUMMER-001-BLUE-M",
  "name": "Blue - Medium",
  "price": 79.99,
  "stockQuantity": 75,
  "isActive": true,
  "attributes": []
}
```

#### 1.4 Update Product

```http
PUT /api/v1/products/{product-id}
Content-Type: application/json

{
  "name": "Summer Floral Dress - SALE",
  "description": "Light and breezy summer dress with floral pattern - NOW ON SALE!",
  "basePrice": 59.99,
  "isActive": true,
  "categoryIds": ["{category-guid}"],
  "primaryCategoryId": "{category-guid}",
  "attributes": [],
  "images": [
    {
      "imageUrl": "https://via.placeholder.com/500x500?text=Summer+Dress+SALE",
      "altText": "Summer Floral Dress on Sale",
      "displayOrder": 0,
      "isPrimary": true
    }
  ]
}
```

#### 1.5 Get Product Details

```http
GET /api/v1/products/{product-id}
```

**Expected**: Full product with all variants, categories, attributes, and images

#### 1.6 Get Product by SKU

```http
GET /api/v1/products/sku/DRESS-SUMMER-001
```

### Scenario 2: Stock Management

#### 2.1 Check Current Stock

```http
GET /api/v1/products/{product-id}/variants
```

Note the stock quantities.

#### 2.2 Simulate Sale (Decrease Stock)

```http
PATCH /api/v1/products/{product-id}/variants/{variant-id}/stock
Content-Type: application/json

{
  "quantity": -5
}
```

**Expected**: Stock decreased by 5

#### 2.3 Simulate Restock (Increase Stock)

```http
PATCH /api/v1/products/{product-id}/variants/{variant-id}/stock
Content-Type: application/json

{
  "quantity": 100
}
```

**Expected**: Stock increased by 100

#### 2.4 Try to Oversell (Error Case)

```http
PATCH /api/v1/products/{product-id}/variants/{variant-id}/stock
Content-Type: application/json

{
  "quantity": -10000
}
```

**Expected**: 400 Bad Request
```json
{
  "success": false,
  "errors": [
    {
      "field": "Quantity",
      "message": "Insufficient stock"
    }
  ]
}
```

### Scenario 3: Search and Filter

#### 3.1 Search by Name

```http
GET /api/v1/products?searchTerm=shirt
```

#### 3.2 Filter by Price Range

```http
GET /api/v1/products?minPrice=20&maxPrice=50
```

#### 3.3 Filter by Category

```http
GET /api/v1/products?categoryId={category-guid}
```

#### 3.4 Filter Active Products Only

```http
GET /api/v1/products?isActive=true
```

#### 3.5 Combined Filters

```http
GET /api/v1/products?searchTerm=shirt&minPrice=20&maxPrice=100&isActive=true&sortBy=price&sortDescending=false
```

#### 3.6 Pagination

```http
GET /api/v1/products?page=1&pageSize=5
```

**Expected**: Metadata with pagination info
```json
{
  "metadata": {
    "page": 1,
    "pageSize": 5,
    "totalCount": 10,
    "totalPages": 2,
    "hasPrevious": false,
    "hasNext": true
  }
}
```

### Scenario 4: Validation Testing

#### 4.1 Duplicate SKU (Error)

Create a product with existing SKU:
```http
POST /api/v1/products
Content-Type: application/json

{
  "sku": "SHIRT-COTTON-001",
  "name": "Another Shirt",
  "description": "Test",
  "basePrice": 29.99,
  "isActive": true,
  "categoryIds": ["{category-guid}"],
  "attributes": [],
  "images": []
}
```

**Expected**: 400 Bad Request
```json
{
  "success": false,
  "errors": [
    {
      "field": "SKU",
      "message": "SKU already exists"
    }
  ]
}
```

#### 4.2 Invalid Price (Error)

```http
POST /api/v1/products
Content-Type: application/json

{
  "sku": "TEST-001",
  "name": "Test Product",
  "description": "Test",
  "basePrice": -10,
  "isActive": true,
  "categoryIds": ["{category-guid}"],
  "attributes": [],
  "images": []
}
```

**Expected**: 400 Bad Request - Price must be greater than 0

#### 4.3 Missing Required Fields (Error)

```http
POST /api/v1/products
Content-Type: application/json

{
  "sku": "",
  "name": "",
  "description": "Test",
  "basePrice": 29.99,
  "isActive": true,
  "categoryIds": [],
  "attributes": [],
  "images": []
}
```

**Expected**: Multiple validation errors

#### 4.4 Invalid Category ID (Error)

```http
POST /api/v1/products
Content-Type: application/json

{
  "sku": "TEST-002",
  "name": "Test Product",
  "description": "Test",
  "basePrice": 29.99,
  "isActive": true,
  "categoryIds": ["00000000-0000-0000-0000-000000000000"],
  "attributes": [],
  "images": []
}
```

**Expected**: 400 Bad Request - Invalid category IDs

### Scenario 5: Concurrency Testing

#### 5.1 Concurrent Updates (Optimistic Concurrency)

**Step 1**: Get product details
```http
GET /api/v1/products/{product-id}
```

**Step 2**: In two different clients/tabs, update the same product simultaneously

**Client 1**:
```http
PUT /api/v1/products/{product-id}
{
  "name": "Updated by Client 1",
  ...
}
```

**Client 2** (immediately after):
```http
PUT /api/v1/products/{product-id}
{
  "name": "Updated by Client 2",
  ...
}
```

**Expected**: 
- First request: 200 OK
- Second request: 409 Conflict
```json
{
  "success": false,
  "errors": [
    {
      "field": "Concurrency",
      "message": "Product was modified by another user. Please refresh and try again."
    }
  ]
}
```

#### 5.2 Concurrent Stock Updates

**Client 1**:
```http
PATCH /api/v1/products/{product-id}/variants/{variant-id}/stock
{ "quantity": -10 }
```

**Client 2** (simultaneously):
```http
PATCH /api/v1/products/{product-id}/variants/{variant-id}/stock
{ "quantity": -10 }
```

**Expected**: Both should succeed due to serializable transaction isolation, or one may get a concurrency error.

### Scenario 6: Edge Cases

#### 6.1 Get Non-Existent Product

```http
GET /api/v1/products/00000000-0000-0000-0000-000000000000
```

**Expected**: 404 Not Found

#### 6.2 Delete Product

```http
DELETE /api/v1/products/{product-id}
```

**Expected**: 200 OK

Verify deletion:
```http
GET /api/v1/products/{product-id}
```

**Expected**: 404 Not Found

#### 6.3 Large Page Size (Capped)

```http
GET /api/v1/products?pageSize=1000
```

**Expected**: Returns max 100 items (capped at MaxPageSize)

#### 6.4 Invalid Page Number

```http
GET /api/v1/products?page=0
```

**Expected**: Adjusted to page 1

## Performance Testing

### Cache Effectiveness

**First Request** (Cache Miss):
```http
GET /api/v1/products/{product-id}
```
Note the response time.

**Second Request** (Cache Hit):
```http
GET /api/v1/products/{product-id}
```
Should be significantly faster.

**After Update** (Cache Invalidation):
```http
PUT /api/v1/products/{product-id}
{ ... }
```

**Next Request** (Cache Miss Again):
```http
GET /api/v1/products/{product-id}
```
Should be slower again (cache was invalidated).

## Postman Collection Structure

```
Product Management API
├── Products
│   ├── List Products
│   ├── Get Product by ID
│   ├── Get Product by SKU
│   ├── Create Product
│   ├── Update Product
│   └── Delete Product
├── Variants
│   ├── Get Product Variants
│   ├── Create Variant
│   ├── Update Variant
│   ├── Delete Variant
│   └── Update Stock
├── Search & Filter
│   ├── Search by Name
│   ├── Filter by Price
│   ├── Filter by Category
│   └── Combined Filters
├── Validation Tests
│   ├── Duplicate SKU
│   ├── Invalid Price
│   ├── Missing Fields
│   └── Invalid Category
└── Edge Cases
    ├── Non-Existent Product
    ├── Concurrency Test
    └── Large Page Size
```

## Expected HTTP Status Codes

| Status | Meaning | When |
|--------|---------|------|
| 200 OK | Success | GET, PUT, DELETE successful |
| 201 Created | Created | POST successful |
| 400 Bad Request | Validation Error | Invalid input |
| 404 Not Found | Not Found | Resource doesn't exist |
| 409 Conflict | Concurrency Error | Optimistic concurrency violation |
| 500 Internal Server Error | Server Error | Unexpected error |

## Testing Checklist

- [ ] Create product successfully
- [ ] Create product with duplicate SKU (should fail)
- [ ] Create product with invalid data (should fail)
- [ ] Get product by ID
- [ ] Get product by SKU
- [ ] List products with pagination
- [ ] Search products
- [ ] Filter products by price
- [ ] Filter products by category
- [ ] Update product
- [ ] Update product concurrently (should conflict)
- [ ] Delete product
- [ ] Create variant
- [ ] Update variant stock
- [ ] Decrease stock below zero (should fail)
- [ ] Test cache (first request slow, second fast)
- [ ] Test cache invalidation after update

Happy Testing! 🧪
