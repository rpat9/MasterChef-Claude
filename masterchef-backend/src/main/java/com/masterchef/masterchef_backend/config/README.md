# Config Package

Spring configuration beans for application-wide dependencies.

## RestTemplateConfig

Provides a configured `RestTemplate` bean for HTTP communication with external services (Ollama, LocalStack).

### Configuration

```java
@Bean
public RestTemplate restTemplate() {
    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(10_000);  // 10 seconds
    factory.setReadTimeout(30_000);     // 30 seconds
    return new RestTemplate(factory);
}
```

### Timeout Strategy
- **Connect Timeout (10s)** - Fail fast if service is unreachable
- **Read Timeout (30s)** - Allow time for LLM inference (Mistral 7B can take 10-20s for long responses)

### Why Not RestTemplateBuilder?
Spring Boot 4.x has different auto-configuration than 3.x. Using `SimpleClientHttpRequestFactory` directly avoids compatibility issues.

## Future Configs (Planned)

### SecurityConfig
- JWT token validation
- Spring Security filter chain
- Public endpoints: /api/v1/auth/*, /actuator/health
- Protected endpoints: /api/v1/recipes/*

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
