# Exception Package

Custom exception types for domain-specific error handling with global exception handler.

## Custom Exceptions

### LlmException

```java
public class LlmException extends RuntimeException {
    public LlmException(String message) { super(message); }
    public LlmException(String message, Throwable cause) { super(message, cause); }
}
```

**Usage:** Thrown by `LlmClient` implementations when:
- HTTP request fails (network error, timeout)
- Ollama returns non-200 status
- Response parsing fails
- Model is not available

**HTTP Mapping:** 503 Service Unavailable

### ResourceNotFoundException

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
    public ResourceNotFoundException(String resourceType, String identifier) {
        super(String.format("%s not found with identifier: %s", resourceType, identifier));
    }
}
```

**Usage:** Thrown when requested resources don't exist:
- Recipe not found by ID
- User not found by ID
- Ownership verification fails

**HTTP Mapping:** 404 Not Found

### StorageException

```java
public class StorageException extends RuntimeException {
    public StorageException(String message) { super(message); }
    public StorageException(String message, Throwable cause) { super(message, cause); }
}
```

**Usage:** Thrown when S3 operations fail:
- Upload failures
- Presigned URL generation errors
- Delete operation failures

**HTTP Mapping:** 500 Internal Server Error

### CacheException

```java
public class CacheException extends RuntimeException {
    public CacheException(String message) { super(message); }
    public CacheException(String message, Throwable cause) { super(message, cause); }
}
```

**Usage:** Thrown when cache operations fail:
- Hash computation errors
- Cache lookup failures
- Cleanup operation errors

**HTTP Mapping:** 500 Internal Server Error

## Global Exception Handler

### GlobalExceptionHandler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    // Exception handlers for all custom exceptions
    // Maps exceptions to appropriate HTTP responses
}
```

**Features:**
- Centralized exception handling for all controllers
- Structured error responses with `ErrorResponse` DTO
- Field-level validation error details
- Proper HTTP status codes
- Security exception handling (401 Unauthorized, 403 Forbidden)

**Exception Mappings:**
| Exception                      | HTTP Status | Error Message |
|--------------------------------|-------------|---------------|
| `ResourceNotFoundException`    | 404         | Resource not found details |
| `LlmException`                 | 503         | Recipe generation failed |
| `StorageException`             | 500         | File operation failed |
| `CacheException`               | 500         | Cache operation failed |
| `MethodArgumentNotValidException` | 400      | Validation failed with field errors |
| `AuthenticationException`      | 401         | Authentication failed |
| `AccessDeniedException`        | 403         | Access denied |
| `Exception` (generic)          | 500         | Internal server error |

## Error Response Format

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Recipe not found with identifier: 123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2026-02-10T19:45:00",
  "validationErrors": [
    {
      "field": "ingredients",
      "message": "must not be empty",
      "rejectedValue": []
    }
  ]
}
```

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
