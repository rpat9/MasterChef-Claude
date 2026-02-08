# Repository Package

Spring Data JPA repositories providing data access layer with zero boilerplate SQL.

## Repositories

### UserRepository
```java
Optional<User> findByEmail(String email);
boolean existsByEmail(String email);
```
- Used for authentication and registration
- Email uniqueness validation

### RecipeRepository
```java
Page<Recipe> findByUserId(UUID userId, Pageable pageable);
List<Recipe> findByUserIdAndRecipeNameContainingIgnoreCase(UUID userId, String search);
```
- User-scoped recipe queries
- Pagination support for large result sets
- Case-insensitive search

### RecipeGenerationRepository
```java
long countByUserIdAndCachedTrue(UUID userId);
Double calculateAverageLatencyByUserId(UUID userId);
Long sumTokensUsedByUserId(UUID userId);
```
- Metrics and analytics queries
- Cache hit rate calculation
- Cost tracking per user

### LlmCacheRepository
```java
Optional<LlmCache> findValidCacheByHash(String inputHash, LocalDateTime now);
void deleteExpiredEntries(LocalDateTime now);
```
- Cache lookup by SHA-256 hash
- TTL-based expiration cleanup

## Key Patterns

- **Derived Query Methods** - Spring Data generates SQL from method names
- **@Query Annotations** - Custom JPQL for complex queries
- **Pagination** - `Pageable` parameter for efficient large dataset handling
- **Optional<T>** - Type-safe null handling
- **Native PostgreSQL** - Leveraging GIN indexes for array searches (commented out due to Hibernate 7.x syntax changes)
