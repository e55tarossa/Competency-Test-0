# Postman Collection Guide

## 📦 Import the Collection

1. **Open Postman**
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `ProductManagementAPI.postman_collection.json`
5. Click **Import**

## ⚙️ Configure the Collection

### Update Base URL

1. Click on the collection name **"Product Management API"**
2. Go to **Variables** tab
3. Update `baseUrl` with your actual API URL
   - Default: `https://localhost:7001`
   - Find your actual port by running `dotnet run` and checking the console output

### Collection Variables

The collection uses these variables (auto-populated during testing):

| Variable | Purpose | Auto-Set |
|----------|---------|----------|
| `baseUrl` | API base URL | Manual |
| `productId` | Current product ID | ✅ Auto |
| `variantId` | Current variant ID | ✅ Auto |
| `newProductId` | Created product ID | ✅ Auto |
| `newVariantId` | Created variant ID | ✅ Auto |
| `uniqueSKU` | Generated unique SKU | ✅ Auto |
| `uniqueVariantSKU` | Generated variant SKU | ✅ Auto |

## 🚀 Quick Start Testing

### Option 1: Run All Tests (Recommended)

1. Click on collection name **"Product Management API"**
2. Click **Run** button
3. Select all requests
4. Click **Run Product Management API**
5. Watch all tests execute automatically! 🎉

### Option 2: Test Individual Endpoints

#### Step 1: Get Sample Data
```
1. Run: "Products" → "List Products"
   - This populates productId and variantId variables
   - Status: 200 OK
   - You should see 2 sample products
```

#### Step 2: Get Product Details
```
2. Run: "Products" → "Get Product by ID"
   - Uses the productId from step 1
   - Status: 200 OK
   - Shows full product with variants
```

#### Step 3: Create New Product
```
3. Run: "Products" → "Create Product"
   - Automatically generates unique SKU
   - Status: 201 Created
   - Stores newProductId for later use
```

#### Step 4: Get Product Variants
```
4. Run: "Product Variants" → "Get Product Variants"
   - Uses productId from step 1
   - Status: 200 OK
   - Shows all variants with stock
```

#### Step 5: Create Variant
```
5. Run: "Product Variants" → "Create Variant"
   - Creates variant for the product from step 1
   - Automatically generates unique SKU
   - Status: 201 Created
```

#### Step 6: Update Stock
```
6. Run: "Product Variants" → "Update Stock (Decrease)"
   - Decreases stock by 5 units
   - Status: 200 OK
   - Simulates a sale
```

## 📂 Collection Structure

```
Product Management API
├── 📁 Products (7 requests)
│   ├── List Products ⭐ (Run this first!)
│   ├── Get Product by ID
│   ├── Get Product by SKU
│   ├── Create Product
│   ├── Update Product
│   └── Delete Product
│
├── 📁 Product Variants (6 requests)
│   ├── Get Product Variants
│   ├── Create Variant
│   ├── Update Variant
│   ├── Update Stock (Decrease)
│   ├── Update Stock (Increase)
│   └── Delete Variant
│
├── 📁 Search & Filter (5 requests)
│   ├── Search by Name
│   ├── Filter by Price Range
│   ├── Filter Active Products
│   ├── Sort by Price (Ascending)
│   └── Combined Filters
│
├── 📁 Validation Tests (4 requests)
│   ├── Duplicate SKU (Should Fail) ❌
│   ├── Invalid Price (Should Fail) ❌
│   ├── Missing Required Fields (Should Fail) ❌
│   └── Oversell Stock (Should Fail) ❌
│
└── 📁 Edge Cases (3 requests)
    ├── Get Non-Existent Product (404)
    ├── Large Page Size (Capped at 100)
    └── Invalid Page Number (Adjusted to 1)
```

## 🧪 Automated Tests

Each request includes automated tests that verify:

### ✅ Success Scenarios
- **Status codes** (200, 201, etc.)
- **Response structure** (success, data, metadata)
- **Data integrity** (IDs exist, arrays populated)
- **Variable population** (auto-set for next requests)

### ❌ Error Scenarios
- **Validation errors** (400 Bad Request)
- **Not found errors** (404 Not Found)
- **Concurrency conflicts** (409 Conflict)
- **Error message structure**

### Example Test Output
```
✓ Status code is 200
✓ Response has success field
✓ Response has data array
✓ Response has metadata
✓ Product ID stored in variable
```

## 📋 Testing Workflows

### Workflow 1: Complete Product Lifecycle

**Run in order:**
1. ✅ Products → List Products
2. ✅ Products → Create Product
3. ✅ Product Variants → Create Variant
4. ✅ Product Variants → Update Stock (Decrease)
5. ✅ Products → Update Product
6. ✅ Products → Get Product by ID
7. ✅ Product Variants → Delete Variant
8. ✅ Products → Delete Product

**Expected:** All tests pass ✅

### Workflow 2: Search & Filter Testing

**Run in order:**
1. ✅ Search & Filter → Search by Name
2. ✅ Search & Filter → Filter by Price Range
3. ✅ Search & Filter → Filter Active Products
4. ✅ Search & Filter → Sort by Price
5. ✅ Search & Filter → Combined Filters

**Expected:** All return filtered results ✅

### Workflow 3: Validation Testing

**Run in order:**
1. ❌ Validation Tests → Duplicate SKU (Should Fail)
2. ❌ Validation Tests → Invalid Price (Should Fail)
3. ❌ Validation Tests → Missing Required Fields (Should Fail)
4. ❌ Validation Tests → Oversell Stock (Should Fail)

**Expected:** All return 400 Bad Request ✅

### Workflow 4: Stock Management

**Run in order:**
1. ✅ Products → List Products
2. ✅ Product Variants → Get Product Variants (note stock)
3. ✅ Product Variants → Update Stock (Decrease) by 5
4. ✅ Product Variants → Get Product Variants (verify decrease)
5. ✅ Product Variants → Update Stock (Increase) by 100
6. ✅ Product Variants → Get Product Variants (verify increase)

**Expected:** Stock changes correctly ✅

## 🎯 Pre-Request Scripts

Some requests include pre-request scripts that:

### Generate Unique SKUs
```javascript
// Automatically generates unique SKU using timestamp
const timestamp = Date.now();
pm.collectionVariables.set("uniqueSKU", `TEST-PRODUCT-${timestamp}`);
```

This ensures:
- ✅ No duplicate SKU errors
- ✅ Can run tests multiple times
- ✅ Each test creates unique products

## 📊 Test Scripts

Each request includes test scripts that:

### 1. Verify Status Codes
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

### 2. Validate Response Structure
```javascript
pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});
```

### 3. Store Variables for Next Requests
```javascript
// Store product ID for use in other requests
if (pm.response.json().data.length > 0) {
    pm.collectionVariables.set("productId", pm.response.json().data[0].id);
}
```

## 🔍 Tips & Tricks

### 1. View Test Results
- Click on **Test Results** tab after running a request
- Green ✅ = Test passed
- Red ❌ = Test failed

### 2. View Response
- Click on **Body** tab to see JSON response
- Use **Pretty** view for formatted JSON
- Use **Raw** view for unformatted

### 3. View Variables
- Click collection name → **Variables** tab
- See current values of all variables
- Manually update if needed

### 4. Save Responses
- Click **Save Response** button
- Compare with future responses
- Document API behavior

### 5. Generate Code
- Click **Code** button (</> icon)
- Select your language (C#, JavaScript, Python, etc.)
- Copy generated code for your application

## 🐛 Troubleshooting

### Issue: "Could not get any response"

**Solution:**
1. Ensure API is running: `dotnet run`
2. Check `baseUrl` variable matches your API URL
3. Verify SSL certificate (or disable SSL verification in Postman settings)

### Issue: "404 Not Found"

**Solution:**
1. Run "List Products" first to populate variables
2. Check that `productId` variable is set
3. Verify the product exists in database

### Issue: "400 Bad Request - Duplicate SKU"

**Solution:**
1. The unique SKU generator should prevent this
2. If it happens, manually change the SKU in request body
3. Or delete the existing product first

### Issue: "409 Conflict - Concurrency Error"

**Solution:**
1. This is expected behavior (optimistic concurrency)
2. Get fresh product data and try again
3. This proves concurrency control is working! ✅

### Issue: Tests Failing

**Solution:**
1. Check if API is running
2. Verify response status code
3. Check response body for error messages
4. Ensure variables are populated correctly

## 📖 Request Descriptions

Each request includes:
- **Description**: What the endpoint does
- **Parameters**: Query/path parameters explained
- **Body**: Request body structure
- **Tests**: What is being validated

Click on a request and check the **Description** tab for details.

## 🎓 Learning Resources

### Understanding the Responses

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-11-20T22:58:23Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "errors": [
    {
      "field": "SKU",
      "message": "SKU already exists"
    }
  ],
  "timestamp": "2025-11-20T22:58:23Z"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "metadata": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 50,
    "totalPages": 3,
    "hasPrevious": false,
    "hasNext": true
  }
}
```

## 🚀 Advanced Usage

### 1. Environment Variables

Create environments for different stages:
- **Development**: `https://localhost:7001`
- **Staging**: `https://staging-api.example.com`
- **Production**: `https://api.example.com`

### 2. Collection Runner

Run entire collection with:
- **Iterations**: Run multiple times
- **Delay**: Add delay between requests
- **Data File**: Use CSV/JSON for data-driven testing

### 3. Monitor

Set up Postman Monitor to:
- Run tests on schedule
- Get email alerts on failures
- Monitor API uptime

### 4. Documentation

Generate API documentation:
1. Click collection → **View Documentation**
2. Click **Publish**
3. Share with team

## ✅ Testing Checklist

- [ ] Import collection successfully
- [ ] Update baseUrl variable
- [ ] Run "List Products" to populate variables
- [ ] Test all CRUD operations
- [ ] Test search and filtering
- [ ] Test validation errors
- [ ] Test edge cases
- [ ] Verify all automated tests pass
- [ ] Test stock management
- [ ] Test concurrency (run update twice quickly)

## 🎉 Ready to Test!

**Quick Start:**
1. Import collection
2. Update `baseUrl` variable
3. Run "List Products"
4. Start testing! 🚀

**Full Test:**
1. Click collection name
2. Click **Run**
3. Select all requests
4. Click **Run Product Management API**
5. Watch all 25+ tests execute! 🎊

---

**Collection Version**: 1.0  
**Total Requests**: 25  
**Automated Tests**: 50+  
**Status**: ✅ Ready to Use
