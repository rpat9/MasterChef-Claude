# Models Package

JPA entities representing the database schema. All entities use UUID primary keys and audit timestamps.

## Entities

### User.java
- User accounts with authentication and preferences
- Fields: `id`, `email`, `passwordHash`, `name`, `dietaryPreferences` (TEXT[])
- Relationships: One-to-many with Recipe
- Indexes: Unique on email

### Recipe.java
- User-saved recipes with structured content
- Fields: `id`, `userId`, `recipeName`, `ingredientsUsed` (TEXT[]), `instructions` (JSONB), `ingredients` (JSONB), `nutritionInfo` (JSONB), `tags` (TEXT[])
- Relationships: Many-to-one with User
- Indexes: GIN on tags and ingredientsUsed for array searches

### RecipeGeneration.java
- Audit trail for every LLM API call
- Fields: `id`, `userId`, `prompt`, `rawResponse`, `modelUsed`, `tokensUsed`, `costCents`, `cached`, `latencyMs`, `status`
- Immutable: No update timestamp (write-once records)
- Purpose: Cost tracking, debugging, analytics

### LlmCache.java
- Content-addressable cache with TTL
- Fields: `id`, `inputHash` (SHA-256), `response`, `modelUsed`, `temperature`, `maxTokens`, `expiresAt`
- Key Design: No foreign keys (global cache), SHA-256 for deduplication
- Unique constraint on `inputHash`

## Key Patterns

- **UUID Primary Keys** - Distributed system friendly, no sequential ID leaks
- **JSONB Columns** - Flexible schema for recipe data (ingredients, instructions, nutrition)
- **TEXT[] Arrays** - Native PostgreSQL array storage for tags and strings
- **Audit Timestamps** - `@CreationTimestamp` and `@UpdateTimestamp` from Hibernate
- **Bidirectional Relationships** - User ↔ Recipe with `mappedBy` and `@JsonIgnore`
