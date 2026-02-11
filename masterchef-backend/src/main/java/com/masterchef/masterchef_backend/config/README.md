# Config Package

Spring configuration beans for application-wide dependencies.

## RestTemplateConfig

Provides a configured `RestTemplate` bean for HTTP communication with external services (Ollama, LocalStack).

### Configuration

```java
@Bean
public RestTemplate restTemplate() {
    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(10_000);   // 10 seconds
    factory.setReadTimeout(120_000);     // 120 seconds (LLM generation)
    return new RestTemplate(factory);
}
```

### Timeout Strategy
- **Connect Timeout (10s)** - Fail fast if service is unreachable
- **Read Timeout (120s)** - Allow sufficient time for LLM inference (Mistral 7B can take 15-30s for recipe generation)

### Why Not RestTemplateBuilder?
Spring Boot 4.x has different auto-configuration than 3.x. Using `SimpleClientHttpRequestFactory` directly avoids compatibility issues.

## SecurityConfig ✅

Spring Security configuration with JWT authentication.

### Implementation
- JWT token validation via JwtAuthenticationFilter
- Spring Security filter chain with stateless session management
- Public endpoints: `/api/v1/auth/**`, `/actuator/**`, `/swagger-ui/**`
- Protected endpoints: All `/api/v1/recipes/**` require valid JWT
- BCrypt password encoder with cost factor 12
- CORS configuration for local development

### Token Configuration
- Access tokens: 15-minute expiration
- Refresh tokens: 7-day expiration
- Signing algorithm: HS512
- Secret key: Base64-encoded from application.yml

## AwsConfig ✅

AWS SDK v2 client configuration for S3, CloudWatch Logs, and Secrets Manager.

### Implementation
```java
@Configuration
public class AwsConfig {
    @Bean
    public S3Client s3Client() { /* LocalStack or production */ }
    
    @Bean
    public CloudWatchLogsClient cloudWatchLogsClient() { /* ... */ }
    
    @Bean
    public SecretsManagerClient secretsManagerClient() { /* ... */ }
}
```

### Features
- **LocalStack Support**: Uses `aws.use-localstack` property to switch between local and production
- **Conditional Endpoints**: Overrides AWS endpoints for LocalStack (localhost:4566)
- **Credential Handling**: Dummy credentials for LocalStack, IAM roles for production
- **Force Path Style**: Enabled for LocalStack S3 compatibility

### Production Pattern
- ECS task roles provide credentials automatically
- No API keys in code or environment variables
- Least-privilege IAM policies

## HealthCheckConfig ✅

Custom health indicators for external service dependencies.

### Implementation
```java
@Configuration
public class HealthCheckConfig {
    @Bean
    public HealthIndicator s3HealthIndicator() { /* ... */ }
    
    @Bean
    public HealthIndicator secretsManagerHealthIndicator() { /* ... */ }
    
    @Bean
    public HealthIndicator llmHealthIndicator() { /* ... */ }
}
```

### Health Checks
- **S3**: Verifies bucket accessibility
- **Secrets Manager**: Tests secret retrieval
- **LLM (Ollama)**: Checks model availability
- **PostgreSQL**: Built-in Spring Boot check
- **Disk Space**: Built-in Spring Boot check

### Endpoint
`GET /actuator/health` returns:
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "healthCheckConfig.S3": { "status": "UP" },
    "healthCheckConfig.SecretsManager": { "status": "UP" },
    "healthCheckConfig.Llm": { "status": "UP" }
  }
}
```

## Resilience4j Config ✅

Resilience patterns for LLM orchestration.

### Implementation
Configured via `application.yml`:

```yaml
resilience4j:
  circuitbreaker:
    instances:
      llm-circuit:
        failure-rate-threshold: 50
        wait-duration-in-open-state: 60s
  
  retry:
    instances:
      llm-retry:
        max-attempts: 3
        wait-duration: 1s
  
  ratelimiter:
    instances:
      llm-rate:
        limit-for-period: 10
        limit-refresh-period: 1m
```

### Patterns Applied
- **Circuit Breaker**: Opens after 50% failure rate, prevents cascading failures
- **Retry**: 3 attempts with exponential backoff for transient errors
- **Rate Limiter**: 10 requests per minute per instance

### Usage in LlmOrchestrator
```java
@CircuitBreaker(name = "llm-circuit", fallbackMethod = "circuitBreakerFallback")
@Retry(name = "llm-retry")
@RateLimiter(name = "llm-rate", fallbackMethod = "rateLimitFallback")
public LlmResponse generateWithCache(LlmRequest request) { /* ... */ }
```

## Future Configs (Planned)

### Resilience4jConfig
- Circuit breaker for LLM calls (fail open after 5 consecutive errors)
- Retry policy (3 attempts with exponential backoff)
- Rate limiter (10 requests/second per user)

### LocalStackConfig
- S3 client for recipe image storage
- CloudWatch client for production-grade logging
- Secrets Manager client for sensitive configs

### CacheConfig
- Caffeine in-memory cache for hot paths
- TTL aligned with database cache expiration

## Key Patterns

- **Constructor-based DI** - No field injection
- **@Bean methods** - Explicit bean creation with fine-grained control
- **Timeout Configuration** - Always configure timeouts for external calls
- **Environment-specific Configs** - Use @Profile for dev/prod differences
