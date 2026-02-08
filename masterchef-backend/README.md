# MasterChef Backend

> **Production-ready AI-powered recipe generation service** with JWT authentication, cost-aware LLM orchestration, and AWS-native architecture

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Why This Architecture?](#why-this-architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [AWS Deployment](#aws-deployment)
- [Architecture Deep Dive](#architecture-deep-dive)
- [Development](#development)

---

## 🎯 Overview

MasterChef Backend is a **production-grade REST API** that generates personalized recipes using AI (local LLM inference), with full user authentication, recipe management, and cost-optimized caching.

### Key Capabilities

- 🔐 **JWT Authentication** - Secure, stateless auth with Spring Security
- 🤖 **AI Recipe Generation** - Local LLM (Ollama/Mistral 7B) with no API costs
- 💾 **Smart Caching** - SHA-256 content hashing reduces redundant LLM calls
- 📊 **Observability** - Structured logging, metrics, and health checks
- ☁️ **AWS-Ready** - Full Terraform IaC; works with LocalStack locally
- 🔄 **Resilience** - Circuit breakers, retries, rate limiting
- 📖 **Auto-Generated Docs** - OpenAPI 3.0 spec via Springdoc

---

## 🏗️ Why This Architecture?

### Design Principles

1. **Production-First** - Not a toy project. Every pattern (security, caching, observability) is enterprise-grade
2. **Cloud-Native** - Designed for AWS ECS deployment with full Terraform definitions
3. **Cost-Aware** - Local LLM inference + aggressive caching = $0 AI costs
4. **Developer Experience** - `docker-compose up` gets you a working system in seconds

### Why Not Deployed?

This system is **deployment-ready** for AWS (ECS, RDS, S3, CloudWatch). The infrastructure is fully defined in Terraform and validated. **Anyone can clone and deploy** to their own AWS account.

The maintainer chooses not to deploy to avoid recurring costs (~$50-100/month for minimal traffic). Instead, all AWS services are emulated locally using **LocalStack**, proving AWS competency without burning money.

**Translation**: *"I know how to deploy to AWS. I'm choosing not to pay for it."*

---

## 🚀 Tech Stack

### Core

| Component            | Technology               | Purpose                                    |
|----------------------|--------------------------|--------------------------------------------|
| **Language**         | Java 21                  | Virtual threads, records, pattern matching |
| **Framework**        | Spring Boot 4.0.2        | Enterprise web framework                   |
| **Security**         | Spring Security + JWT    | Stateless authentication                   |
| **Database**         | PostgreSQL 16            | Primary data store                         |
| **Migrations**       | Flyway                   | Version-controlled schema changes          |

### AI & Caching

| Component            | Technology               | Purpose                                    |
|----------------------|--------------------------|--------------------------------------------|
| **LLM Runtime**      | Ollama (Mistral 7B)      | Local AI inference                         |
| **Cache Store**      | PostgreSQL (in-table)    | Content-addressable LLM response cache     |
| **Hashing**          | SHA-256                  | Prompt deduplication                       |

### AWS Integration

| Component            | Technology               | Local Equivalent                           |
|----------------------|--------------------------|--------------------------------------------|
| **Object Storage**   | AWS S3                   | LocalStack S3                              |
| **Logging**          | CloudWatch Logs          | LocalStack CloudWatch                      |
| **Secrets**          | Secrets Manager          | LocalStack Secrets Manager                 |
| **Deployment**       | ECS Fargate              | Docker Compose (local)                     |
| **Database**         | RDS PostgreSQL           | PostgreSQL container (local)               |

### Observability

| Component            | Technology               | Purpose                                    |
|----------------------|--------------------------|--------------------------------------------|
| **Metrics**          | Micrometer               | Prometheus-compatible metrics              |
| **Health Checks**    | Spring Actuator          | `/actuator/health` endpoints               |
| **Logging**          | SLF4J + Logback          | Structured JSON logs                       |
| **Tracing**          | MDC (Mapped Diagnostic)  | Request correlation                        |

### Resilience

| Component            | Technology               | Purpose                                    |
|----------------------|--------------------------|--------------------------------------------|
| **Circuit Breaker**  | Resilience4j             | Fail-fast on LLM outages                   |
| **Retry**            | Resilience4j             | Handle transient failures                  |
| **Rate Limiting**    | Resilience4j             | Prevent abuse                              |
| **Timeouts**         | Resilience4j             | Prevent thread starvation                  |

---

## ✨ Features

### Authentication & User Management

- ✅ User registration with email validation
- ✅ Secure password hashing (BCrypt)
- ✅ JWT token generation (access + refresh tokens)
- ✅ Token-based API authentication
- ✅ User profile management
- ✅ Dietary preference storage

### Recipe Generation

- ✅ AI-powered recipe creation from 3-15 ingredients
- ✅ Dietary preference filtering (vegan, gluten-free, keto, etc.)
- ✅ Structured output (title, description, instructions, nutrition)
- ✅ Response caching (40%+ hit rate in testing)
- ✅ Cost tracking (tokens used, estimated $)
- ✅ Generation history per user

### Recipe Management

- ✅ Save recipes to personal collection
- ✅ Retrieve all saved recipes
- ✅ Remove recipes from collection
- ✅ Search/filter by ingredients or tags
- ✅ Export to S3 (via LocalStack)

### Observability

- ✅ Health checks for all dependencies
- ✅ Custom metrics (latency, cache hit rate, token usage)
- ✅ Structured logging with request correlation
- ✅ Auto-generated OpenAPI documentation

---

## 🏁 Getting Started

### Prerequisites

- **Java 21**
- **Docker & Docker Compose** - [Download](https://www.docker.com/products/docker-desktop)
- **Maven 3.9+**

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/rpat9/MasterChef-Claude.git
cd MasterChef-Claude/masterchef-backend

# 2. Start infrastructure (PostgreSQL, Ollama, LocalStack)
docker-compose up -d

# 3. Wait for Ollama to pull the model (first time only, ~5 minutes)
docker-compose logs -f ollama

# 4. Run database migrations
./mvnw flyway:migrate

# 5. Start the application
./mvnw spring-boot:run

# 6. Verify health
curl http://localhost:8080/actuator/health
```

The API will be available at `http://localhost:8080`

### Swagger UI

Visit `http://localhost:8080/swagger-ui.html` for interactive API documentation.

---

## 📁 Project Structure

```
masterchef-backend/
├── src/
│   ├── main/
│   │   ├── java/com/masterchef/masterchef_backend/
│   │   │   ├── config/              # Configuration beans
│   │   │   │   ├── SecurityConfig.java        # Spring Security + JWT
│   │   │   │   ├── AwsConfig.java             # S3, CloudWatch, Secrets
│   │   │   │   ├── ResilienceConfig.java      # Circuit breaker, retry
│   │   │   │   └── WebConfig.java             # CORS, request logging
│   │   │   ├── controller/          # REST API endpoints
│   │   │   │   ├── AuthController.java        # /api/v1/auth/*
│   │   │   │   ├── UserController.java        # /api/v1/users/*
│   │   │   │   ├── RecipeController.java      # /api/v1/recipes/*
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── service/             # Business logic
│   │   │   │   ├── AuthService.java           # Registration, login
│   │   │   │   ├── UserService.java           # Profile management
│   │   │   │   ├── RecipeService.java         # Recipe generation
│   │   │   │   ├── LlmOrchestrator.java       # LLM routing + caching
│   │   │   │   ├── LlmCacheService.java       # Cache operations
│   │   │   │   └── StorageService.java        # S3 operations
│   │   │   ├── security/            # JWT & Auth
│   │   │   │   ├── JwtTokenProvider.java      # Token generation
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   └── UserDetailsServiceImpl.java
│   │   │   ├── repository/          # Data access (JPA)
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── RecipeRepository.java
│   │   │   │   ├── RecipeGenerationRepository.java
│   │   │   │   └── LlmCacheRepository.java
│   │   │   ├── model/               # JPA entities
│   │   │   │   ├── User.java
│   │   │   │   ├── Recipe.java
│   │   │   │   ├── RecipeGeneration.java
│   │   │   │   └── LlmCache.java
│   │   │   ├── dto/                 # Request/response objects
│   │   │   │   ├── auth/            # Auth DTOs
│   │   │   │   ├── recipe/          # Recipe DTOs
│   │   │   │   └── user/            # User DTOs
│   │   │   ├── exception/           # Custom exceptions
│   │   │   └── llm/                 # LLM abstraction
│   │   │       ├── LlmClient.java (interface)
│   │   │       ├── OllamaClient.java
│   │   │       └── MockLlmClient.java
│   │   └── resources/
│   │       ├── application.yml               # Main config
│   │       ├── application-local.yml         # Local overrides
│   │       └── db/migration/                 # Flyway SQL scripts
│   └── test/                        # Unit & integration tests
├── infrastructure/
│   ├── docker/
│   │   └── docker-compose.yml       # Local development stack
│   ├── terraform/
│   │   ├── main.tf                  # AWS ECS deployment
│   │   ├── modules/                 # Terraform modules
│   │   └── environments/            # Environment configs
│   └── localstack/
│       └── init-localstack.sh       # LocalStack initialization
├── docs/
│   ├── ARCHITECTURE.md              # System design deep dive
│   ├── SCOPE.md                     # Feature scope document
│   └── API.md                       # API endpoint reference
├── pom.xml                          # Maven dependencies
└── README.md                        # This file
```

---

## 📖 API Documentation

### Base URL

```
http://localhost:8080/api/v1
```

### Authentication Endpoints

| Method | Endpoint               | Description                  | Auth Required |
|--------|------------------------|------------------------------|---------------|
| POST   | `/auth/register`       | Register new user            | No            |
| POST   | `/auth/login`          | Login and get JWT            | No            |
| POST   | `/auth/refresh`        | Refresh access token         | Yes (Refresh) |
| POST   | `/auth/logout`         | Logout (invalidate token)    | Yes           |

### User Endpoints

| Method | Endpoint                      | Description                  | Auth Required |
|--------|-------------------------------|------------------------------|---------------|
| GET    | `/users/profile`              | Get current user profile     | Yes           |
| PUT    | `/users/profile`              | Update user profile          | Yes           |
| PUT    | `/users/dietary-preferences`  | Update dietary preferences   | Yes           |

### Recipe Endpoints

| Method | Endpoint                 | Description                  | Auth Required |
|--------|--------------------------|------------------------------|---------------|
| POST   | `/recipes/generate`      | Generate recipe from ingredients | Yes       |
| GET    | `/recipes/history`       | Get generation history       | Yes           |
| GET    | `/recipes/saved`         | Get all saved recipes        | Yes           |
| POST   | `/recipes/saved`         | Save a recipe                | Yes           |
| DELETE | `/recipes/saved/{id}`    | Remove saved recipe          | Yes           |

### Example: Generate Recipe

**Request:**
```bash
curl -X POST http://localhost:8080/api/v1/recipes/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": ["chicken", "garlic", "butter", "thyme"],
    "dietaryPreferences": ["gluten-free"],
    "servings": 4
  }'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Garlic Butter Chicken with Herbs",
  "description": "Tender, juicy chicken thighs with crispy skin...",
  "prepTime": 15,
  "cookTime": 30,
  "totalTime": 45,
  "servings": 4,
  "difficulty": "easy",
  "ingredients": [
    { "name": "chicken thighs", "amount": "4", "unit": "pieces" },
    { "name": "garlic", "amount": "6", "unit": "cloves" },
    { "name": "butter", "amount": "4", "unit": "tbsp" },
    { "name": "fresh thyme", "amount": "2", "unit": "sprigs" }
  ],
  "instructions": [
    "Preheat oven to 425°F (220°C).",
    "Season chicken generously with salt and pepper.",
    "...",
  ],
  "tags": ["Chicken", "Gluten-Free", "Easy"],
  "nutritionInfo": {
    "calories": 380,
    "protein": 32,
    "carbs": 2,
    "fat": 27
  },
  "isSaved": false,
  "generatedAt": "2026-02-07T14:23:01Z"
}
```

For complete API documentation, visit `/swagger-ui.html` when the application is running.

---

## ☁️ AWS Deployment

### Architecture

The system is designed for **AWS ECS (Fargate)** with the following components:

- **ECS Fargate** - Containerized application (256 CPU, 512 MB memory)
- **Application Load Balancer** - HTTPS termination and routing
- **RDS PostgreSQL** - Managed database (db.t3.micro)
- **S3** - Recipe exports and static assets
- **CloudWatch** - Logs and metrics
- **Secrets Manager** - Database credentials and JWT secrets

### Cost Estimate (if deployed)

| Service          | Configuration    | Monthly Cost (Estimate) |
|------------------|------------------|-------------------------|
| ECS Fargate      | 256 CPU, 512 MB  | ~$15                    |
| RDS (PostgreSQL) | db.t3.micro      | ~$15                    |
| ALB              | Minimal traffic  | ~$20                    |
| S3               | <1 GB storage    | ~$1                     |
| CloudWatch       | Logs + metrics   | ~$5                     |
| **Total**        |                  | **~$56/month**          |

*Note: Actual costs depend on traffic, data transfer, and usage patterns.*

### Deployment Steps

```bash
# 1. Configure AWS credentials
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1

# 2. Initialize Terraform
cd infrastructure/terraform
terraform init

# 3. Review planned changes
terraform plan

# 4. Deploy infrastructure
terraform apply

# 5. Build and push Docker image to ECR
./scripts/deploy.sh
```

### Why LocalStack?

LocalStack emulates AWS services locally, allowing us to:
- ✅ Develop and test AWS integrations without real cloud resources
- ✅ Validate Terraform definitions before deployment
- ✅ Prove AWS SDK competency at zero cost
- ✅ Enable anyone to run the full system locally

**The infrastructure code is identical** whether targeting LocalStack or real AWS—only the endpoint URLs change.

---

## 🛠️ Architecture Deep Dive

### LLM Abstraction Layer

The system uses a **pluggable LLM client interface** for flexibility:

```java
public interface LlmClient {
    LlmResponse generate(PromptRequest request);
    boolean isAvailable();
    String getModelName();
    int estimateTokens(String text);
}
```

**Implementations:**
- `OllamaClient` - Production implementation for local Mistral 7B
- `MockLlmClient` - Test doubles with deterministic responses

**Orchestration:**
```
Request → Cache Check → Circuit Breaker → Ollama → Response Cache → Return
            ↓ (hit)                         ↓ (success)
            Return                          Metrics
```

### Caching Strategy

1. **Input Hashing**: SHA-256 of normalized prompt (ingredients sorted, lowercased)
2. **TTL**: 7 days for recipe responses
3. **Storage**: PostgreSQL table `llm_cache`
4. **Hit Rate**: ~40% in testing (reduces LLM calls significantly)

### Security Model

1. **Password Hashing**: BCrypt with cost factor 12
2. **JWT Tokens**:
   - Access token: 15-minute expiration
   - Refresh token: 7-day expiration
3. **Token Storage**: Client-side (localStorage); server validates signature
4. **Protected Endpoints**: Spring Security filters reject invalid/expired tokens

### Resilience Patterns

- **Circuit Breaker**: Opens after 50% failure rate; prevents cascading failures
- **Retry**: 3 attempts with exponential backoff for transient errors
- **Rate Limiting**: 10 requests/min per user (configurable)
- **Timeouts**: 30s for LLM calls; prevents thread starvation

### Database Schema (Simplified)

```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR,
  dietary_preferences TEXT[],
  created_at TIMESTAMP
)

recipes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  content JSONB,  -- Full recipe data
  ingredients TEXT[],
  tags TEXT[],
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)

recipe_generations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  prompt TEXT,
  response TEXT,
  model VARCHAR,
  tokens_used INT,
  cost_cents INT,
  latency_ms INT,
  status VARCHAR,  -- SUCCESS, CACHE_HIT, FAILED
  created_at TIMESTAMP
)

llm_cache (
  id UUID PRIMARY KEY,
  input_hash VARCHAR(64) UNIQUE,
  response TEXT,
  model VARCHAR,
  tokens_used INT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
)
```

---

## 🔧 Development

### Running Tests

```bash
# Unit tests only
./mvnw test

# Integration tests with Testcontainers
./mvnw verify

# With coverage report
./mvnw verify jacoco:report
# Report: target/site/jacoco/index.html
```

### Code Style

The project uses standard Spring Boot conventions:
- **Indentation**: 4 spaces
- **Line length**: 120 characters
- **Naming**: camelCase for methods, PascalCase for classes

### Database Migrations

Flyway manages schema changes via SQL scripts in `src/main/resources/db/migration/`.

```bash
# Apply pending migrations
./mvnw flyway:migrate

# View migration history
./mvnw flyway:info

# Rollback (manual - create a new migration)
./mvnw flyway:clean  # WARNING: Drops all tables
```

### Adding a New Endpoint

1. **Create DTO** in `dto/`
2. **Add Service Method** in `service/`
3. **Create Controller Endpoint** in `controller/`
4. **Write Tests** in `src/test/`
5. **Update OpenAPI Docs** (auto-generated from annotations)

### Environment Variables

| Variable                | Description                        | Default                     |
|-------------------------|------------------------------------|-----------------------------|
| `DATABASE_URL`          | PostgreSQL connection string       | `localhost:5432/masterchef` |
| `JWT_SECRET`            | Secret key for signing JWTs        | (generated)                 |
| `OLLAMA_BASE_URL`       | Ollama API endpoint                | `http://localhost:11434`    |
| `AWS_S3_ENDPOINT`       | S3 endpoint (LocalStack/real AWS)  | `http://localhost:4566`     |
| `SPRING_PROFILES_ACTIVE`| Active Spring profile              | `local`                     |

---

## 📚 Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design, components, and technical decisions
- **[SCOPE.md](docs/SCOPE.md)** - Feature scope and requirements
- **[API.md](docs/API.md)** - Detailed API reference (coming soon)
- **[Swagger UI](http://localhost:8080/swagger-ui.html)** - Interactive API docs (when running)

---

## 🤝 Contributing

This is a personal learning project, but feedback and suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Spring Boot** team for the excellent framework
- **Ollama** for making local LLM inference accessible
- **LocalStack** for AWS emulation
- **Mistral AI** for the Mistral 7B model

---

**Built with ❤️ using Java 21, Spring Boot, and PostgreSQL**

*Designed for AWS. Runs everywhere.*
