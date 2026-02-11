package com.masterchef.masterchef_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.masterchef.masterchef_backend.dto.CacheStatsResponse;
import com.masterchef.masterchef_backend.service.LlmCacheService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Admin endpoints for cache management and system operations
 * Access restricted to admin users only
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final LlmCacheService llmCacheService;

    /**
     * Get cache statistics
     * GET /api/v1/admin/cache/stats
     */
    @GetMapping("/cache/stats")
    public ResponseEntity<CacheStatsResponse> getCacheStats() {
        log.info("GET /api/v1/admin/cache/stats");

        long totalEntries = llmCacheService.getTotalCacheEntries();
        long expiredEntries = llmCacheService.getExpiredCacheEntries();
        long activeEntries = totalEntries - expiredEntries;
        
        // Calculate hit rate from metrics
        long totalHits = llmCacheService.getCacheHitCount();
        long totalMisses = llmCacheService.getCacheMissCount();
        long totalRequests = totalHits + totalMisses;
        double hitRate = totalRequests > 0 ? (double) totalHits / totalRequests : 0.0;

        CacheStatsResponse response = CacheStatsResponse.builder()
                .totalEntries(totalEntries)
                .expiredEntries(expiredEntries)
                .activeEntries(activeEntries)
                .hitRate(hitRate)
                .totalHits(totalHits)
                .totalMisses(totalMisses)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Clear expired cache entries
     * DELETE /api/v1/admin/cache
     */
    @DeleteMapping("/cache")
    public ResponseEntity<Void> clearExpiredCache() {
        log.info("DELETE /api/v1/admin/cache - clearing expired entries");

        int deletedCount = llmCacheService.clearExpiredCache();
        
        log.info("Cleared {} expired cache entries", deletedCount);
        return ResponseEntity.noContent().build();
    }
}