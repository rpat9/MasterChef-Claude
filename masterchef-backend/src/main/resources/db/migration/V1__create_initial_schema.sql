-- MasterChef Backend - Initial Database Schema
-- Version: 1
-- Description: Create users, recipes, recipe_generation, and llm_cache tables

-- Enable UUID extension which comes built in with PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
-- User accounts with authentication and dietary preferences
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    dietary_preferences TEXT[] DEFAULT '{}', -- Array, e.g: Vegan, gluten-free, etc.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email); -- Index the emails for faster lookups during login


-- Recipe table
-- User-saved recipes with full structured content
CREATE TABLE recipes(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    prep_time INTEGER, -- Minutes
    cook_time INTEGER, -- Minutes
    total_time INTEGER, -- Minutes
    servings INTEGER,
    difficulty VARCHAR(50), -- easy, medium, hard
    cuisine VARCHAR(100),
    ingredients_used TEXT[] NOT NULL, -- Ingredient list from the request
    instructions JSONB,
    ingredients JSONB, -- Array of ingredient objects: [[name, amount, unit]]
    nutrition_info JSONB, -- Calories, protein, carbs, fat
    tags TEXT[] DEFAULT '{}', -- Searchable tags
    is_saved BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_recipes_tags ON recipes USING GIN(tags); -- For fast array searches


-- Recipe generation table
-- Audit trail for every LLM API call (cached or not)
CREATE TABLE recipe_generations(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Allowing orphaned records
    ingredients TEXT[] NOT NULL,
    dietary_preferences TEXT[] DEFAULT '{}',
    prompt TEXT NOT NULL, -- Full prompt sent to LLM
    raw_response TEXT, -- Raw LLM Output
    model_used VARCHAR(100) NOT NULL,
    tokens_used INTEGER,
    cost_cents INTEGER DEFAULT 0,
    cached BOOLEAN DEFAULT false,
    latency_ms BIGINT, -- Response time in milliseconds
    status VARCHAR(50) NOT NULL, -- SUCCESS, CACHE HIT, FAILED, TIMEOUT
    error_message TEXT, -- If status is failing
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_recipe_generations_user_id ON recipe_generations(user_id);
CREATE INDEX idx_recipe_generations_created_at ON recipe_generations(created_at DESC);
CREATE INDEX idx_recipe_generations_status ON recipe_generations(status);
CREATE INDEX idx_recipe_generations_cached ON recipe_generations(cached);


-- LLM Cache table
-- Content-addressable cache keyed by SHA-256 hash of prompt
CREATE TABLE llm_cache(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    input_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hex is 64 chars
    response TEXT NOT NULL,
    model VARCHAR(100) NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_llm_cache_input_hash ON llm_cache(input_hash);
CREATE INDEX idx_llm_cache_expires_at ON llm_cache(expires_at);


-- Trigger for auto updated_at on row modifications
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at field
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with JWT authentication';
COMMENT ON TABLE recipes IS 'User-saved recipes with full structured content';
COMMENT ON TABLE recipe_generations IS 'Audit trail for all LLM API calls';
COMMENT ON TABLE llm_cache IS 'Content-addressable LLM response cache';

COMMENT ON COLUMN recipes.ingredients_used IS 'Original ingredient strings from user input';
COMMENT ON COLUMN recipes.instructions IS 'JSONB array of step by step instructions';
COMMENT ON COLUMN recipes.ingredients IS 'JSONB array of structured ingredients with amounts';
COMMENT ON COLUMN llm_cache.input_hash IS 'SHA-256 hash of normalized prompt for deduplication';