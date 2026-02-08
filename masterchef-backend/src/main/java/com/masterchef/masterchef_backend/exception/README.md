# Exception Package

Custom exception types for domain-specific error handling.

## LlmException

```java
public class LlmException extends RuntimeException {
    public LlmException(String message) { super(message); }
    public LlmException(String message, Throwable cause) { super(message, cause); }
}
```

### Usage
Thrown by `LlmClient` implementations when:
- HTTP request fails (network error, timeout)
- Ollama returns non-200 status
- Response parsing fails
- Model is not available

### Handling Strategy
```java
try {
    var response = llmClient.generate(request);
} catch (LlmException e) {
    // Log error, return cached response or user-friendly error
    // Record failure in recipe_generations table
    // Circuit breaker may trip after repeated failures
}
```

## Future Exceptions (Planned)

### ResourceNotFoundException
- Thrown when recipe/user not found by ID
- Maps to HTTP 404

### UnauthorizedException
- Thrown when JWT token is invalid/expired
- Maps to HTTP 401

### ValidationException
- Thrown when business rules are violated
- Examples: Empty ingredient list, invalid dietary preference
- Maps to HTTP 400

### ServiceUnavailableException
- Thrown when dependencies are down (Ollama, PostgreSQL)
- Maps to HTTP 503

## Global Exception Handler (Planned)

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(LlmException.class)
    public ResponseEntity<ErrorResponse> handleLlmException(LlmException ex) {
        return ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(new ErrorResponse(
                "Recipe generation temporarily unavailable",
                503,
                LocalDateTime.now(),
                List.of()
            ));
    }
}
```

## Key Patterns

- **RuntimeException** - Unchecked exceptions for cleaner code
- **Root Cause Preservation** - Always include `Throwable cause` constructor
- **Domain-Specific** - Exception name clearly indicates what went wrong
- **Centralized Handling** - @RestControllerAdvice for consistent error responses
