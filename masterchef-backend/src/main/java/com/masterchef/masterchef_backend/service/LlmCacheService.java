package com.masterchef.masterchef_backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.masterchef.masterchef_backend.dto.LlmRequest;
import com.masterchef.masterchef_backend.dto.LlmResponse;
import com.masterchef.masterchef_backend.models.LlmCache;
import com.masterchef.masterchef_backend.repository.LlmCacheRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Manages LLM response caching with SHA-256 content-addressable storage.
 * 
 * Caching strategy:
 * Input hashing: SHA-256 of normalized prompt
 * TTL: Configurable expiration (default 7 days)
 * Storage: PostgreSQL llm_cache table
 * Normalization: Lowercase, trim, sorted ingredients
 */

@Slf4j
@Service
@RequiredArgsConstructor
public class LlmCacheService {
    
    private final LlmCacheRepository cacheRepository;
    
    @Value("${llm.cache.ttl-days:7}")
    private int cacheTtlDays;
    
    /**
     * Check if a valid (non-expired) cache entry exists for this request
     */
    public boolean isCached(LlmRequest request) {
        String hash = computeHash(request);
        return cacheRepository.existsByInputHashAndNotExpired(hash, LocalDateTime.now());
    }
    
    /**
     * Get cached response if available and not expired
     * 
     * @return Optional containing cached LlmResponse, or empty if cache miss
     */
    public Optional<LlmResponse> getCachedResponse(LlmRequest request) {
        String hash = computeHash(request);
        
        log.debug("Cache lookup: hash={}", hash);
        
        Optional<LlmCache> cached = cacheRepository.findByInputHash(hash);
        
        if (cached.isEmpty()) {
            log.debug("Cache miss: hash={}", hash);
            return Optional.empty();
        }
        
        LlmCache entry = cached.get();
        
        // Check if expired
        if (entry.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.debug("Cache expired: hash={}, expiredAt={}", hash, entry.getExpiresAt());
            return Optional.empty();
        }
        
        log.info("Cache hit: hash={}, model={}, age={}min", 
                hash, 
                entry.getModel(), 
                java.time.Duration.between(entry.getCreatedAt(), LocalDateTime.now()).toMinutes());
        
        // Build response from cache
        return Optional.of(LlmResponse.builder()
                .content(entry.getResponse())
                .model(entry.getModel())
                .tokensUsed(entry.getTokensUsed())
                .cached(true)
                .latencyMs(0L) // Cache hits are near-instant
                .generatedAt(entry.getCreatedAt())
                .status("CACHE_HIT")
                .build());
    }
    
    /**
     * Save a successful LLM response to cache
     */
    @Transactional
    public void cacheResponse(LlmRequest request, LlmResponse response) {
        String hash = computeHash(request);
        
        // Check if already cached (race condition handling)
        if (cacheRepository.findByInputHash(hash).isPresent()) {
            log.debug("Cache entry already exists: hash={}", hash);
            return;
        }
        
        LlmCache cacheEntry = LlmCache.builder()
                .inputHash(hash)
                .response(response.getContent())
                .model(response.getModel())
                .tokensUsed(response.getTokensUsed())
                .expiresAt(LocalDateTime.now().plusDays(cacheTtlDays))
                .build();
        
        cacheRepository.save(cacheEntry);
        
        log.info("Cached LLM response: hash={}, model={}, ttl={}days", 
                hash, response.getModel(), cacheTtlDays);
    }
    
    /**
     * Clean up expired cache entries (scheduled job or manual invocation)
     * 
     * @return number of deleted entries
     */
    @Transactional
    public int cleanupExpiredEntries() {
        int deleted = cacheRepository.deleteExpiredEntries(LocalDateTime.now());
        if (deleted > 0) {
            log.info("Cleaned up {} expired cache entries", deleted);
        }
        return deleted;
    }
    
    /**
     * Get cache statistics
     */
    public CacheStats getStats() {
        long validEntries = cacheRepository.countValidEntries(LocalDateTime.now());
        long totalEntries = cacheRepository.count();
        
        return new CacheStats(validEntries, totalEntries);
    }
    
    /**
     * Compute SHA-256 hash of the normalized prompt
     * Normalization ensures cache hits for equivalent inputs:
     * Lowercase prompt
     * Trim whitespace
     * Include model name (different models = different hash)
     * Include temperature (affects output)
     */
    private String computeHash(LlmRequest request) {
        try {
            // Normalize input for consistent hashing
            String normalizedInput = normalizeInput(request);
            
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(normalizedInput.getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return hexString.toString();
            
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is always available in standard JDK
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
    
    /**
     * Normalize request for consistent hashing
     */
    private String normalizeInput(LlmRequest request) {
        // Combine prompt + model + temperature for hash
        // This ensures different models or temperatures don't share cache
        return String.format("%s|%s|%.2f", 
                request.getPrompt().toLowerCase().trim(),
                request.getModel() != null ? request.getModel() : "default",
                request.getTemperature());
    }
    
    /**
     * Cache statistics record
     */
    public record CacheStats(long validEntries, long totalEntries) {
        public double hitRate() {
            return totalEntries > 0 ? (double) validEntries / totalEntries : 0.0;
        }
    }
}
