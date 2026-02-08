package com.masterchef.masterchef_backend.repository;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.masterchef.masterchef_backend.models.RecipeGeneration;

@Repository
public interface RecipeGenerationRepository extends JpaRepository<RecipeGeneration, UUID>{
    
    /**
     * Find all generations for a user with pagination
     */
    Page<RecipeGeneration> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    /**
     * Find recent generation for a user (last N records)
     */
    Page<RecipeGeneration> findByUserIdAndCreatedAtAfter(UUID userId, LocalDateTime after, Pageable pageable);

    /**
     * Count total generations by user
     */
    long countByUserId(UUID userId);

    /**
     * Calculate cache hit rate for metrics
     */
    @Query("SELECT COUNT(rg) FROM RecipeGeneration rg WHERE rg.user.id = :userId AND rg.cached = true")
    long countCacheHitsByUserId(@Param("userId") UUID userId);

    /**
     * Calculate average latency for a user (for metrics)
     */
    @Query("SELECT AVG(rg.latencyMs) FROM RecipeGeneration rg WHERE rg.user.id = :userId AND rg.status = 'SUCCESS'")
    Double calculateAverageLatencyByUserId(@Param("userId") UUID userId);

    /**
     * Sum total tokens used by a user
     */
    @Query("SELECT COALESCE(SUM(rg.tokensUsed), 0) FROM RecipeGeneration rg WHERE rg.user.id = :userId")
    Long sumTokensUsedByUserId(@Param("userId") UUID userId);

}