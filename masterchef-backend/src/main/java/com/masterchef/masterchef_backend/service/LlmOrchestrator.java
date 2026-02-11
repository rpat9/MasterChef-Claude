package com.masterchef.masterchef_backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.masterchef.masterchef_backend.dto.LlmRequest;
import com.masterchef.masterchef_backend.dto.LlmResponse;
import com.masterchef.masterchef_backend.llm.LlmClient;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;

/**
 * Orchestrates LLM requests with caching, resilience patterns, and metrics
 * 
 * Resilience patterns applied:
 * - Circuit Breaker: Fails fast when Ollama is unavailable (50% failure threshold)
 * - Retry: 3 attempts with exponential backoff for transient failures
 * - Rate Limiter: 10 requests per minute per user
 * 
 * Request flow:
 * 1. Rate limiter checks quota
 * 2. Circuit breaker checks if LLM is healthy
 * 3. Check cache for matching hash
 * 4. If cache miss: call LLM with retry logic
 * 5. Cache successful response
 * 6. Record metrics
 */
@Slf4j
@Service
public class LlmOrchestrator {
    
    private final LlmClient llmClient;
    private final LlmCacheService cacheService;
    private final Counter cacheHitCounter;
    private final Counter cacheMissCounter;
    private final Timer llmCallTimer;
    
    public LlmOrchestrator(
            LlmClient llmClient, 
            LlmCacheService cacheService,
            MeterRegistry meterRegistry) {
        this.llmClient = llmClient;
        this.cacheService = cacheService;
        
        // Register custom metrics
        this.cacheHitCounter = Counter.builder("llm.cache.hits")
                .description("Number of LLM cache hits")
                .register(meterRegistry);
        
        this.cacheMissCounter = Counter.builder("llm.cache.misses")
                .description("Number of LLM cache misses")
                .register(meterRegistry);
        
        this.llmCallTimer = Timer.builder("llm.call.duration")
                .description("LLM call duration (cache miss only)")
                .register(meterRegistry);
    }
    
    /**
     * Generate LLM response with cache-aware routing and resilience patterns
     * 
     * @param request LLM request (contains prompt, model, temperature)
     * @return LLM response (either cached or freshly generated)
     */
    @RateLimiter(name = "recipe-generation", fallbackMethod = "rateLimitFallback")
    @CircuitBreaker(name = "llm-circuit", fallbackMethod = "circuitBreakerFallback")
    public LlmResponse generateWithCache(LlmRequest request) {
        long startTime = System.currentTimeMillis();
        
        log.debug("LLM request: model={}, promptLength={}, temperature={}", 
                request.getModel(), 
                request.getPrompt().length(),
                request.getTemperature());
        
        // Step 1: Check cache
        Optional<LlmResponse> cachedResponse = cacheService.getCachedResponse(request);
        
        if (cachedResponse.isPresent()) {
            cacheHitCounter.increment();
            long latency = System.currentTimeMillis() - startTime;
            
            log.info("Cache hit: latency={}ms, model={}", latency, request.getModel());
            
            return cachedResponse.get();
        }
        
        // Step 2: Cache miss - call LLM with retry
        cacheMissCounter.increment();
        
        log.info("Cache miss: calling LLM client, model={}", request.getModel());
        
        LlmResponse response;
        try {
            response = callLlmWithRetry(request);
        } catch (Exception e) {
            log.error("LLM call failed after retries: {}", e.getMessage(), e);
            response = LlmResponse.builder()
                    .model(request.getModel())
                    .status("ERROR")
                    .errorMessage("Failed to generate response after retries: " + e.getMessage())
                    .cached(false)
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .build();
        }
        
        // Step 3: Cache successful response
        if ("SUCCESS".equals(response.getStatus())) {
            cacheService.cacheResponse(request, response);
        } else {
            log.warn("Not caching failed LLM response: status={}, error={}", 
                    response.getStatus(), response.getErrorMessage());
        }
        
        long totalLatency = System.currentTimeMillis() - startTime;
        log.info("LLM generation complete: latency={}ms, model={}, cached={}", 
                totalLatency, response.getModel(), false);
        
        return response;
    }
    
    /**
     * Call LLM with retry logic (separate method for @Retry annotation)
     */
    @Retry(name = "llm-retry")
    private LlmResponse callLlmWithRetry(LlmRequest request) throws Exception {
        return llmCallTimer.recordCallable(() -> llmClient.generate(request));
    }
    
    /**
     * Fallback when rate limit is exceeded
     */
    private LlmResponse rateLimitFallback(LlmRequest request, Exception e) {
        log.warn("Rate limit exceeded for request: {}", request.getPrompt().substring(0, 50));
        
        return LlmResponse.builder()
                .model("N/A")
                .status("RATE_LIMITED")
                .errorMessage("Too many requests. Please try again later.")
                .cached(false)
                .latencyMs(0L)
                .build();
    }
    
    /**
     * Fallback when circuit breaker is open (LLM unavailable)
     */
    private LlmResponse circuitBreakerFallback(LlmRequest request, Exception e) {
        log.error("Circuit breaker open - LLM unavailable: {}", e.getMessage());
        
        return LlmResponse.builder()
                .model("N/A")
                .status("SERVICE_UNAVAILABLE")
                .errorMessage("Recipe generation service is temporarily unavailable. Please try again in a few minutes.")
                .cached(false)
                .latencyMs(0L)
                .build();
    }
    
    /**
     * Check if LLM client is available (health check)
     */
    public boolean isAvailable() {
        return llmClient.isAvailable();
    }
    
    /**
     * Get current LLM model name
     */
    public String getModelName() {
        return llmClient.getModelName();
    }
    
    /**
     * Get cache statistics
     */
    public LlmCacheService.CacheStats getCacheStats() {
        return cacheService.getStats();
    }
    
    /**
     * Clean up expired cache entries
     * 
     * @return number of deleted entries
     */
    public int cleanupCache() {
        return cacheService.cleanupExpiredEntries();
    }
}