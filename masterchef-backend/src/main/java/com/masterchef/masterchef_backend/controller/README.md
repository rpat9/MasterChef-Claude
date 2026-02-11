# Controller Package

REST API controllers defining HTTP endpoints and request/response handling.

## Overview

This package contains all REST controllers implementing the MasterChef API:
- **AuthController**: User authentication and token management
- **RecipeController**: Recipe generation and CRUD operations
- **AdminController**: Administrative endpoints for cache management

All controllers use:
- `@RestController` for automatic JSON serialization
- `@RequestMapping` for base path configuration
- `@AuthenticationPrincipal` for JWT user extraction
- `@Valid` for request validation
- Global exception handling via `GlobalExceptionHandler`

---

## AuthController

**Base Path:** `/api/v1/auth`

### Endpoints

#### POST /register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

#### POST /login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Same as register

#### POST /refresh
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Response:** New access and refresh tokens

---

## RecipeController

**Base Path:** `/api/v1/recipes`  
**Authentication:** Required (JWT)

### Endpoints

#### POST /generate
Generate AI-powered recipe from ingredients.

```http
POST /api/v1/recipes/generate
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "ingredients": ["chicken", "rice", "garlic", "onion"],
  "dietaryPreferences": ["gluten-free"],
  "servings": 4,
  "difficulty": "medium",
  "maxTimeMinutes": 45
}
```

**Response:** `RecipeResponse` with full recipe details and generation metadata

**Features:**
- LLM-powered recipe generation using Mistral 7B
- Automatic caching for repeated requests
- Complete audit trail in `recipe_generations` table
- Resilience patterns (circuit breaker, retry, rate limiting)

#### GET /recipes
List user's saved recipes with pagination.

```http
GET /api/v1/recipes?page=0&size=10&sort=createdAt,desc
Authorization: Bearer {accessToken}
```

**Response:** Paginated list of `RecipeResponse`

**Query Parameters:**
- `page` - Page number (0-indexed)
- `size` - Items per page
- `sort` - Sort field and direction (e.g., `createdAt,desc`)

#### GET /recipes/{id}
Get specific recipe by ID.

```http
GET /api/v1/recipes/{recipeId}
Authorization: Bearer {accessToken}
```

**Response:** Single `RecipeResponse`

**Security:** Verifies recipe ownership before returning

#### DELETE /recipes/{id}
Delete recipe and associated S3 exports.

```http
DELETE /api/v1/recipes/{recipeId}
Authorization: Bearer {accessToken}
```

**Response:** 204 No Content

**Behavior:**
- Deletes recipe from PostgreSQL
- Attempts to delete S3 export (fails silently if not found)
- Verifies ownership before deletion

#### POST /recipes/{id}/export
Export recipe to S3 and get presigned download URL.

```http
POST /api/v1/recipes/{recipeId}/export
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "s3Key": "exports/user-id/recipe-id.json",
  "presignedUrl": "https://s3.amazonaws.com/...",
  "expiresIn": "15 minutes",
  "fileSizeBytes": 2048
}
```

**Features:**
- Converts recipe to JSON
- Uploads to S3 bucket
- Generates presigned URL (15-min expiration)
- Works with LocalStack locally

#### GET /recipes/history
Get recipe generation history with metrics.

```http
GET /api/v1/recipes/history?page=0&size=20
Authorization: Bearer {accessToken}
```

**Response:** Paginated list of `GenerationHistoryResponse`

**Includes:**
- Ingredients and dietary preferences used
- Model name, tokens used, latency
- Cache hit status
- Success/failure status and error messages

#### GET /recipes/metrics
Get user-specific performance metrics.

```http
GET /api/v1/recipes/metrics
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "totalGenerations": 42,
  "cacheHits": 15,
  "totalRecipesSaved": 38,
  "totalTokensUsed": 125000,
  "averageLatencyMs": 3450.5,
  "cacheHitRate": 0.357
}
```

**Metrics:**
- Total recipe generations
- Cache hit count and rate
- Token usage (for cost analysis)
- Average LLM response time

---

## AdminController

**Base Path:** `/api/v1/admin`  
**Authentication:** Required (JWT)

### Endpoints

#### GET /cache/stats
Get global cache statistics.

```http
GET /api/v1/admin/cache/stats
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "totalEntries": 1000,
  "expiredEntries": 150,
  "activeEntries": 850,
  "hitRate": 0.42,
  "totalHits": 450,
  "totalMisses": 620
}
```

**Metrics:**
- Total cache entries (including expired)
- Active vs expired entries
- Cache hit rate
- Total hits and misses

#### DELETE /cache
Clear expired cache entries.

```http
DELETE /api/v1/admin/cache
Authorization: Bearer {accessToken}
```

**Response:** 204 No Content

**Behavior:**
- Deletes all cache entries past expiration
- Returns count of deleted entries in logs
- Does not affect active cache entries

---

## Common Response Patterns

### Success Responses
- `200 OK` - Successful GET/POST with body
- `201 Created` - Resource created (register)
- `204 No Content` - Successful DELETE

### Error Responses
All errors return `ErrorResponse` DTO:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Recipe not found with identifier: abc123",
  "timestamp": "2026-02-10T19:30:00",
  "validationErrors": []
}
```

**Status Codes:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing/invalid JWT
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Unexpected errors
- `503 Service Unavailable` - LLM/external service down

---

## Security

### JWT Authentication
- All endpoints except `/auth/**` require JWT
- Token extracted via `@AuthenticationPrincipal UserDetails`
- User identity resolved from token email claim
- Ownership verification for sensitive operations

### CORS Configuration
- Configured in `SecurityConfig`
- Allows localhost origins for development
- Production: Restrict to frontend domain

### Rate Limiting
- Applied at service layer (Resilience4j)
- 10 requests per minute per user for LLM calls
- Prevents abuse and manages costs

---

## Best Practices

### Controller Responsibilities
✅ **DO:**
- Handle HTTP-specific concerns (status codes, headers)
- Extract authentication principal
- Validate request DTOs with `@Valid`
- Map entities to response DTOs
- Delegate business logic to services

❌ **DON'T:**
- Implement business logic in controllers
- Directly access repositories
- Handle transaction management
- Perform complex data transformations

### Example Pattern
```java
@PostMapping("/generate")
public ResponseEntity<RecipeResponse> generateRecipe(
    @Valid @RequestBody RecipeRequest request,
    @AuthenticationPrincipal UserDetails userDetails
) {
    // 1. Extract user identity
    User user = userRepository.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("User", email));
    
    // 2. Delegate to service
    RecipeResponse response = recipeService.generateRecipe(request, user.getId());
    
    // 3. Return HTTP response
    return ResponseEntity.ok(response);
}
```

---

## Testing Endpoints

### Using curl

```bash
# Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","displayName":"Test User"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Generate Recipe (replace TOKEN)
curl -X POST http://localhost:8080/api/v1/recipes/generate \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"ingredients":["chicken","rice"],"servings":4}'

# Get Metrics
curl -X GET http://localhost:8080/api/v1/recipes/metrics \
  -H "Authorization: Bearer {TOKEN}"
```

### Using Postman
Import collection: `docs/postman_collection.json` (if available)
