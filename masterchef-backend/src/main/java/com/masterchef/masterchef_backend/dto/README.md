# DTO Package

Data Transfer Objects defining API contracts and service layer interfaces. Decouples external API from internal entities.

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
    Integer servings
)
```
- Incoming recipe generation request
- JSR-380 validation annotations
- User-friendly field names

### RecipeResponse
```java
record RecipeResponse(
    UUID id,
    String recipeName,
    List<String> ingredientsUsed,
    Map<String, Object> instructions,
    Map<String, Object> ingredients,
    Map<String, Object> nutritionInfo,
    List<String> tags,
    LocalDateTime createdAt,
    GenerationMetadata generationMetadata
)
```
- Full recipe with metadata
- Nested GenerationMetadata for transparency

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
