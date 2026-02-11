# MasterChef Backend - Package Structure

This is the root package for the MasterChef application backend, a production-grade recipe generation system using local LLM inference.

## Architecture Overview

```
com.masterchef.masterchef_backend/
├── models/          - JPA entities mapped to PostgreSQL tables
├── repository/      - Spring Data JPA repositories for data access
├── dto/            - Data Transfer Objects for API contracts
├── llm/            - LLM client abstraction and implementations
├── service/        - Business logic layer (recipe generation, caching, storage)
├── controller/     - REST API endpoints (auth, recipes, admin)
├── config/         - Spring configuration beans (AWS, security, resilience)
├── exception/      - Custom exception types + GlobalExceptionHandler
└── security/       - JWT authentication filter and token provider
```

## Tech Stack

- **Java 21** - Virtual threads, records, pattern matching
- **Spring Boot 4.0.2** - Framework foundation
- **PostgreSQL 16** - Database with JSONB, TEXT[] arrays, UUID, GIN indexes
- **Flyway** - Database migrations
- **Hibernate 7.2.1** - ORM with modern JPA features
- **Ollama** - Local LLM inference (Mistral 7B)
- **AWS SDK v2** - S3, CloudWatch, Secrets Manager (with LocalStack support)
- **Resilience4j 2.2.0** - Circuit breaker, retry, rate limiter
- **Spring Security 6.x** - Stateless JWT authentication
- **Docker:**

**Foundation**
- Database schema with 4 tables (users, recipes, recipe_generations, llm_cache)
- JPA entity layer with relationships
- Spring Data repositories with custom queries and metrics
- DTO layer for API contracts
- LLM client abstraction (Strategy pattern)
- Ollama HTTP client implementation
- JWT authentication with Spring Security (JwtTokenProvider, JwtAuthenticationFilter)
- Service layer (AuthService, RecipeService)
- REST controllers (AuthController, RecipeController basic endpoints)

**AWS Integration & Resilience**
- AWS SDK v2 clients (S3Client, CloudWatchLogsClient, SecretsManagerClient)
- LocalStack integration for local development
- StorageService for S3 operations (export, presigned URLs)
- SecretsService for AWS Secrets Manager
- LlmCacheService with SHA-256 content-addressable caching
- Resilience4j patterns (circuit breaker, retry, rate limiter)
- Custom health checks (S3, Secrets Manager, LLM availability)
- AwsConfig with environment-based endpoint switching

**Full REST API**
- RecipeController expansion:
  - `GET /api/v1/recipes` - Paginated recipe list
  - `GET /api/v1/recipes/{id}` - Single recipe with ownership verification
  - `DELETE /api/v1/recipes/{id}` - Recipe deletion with S3 cleanup
  - `POST /api/v1/recipes/{id}/export` - S3 export with presigned URL
  - `GET /api/v1/recipes/history` - Generation history
  - `GET /api/v1/recipes/metrics` - User performance metrics
- AdminController:
  - `GET /api/v1/admin/cache/stats` - Cache statistics
  - `DELETE /api/v1/admin/cache` - Clear expired cache entries
- New DTOs:
  - RecipeExportResponse, GenerationHistoryResponse
  - UserMetricsResponse, CacheStatsResponse
- Exception handling:
  - ResourceNotFoundException, StorageException, CacheException
  - GlobalExceptionHandler with HTTP status mapping

**Production Infrastructure**
- Terraform modules (networking, IAM, RDS, ECS)
- Production-ready AWS architecture
- VPC with public/private subnets
- ECS Fargate with ALB
- RDS PostgreSQL Multi-AZ
- Comprehensive documentation

🎯 **Production-Ready:**
All code is production-grade but runs locally using LocalStack for zero hosting costs. Everything works identically whether using LocalStack or actual AWS services.6 content-addressable caching)
- Recipe management endpoints (save, retrieve, search)
- Resilience patterns (circuit breaker, retry, rate limiting)
- AWS integration (S3, CloudWatch via LocalStack)
- Global exception handling

## Key Design Decisions

1. **Zero Hosting Costs** - LocalStack for AWS emulation, Ollama for local LLM
2. **Content-Addressable Cache** - SHA-256 hashing for deduplication
3. **Audit Trail** - Every LLM call tracked (cost, latency, tokens)
4. **Strategy Pattern** - LlmClient interface allows swapping LLM providers
5. **PostgreSQL-First** - JSONB for flexibility, TEXT[] for arrays, GIN indexes
