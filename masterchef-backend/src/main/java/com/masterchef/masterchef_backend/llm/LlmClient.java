package com.masterchef.masterchef_backend.llm;

import com.masterchef.masterchef_backend.dto.LlmRequest;
import com.masterchef.masterchef_backend.dto.LlmResponse;

/**
 * Interfaces for all LLM Client implementation
 * Allows swapping between Ollama, OpenAI, Anthropic without changing the business logic
 */
public interface LlmClient {

    /**
     * Generate text from the given prompt
     * 
     * @param request The LLM request with prompt and parameters
     * @return Resposne containing generated text and metadata
     * @throws LlmException if generation fails
     */
    LlmResponse generate(LlmRequest request);

    /**
     * Check if this LLM client is current available
     * Used for health checks and circuit breaker logic
     * 
     * @return true if the LLM service is reachable and healthy
     */
    boolean isAvailable();

    /**
     * Get the name of the model this client uses
     * Use for logging and metrics logging
     * 
     * @return Model name (e.g., "mistral", "gpt-4")
     */
    String getModelName();

    /**
     * Estimate token count for a given text
     * Used for cost estimation before making API calls
     * 
     * @param text The text to estimate
     * @return Approximate token count
     */
    int estimateTokens(String text);
    
}