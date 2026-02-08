# LLM Package

LLM client abstraction layer using Strategy pattern. Allows swapping LLM providers without changing business logic.

## Architecture

```
LlmClient (interface)
    ↓ implements
OllamaClient (Ollama HTTP API)
```

Future implementations could include:
- OpenAI client (GPT-4 for comparison)
- Anthropic client (Claude)
- LocalAI client (alternative to Ollama)

## LlmClient Interface

```java
LlmResponse generate(LlmRequest request) throws LlmException;
boolean isAvailable();
String getModelName();
int estimateTokens(String text);
```

### Method Responsibilities

- **generate()** - Send prompt, get response with metadata
- **isAvailable()** - Health check before calling
- **getModelName()** - For logging and debugging
- **estimateTokens()** - Pre-flight cost estimation

## OllamaClient Implementation

### Configuration
- Endpoint: `llm.ollama.base-url` (default: http://localhost:11434)
- Model: `llm.ollama.model` (default: mistral)
- Timeout: `llm.ollama.timeout-seconds` (default: 30s)

### HTTP API Integration
```java
POST /api/generate
{
  "model": "mistral",
  "prompt": "Generate a recipe for...",
  "temperature": 0.7,
  "stream": false
}
```

### Response Mapping
- Extracts generated text from `response` field
- Calculates latency via System.currentTimeMillis()
- Returns status (SUCCESS/TIMEOUT/FAILED)
- Token counting: ~4 characters per token heuristic

### Error Handling
- Throws `LlmException` on HTTP errors
- Timeout configured at RestTemplate level
- Health check via `/api/tags` endpoint

## Key Design Decisions

1. **Interface First** - Easy to mock for testing
2. **No Streaming** - Simplified implementation, request/response model
3. **Constructor Injection** - `@Value` configs + RestTemplate
4. **Cost Tracking** - Every response includes latency and token count
5. **Zero External Dependencies** - Only needs local Ollama running

## Usage Example

```java
@Autowired
private LlmClient llmClient;

public void generateRecipe() {
    if (!llmClient.isAvailable()) {
        throw new ServiceUnavailableException("LLM is down");
    }
    
    var request = new LlmRequest(
        "Generate a recipe for pasta carbonara",
        "mistral",
        0.7,
        500
    );
    
    var response = llmClient.generate(request);
    // response.content() has the recipe text
    // response.tokensUsed() for cost tracking
}
```
