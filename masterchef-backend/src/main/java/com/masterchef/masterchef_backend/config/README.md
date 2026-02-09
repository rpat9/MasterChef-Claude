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
