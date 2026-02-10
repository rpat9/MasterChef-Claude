package com.masterchef.masterchef_backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.masterchef.masterchef_backend.dto.LlmRequest;
import com.masterchef.masterchef_backend.dto.LlmResponse;
import com.masterchef.masterchef_backend.llm.LlmClient;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;

/**
 * Orchestrates LLM requests with caching and metrics tracking.
 * 
 * Request flow:
 * Check cache for matching hash
 * If cache hit: return cached response (< 200ms)
 * If cache miss: call LlmClient
 * Cache successful response
 * Record metrics (latency, cache hit rate, tokens used)
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
     * Generate LLM response with cache-aware routing
     * 
     * @param request LLM request (contains prompt, model, temperature)
     * @return LLM response (either cached or freshly generated)
     */
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
        
        // Step 2: Cache miss - call LLM
        cacheMissCounter.increment();
        
        log.info("Cache miss: calling LLM client, model={}", request.getModel());
        
        LlmResponse response;
        try {
            response = llmCallTimer.recordCallable(() -> llmClient.generate(request));
        } catch (Exception e) {
            log.error("LLM call failed: {}", e.getMessage(), e);
            throw new RuntimeException("LLM generation failed", e);
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
