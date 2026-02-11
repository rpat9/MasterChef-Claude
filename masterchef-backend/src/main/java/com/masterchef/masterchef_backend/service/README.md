# Service Package

Business logic layer implementing core application functionality.

## Overview

This package contains all service classes handling business logic:
- **AuthService**: User authentication and JWT token management
- **RecipeService**: Recipe generation orchestration and CRUD operations
- **LlmOrchestrator**: LLM request coordination with resilience patterns
- **LlmCacheService**: Response caching with SHA-256 content addressing
- **StorageService**: S3 file operations for recipe exports
- **SecretsService**: AWS Secrets Manager integration

All services use:
- `@Service` annotation for Spring component scanning
- Constructor-based dependency injection
- `@Transactional` for database operations
- Structured logging with SLF4J

---

## AuthService

Handles user authentication and JWT token lifecycle.

### Responsibilities
- User registration with password hashing (BCrypt cost 12)
- User login with credential validation
- JWT access token generation (15-min expiration)
- JWT refresh token generation (7-day expiration)
- Token refresh logic

### Key Methods

```java
public AuthResponse register(RegisterRequest request)
```
- Validates email uniqueness
- Hashes password with BCrypt
- Creates user entity
- Generates JWT tokens

```java
public AuthResponse login(LoginRequest request)
```
- Validates credentials
- Generates new JWT tokens
- Records login timestamp

```java
public TokenRefreshResponse refreshToken(String refreshToken)
```
- Validates refresh token
- Generates new access token
- Issues new refresh token

### Security Features
- Password hashing with BCrypt (cost factor 12)
- Stateless JWT authentication
- Email-based user identification
- Token expiration enforcement

---

## RecipeService

Orchestrates recipe generation and manages recipe CRUD operations.

### Responsibilities
- Recipe generation via LLM
- Ingredient normalization (lowercase, trim, dedupe)
- Prompt engineering for structured output
- Recipe persistence and retrieval
- Generation audit trail
- Recipe export to JSON

### Key Methods

```java
@Transactional
public RecipeResponse generateRecipe(RecipeRequest request, UUID userId)
```
- Normalizes ingredients
- Builds structured prompt
- Calls LlmOrchestrator (with caching)
- Parses LLM response to Recipe entity
- Saves recipe and generation metadata
- Returns RecipeResponse DTO

```java
public String exportRecipeAsJson(Recipe recipe)
```
- Serializes recipe to JSON using ObjectMapper
- Used by export endpoint for S3 uploads

### Prompt Engineering
- Requests structured JSON output
- Includes dietary constraints
- Specifies serving size and difficulty
- Provides output schema examples
- Handles markdown code block cleanup

### Error Handling
- Validates LLM response format
- Falls back to simple recipe on parse errors
- Records failures in `recipe_generations` table
- Throws `LlmException` on generation failures

---

## LlmOrchestrator

Coordinates LLM requests with caching, retry, and circuit breaker patterns.

### Responsibilities
- Cache-first request handling
- LLM client invocation
- Response caching
- Resilience pattern application
- Fallback strategies

### Key Methods

```java
@CircuitBreaker(name = "llm-circuit", fallbackMethod = "circuitBreakerFallback")
@Retry(name = "llm-retry")
@RateLimiter(name = "llm-rate", fallbackMethod = "rateLimitFallback")
public LlmResponse generateWithCache(LlmRequest request)
```
- Checks cache first
- Calls LLM if cache miss
- Caches successful responses
- Applies resilience patterns

### Resilience Patterns

**Circuit Breaker:**
- Opens after 50% failure rate
- 60-second wait before retry
- Prevents cascading failures

**Retry:**
- 3 attempts with exponential backoff
- 1-second base delay
- Handles transient errors

**Rate Limiter:**
- 10 requests per minute per instance
- Prevents LLM overload
- Returns cached fallback when limited

### Fallback Methods

```java
private LlmResponse circuitBreakerFallback(LlmRequest request, Exception e)
```
- Returns cached response if available
- Throws LlmException if no cache

```java
private LlmResponse rateLimitFallback(LlmRequest request, RequestNotPermitted e)
```
- Checks cache for similar requests
- Throws LlmException if no cache

---

## LlmCacheService

Manages LLM response caching with content-addressable storage.

### Responsibilities
- SHA-256 hash computation for cache keys
- Cache hit/miss detection
- Response caching with TTL
- Expired entry cleanup
- Cache statistics

### Key Methods

```java
public boolean isCached(LlmRequest request)
```
- Computes SHA-256 hash of normalized input
- Checks if valid (non-expired) cache entry exists

```java
public Optional<LlmResponse> getCachedResponse(LlmRequest request)
```
- Returns cached response if found and valid
- Checks expiration timestamp
- Marks response as cached

```java
@Transactional
public void cacheResponse(LlmRequest request, LlmResponse response)
```
- Computes hash
- Stores response with TTL (7 days default)
- Handles race conditions (checks existence first)

```java
@Transactional
public int cleanupExpiredEntries()
```
- Deletes expired cache entries
- Returns count of deleted entries
- Can be scheduled for periodic cleanup

### Cache Strategy

**Input Normalization:**
```
Hash = SHA-256(prompt.toLowerCase().trim() + "|" + model + "|" + temperature)
```

**Benefits:**
- Consistent hashing for equivalent inputs
- Different models/temperatures = different cache keys
- Case-insensitive matching

**TTL Management:**
- Default: 7 days (configurable via `llm.cache.ttl-days`)
- Expiration checked on retrieval
- Manual cleanup via admin endpoint

### Admin Methods

```java
public long getTotalCacheEntries()
```
- Returns total cache entries (including expired)

```java
public long getExpiredCacheEntries()
```
- Returns count of expired entries

```java
public int clearExpiredCache()
```
- Alias for cleanupExpiredEntries()
- Used by AdminController

---

## StorageService

Handles S3 operations for recipe exports and file storage.

### Responsibilities
- S3 bucket initialization
- Recipe export uploads
- Presigned URL generation
- File deletion
- Health check availability

### Key Methods

```java
@PostConstruct
public void initializeBucket()
```
- Runs on application startup
- Creates S3 bucket if not exists
- Verifies bucket accessibility

```java
public String uploadRecipeExport(UUID userId, UUID recipeId, byte[] content, String contentType)
```
- Generates S3 key: `exports/{userId}/{recipeId}.{ext}`
- Uploads file to S3
- Returns S3 object key

```java
public String generatePresignedUrl(String key)
```
- Creates presigned URL for download
- 15-minute expiration
- Works with LocalStack and production

```java
public void deleteObject(String key)
```
- Deletes S3 object by key
- Used during recipe deletion
- Throws StorageException on failure

### LocalStack Support
- Uses `aws.use-localstack` property
- Overrides endpoint URL for local development
- Enables force path style for LocalStack compatibility

---

## SecretsService

Integrates with AWS Secrets Manager for secure credential storage.

### Responsibilities
- Secret retrieval
- Secret creation/update
- JSON secret parsing
- Health check availability

### Key Methods

```java
public String getSecret(String secretId)
```
- Fetches secret value from Secrets Manager
- Returns raw string value
- Throws exception on failure

```java
public Map<String, String> getSecretAsMap(String secretId)
```
- Fetches secret and parses as JSON
- Returns key-value map
- Useful for database credentials

```java
public void createOrUpdateSecret(String secretId, String secretValue)
```
- Creates new secret or updates existing
- Handles versioning automatically

```java
public boolean isAvailable()
```
- Tests Secrets Manager connectivity
- Used by health check indicator

### Use Cases
- Database credentials (RDS)
- API keys (future: OpenAI)
- JWT signing secret (future: rotation)

---

## Service Layer Patterns

### Dependency Injection
```java
@Service
@RequiredArgsConstructor
public class RecipeService {
    private final LlmOrchestrator llmOrchestrator;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    // All dependencies injected via constructor
}
```

### Transaction Management
```java
@Transactional
public RecipeResponse generateRecipe(RecipeRequest request, UUID userId) {
    // All database operations in single transaction
    // Automatic rollback on exception
}
```

### Logging Strategy
```java
@Slf4j
public class RecipeService {
    public RecipeResponse generateRecipe(...) {
        log.info("Generating recipe for user: {}, ingredients: {}", userId, ingredients);
        // ...
        log.info("Recipe generated: id={}, title={}", recipe.getId(), recipe.getTitle());
    }
}
```

### Error Handling
```java
public RecipeResponse generateRecipe(...) {
    try {
        // Business logic
    } catch (JsonProcessingException e) {
        log.error("Failed to parse LLM response: {}", e.getMessage());
        // Create fallback recipe
    }
}
```

---

## Testing Services

### Unit Testing
```java
@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {
    @Mock
    private LlmOrchestrator llmOrchestrator;
    
    @Mock
    private RecipeRepository recipeRepository;
    
    @InjectMocks
    private RecipeService recipeService;
    
    @Test
    void testGenerateRecipe() {
        // Arrange
        when(llmOrchestrator.generateWithCache(any()))
            .thenReturn(mockLlmResponse);
        
        // Act
        RecipeResponse response = recipeService.generateRecipe(request, userId);
        
        // Assert
        assertNotNull(response);
        verify(recipeRepository).save(any());
    }
}
```

### Integration Testing
```java
@SpringBootTest
@Transactional
class RecipeServiceIntegrationTest {
    @Autowired
    private RecipeService recipeService;
    
    @Test
    void testEndToEndRecipeGeneration() {
        RecipeResponse response = recipeService.generateRecipe(request, userId);
        assertNotNull(response.getId());
    }
}
```

---

## Best Practices

### Service Responsibilities
✅ **DO:**
- Implement business logic
- Coordinate multiple repositories
- Apply transaction boundaries
- Perform data validation
- Handle error scenarios
- Log important operations

❌ **DON'T:**
- Handle HTTP-specific concerns (controllers only)
- Directly manipulate HTTP requests/responses
- Perform UI/view logic
- Access security context directly
- Contain SQL/JPQL queries (repositories only)

### Performance Considerations
- Use caching for expensive operations
- Apply pagination for large result sets
- Minimize database round trips
- Batch operations when possible
- Monitor slow queries (Performance Insights)

### Security Considerations
- Validate user ownership before operations
- Never trust user input without validation
- Use parameterized queries (JPA handles this)
- Log security-relevant events
- Don't log sensitive data (passwords, tokens)
