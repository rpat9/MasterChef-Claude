# Database Migrations

Flyway migration scripts for version-controlled database schema changes.

## Migration Strategy

- **Versioned Migrations** - V1, V2, V3... applied in order
- **Immutable** - Once applied, never modify existing migrations
- **Forward-Only** - No automatic rollbacks (create new migration to revert)
- **Validated** - Hibernate validates JPA entities match schema

## V1__create_initial_schema.sql

Creates foundation schema for MasterChef application.

### Tables Created

**users**
- Primary key: `id` (UUID)
- Unique constraint: `email`
- Audit columns: `created_at`, `updated_at` (auto-updated via trigger)
- Array column: `dietary_preferences` (TEXT[])

**recipes**
- Primary key: `id` (UUID)
- Foreign key: `user_id` → users.id (ON DELETE CASCADE)
- JSONB columns: `instructions`, `ingredients`, `nutrition_info`
- Array columns: `ingredients_used`, `tags` (TEXT[])
- GIN indexes: On `tags` and `ingredients_used` for array searches

**recipe_generations**
- Primary key: `id` (UUID)
- Foreign key: `user_id` → users.id (ON DELETE SET NULL, nullable)
- Audit columns: Cost tracking (`tokens_used`, `cost_cents`), performance (`latency_ms`), status
- Purpose: Complete audit trail of LLM API calls

**llm_cache**
- Primary key: `id` (UUID)
- Unique constraint: `input_hash` (SHA-256, VARCHAR(64))
- TTL column: `expires_at`
- No foreign keys: Global cache shared across all users

### PostgreSQL Features Used

1. **pgcrypto Extension** - UUID generation via `gen_random_uuid()`
2. **JSONB** - Flexible schema for recipe data
3. **TEXT[]** - Native array storage
4. **GIN Indexes** - Fast array element searches
5. **Triggers** - Auto-update `updated_at` on row modifications
6. **ON DELETE Policies** - CASCADE for recipes, SET NULL for generations

### Design Decisions

- **uuid-ossp NOT USED** - `pgcrypto` provides `gen_random_uuid()`
- **JSONB over JSON** - Better indexing and query performance
- **TEXT[] over VARCHAR[]** - No length limits
- **Audit Trails** - `recipe_generations` never deleted (compliance, debugging)
- **Content-Addressable Cache** - SHA-256 hash prevents duplicates

## Future Migrations (Planned)

- **V2** - Add user profile columns (avatar_url, bio, preferences)
- **V3** - Add recipe ratings and comments tables
- **V4** - Add meal planning tables (weekly plans, grocery lists)
- **V5** - Add social features (followers, shared recipes)

## Running Migrations

```bash
# Via Maven plugin
./mvnw flyway:migrate

# Automatically on Spring Boot startup (configured in application.yml)
./mvnw spring-boot:run
```

## Validation

Hibernate validates JPA entities against schema on startup:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # Fail if mismatch
```
