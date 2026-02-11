# DTO Package

Data Transfer Objects defining API contracts and service layer interfaces. Decouples external API from internal entities.

## Overview

This package contains all DTOs used across the application:
- **Request DTOs**: Incoming API requests with validation
- **Response DTOs**: Outgoing API responses
- **Internal DTOs**: Service layer communication

## LLM Communication DTOs

### LlmRequest
```java
record LlmRequest(
    String prompt,
    String model,
    Double temperature,
    Integer maxTokens
)
```
- Represents a request to any LLM provider
- Model-agnostic abstraction

### LlmResponse
```java
record LlmResponse(
    String content,
    Integer tokensUsed,
    boolean cached,
    Long latencyMs,
    String status
)
```
- Unified response format
- Status: SUCCESS, CACHE_HIT, FAILED, TIMEOUT

## Recipe API DTOs

### RecipeRequest
```java
record RecipeRequest(
    @NotEmpty List<String> ingredients,
    List<String> dietaryPreferences,
    Integer servings,
    String difficulty,
    Integer maxTimeMinutes
)
```
- Incoming recipe generation request
- JSR-380 validation annotations
- User-friendly field names

### RecipeResponse
```java
record RecipeResponse(
    UUID id,
    String title,
    String description,
    Integer prepTime,
    Integer cookTime,
    Integer totalTime,
    Integer servings,
    String difficulty,
    String cuisine,
    List<String> ingredientsUsed,
    String instructions,
    String ingredients,
    String nutritionInfo,
    List<String> tags,
    Boolean isSaved,
    LocalDateTime createdAt,
    GenerationMetaData metadata
)
```
- Full recipe with metadata
- Nested GenerationMetaData for transparency

### RecipeExportResponse
```java
record RecipeExportResponse(
    String s3Key,
    String presignedUrl,
    String expiresIn,
    Long fileSizeBytes
)
```
- S3 export result with presigned download URL
- Used by `POST /api/v1/recipes/{id}/export`

### GenerationHistoryResponse
```java
record GenerationHistoryResponse(
    UUID id,
    List<String> ingredients,
    List<String> dietaryPreferences,
    String modelUsed,
    Integer tokensUsed,
    Boolean cached,
    Long latencyMs,
    String status,
    String errorMessage,
    LocalDateTime createdAt
)
```
- Recipe generation audit trail
- Used by `GET /api/v1/recipes/history`

### UserMetricsResponse
```java
record UserMetricsResponse(
    Long totalGenerations,
    Long cacheHits,
    Long totalRecipesSaved,
    Long totalTokensUsed,
    Double averageLatencyMs,
    Double cacheHitRate
)
```
- User-specific performance metrics
- Used by `GET /api/v1/recipes/metrics`

## Admin API DTOs

### CacheStatsResponse
```java
record CacheStatsResponse(
    Long totalEntries,
    Long expiredEntries,
    Long activeEntries,
    Double hitRate,
    Long totalHits,
    Long totalMisses
)
```
- Global cache statistics
- Used by `GET /api/v1/admin/cache/stats`

## Error Handling DTOs

### ErrorResponse
```java
record ErrorResponse(
    String message,
    int status,
    LocalDateTime timestamp,
    List<FieldError> errors
)
```
- Standardized error format
- Field-level validation errors
- HTTP status code included

## Key Patterns

- **Records** - Immutable DTOs with automatic getters/equals/hashCode (Java 16+)
- **Validation** - JSR-380 annotations for declarative validation
- **Separation of Concerns** - DTOs ≠ Entities (different lifecycle, different consumers)
- **Nested Objects** - GenerationMetadata embedded in RecipeResponse for rich context
