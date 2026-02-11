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
// Generation counts
long countByUserId(UUID userId); // Total generations
long countByUserIdAndCachedTrue(UUID userId); // Cache hits

// Performance metrics
@Query("SELECT AVG(rg.latencyMs) FROM RecipeGeneration rg WHERE rg.userId = :userId")
Double calculateAverageLatencyByUserId(@Param("userId") UUID userId);

// Cost tracking
@Query("SELECT SUM(rg.tokensUsed) FROM RecipeGeneration rg WHERE rg.userId = :userId")
Long sumTokensUsedByUserId(@Param("userId") UUID userId);

// Generation history
Page<RecipeGeneration> findByUserId(UUID userId, Pageable pageable);
```

**Metrics Queries:**
- `countByUserId()` - Total recipe generations per user
- `countByUserIdAndCachedTrue()` - Cache hit count for hit rate calculation
- `calculateAverageLatencyByUserId()` - Average LLM response time (ms)
- `sumTokensUsedByUserId()` - Total tokens consumed (cost analysis)
- `findByUserId()` - Paginated generation history with all metadata

**Used By:**
- `RecipeController.getUserMetrics()` - User performance dashboard
- `RecipeController.getGenerationHistory()` - Audit trail

### LlmCacheRepository
```java
// Cache lookup
@Query("SELECT lc FROM LlmCache lc WHERE lc.inputHash = :inputHash AND lc.expiresAt > :now")
Optional<LlmCache> findValidCacheByHash(@Param("inputHash") String inputHash, 
                                        @Param("now") LocalDateTime now);

// Cache cleanup
@Modifying
@Query("DELETE FROM LlmCache lc WHERE lc.expiresAt < :now")
int deleteExpiredEntries(@Param("now") LocalDateTime now);

// Cache statistics
long count(); // Total entries
long countByExpiresAtBefore(LocalDateTime now); // Expired count

@Query("SELECT COUNT(rg) FROM RecipeGeneration rg WHERE rg.cached = true")
long countCacheHits(); // Global cache hits

@Query("SELECT COUNT(rg) FROM RecipeGeneration rg WHERE rg.cached = false")
long countCacheMisses(); // Global cache misses
```

**Cache Operations:**
- `findValidCacheByHash()` - SHA-256 content-addressable lookup with TTL check
- `deleteExpiredEntries()` - Bulk delete expired cache entries (returns count)

**Cache Statistics:**
- `count()` - Total cache entries (including expired)
- `countByExpiresAtBefore()` - Expired entries count
- `countCacheHits()` - Global cache hit count from generation history
- `countCacheMisses()` - Global cache miss count from generation history

**Used By:**
- `LlmCacheService.getCachedResponse()` - Cache retrieval
- `LlmCacheService.cleanupExpiredEntries()` - Scheduled cleanup
- `AdminController.getCacheStats()` - Cache monitoring dashboard

## Key Patterns

- **Derived Query Methods** - Spring Data generates SQL from method names
- **@Query Annotations** - Custom JPQL for complex queries
- **Pagination** - `Pageable` parameter for efficient large dataset handling
- **Optional<T>** - Type-safe null handling
- **Native PostgreSQL** - Leveraging GIN indexes for array searches (commented out due to Hibernate 7.x syntax changes)
