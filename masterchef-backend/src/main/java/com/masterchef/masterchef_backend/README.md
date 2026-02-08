# MasterChef Backend - Package Structure

This is the root package for the MasterChef application backend, a production-grade recipe generation system using local LLM inference.

## Architecture Overview

```
com.masterchef.masterchef_backend/
├── models/          - JPA entities mapped to PostgreSQL tables
├── repository/      - Spring Data JPA repositories for data access
├── dto/            - Data Transfer Objects for API contracts
├── llm/            - LLM client abstraction and implementations
├── config/         - Spring configuration beans
└── exception/      - Custom exception types
```

## Tech Stack

- **Java 21** - Virtual threads, records, pattern matching
- **Spring Boot 4.0.2** - Framework foundation
- **PostgreSQL 16** - Database with JSONB, TEXT[] arrays, UUID
- **Flyway** - Database migrations
- **Hibernate 7.2.1** - ORM with modern JPA features
- **Ollama** - Local LLM inference (Mistral 7B)

## Current Status

✅ **Completed:**
- Database schema with 4 tables (users, recipes, recipe_generations, llm_cache)
- JPA entity layer with relationships
- Spring Data repositories with custom queries
- DTO layer for API contracts
- LLM client abstraction (Strategy pattern)
- Ollama HTTP client implementation
- Configuration beans

🚧 **In Progress:**
- Service layer (LlmCacheService, LlmOrchestrator, RecipeService)
- JWT authentication & Spring Security
- REST controllers
- Global exception handling

## Key Design Decisions

1. **Zero Hosting Costs** - LocalStack for AWS emulation, Ollama for local LLM
2. **Content-Addressable Cache** - SHA-256 hashing for deduplication
3. **Audit Trail** - Every LLM call tracked (cost, latency, tokens)
4. **Strategy Pattern** - LlmClient interface allows swapping LLM providers
5. **PostgreSQL-First** - JSONB for flexibility, TEXT[] for arrays, GIN indexes
