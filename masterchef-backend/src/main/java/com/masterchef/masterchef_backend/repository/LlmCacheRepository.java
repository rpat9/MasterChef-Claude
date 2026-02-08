package com.masterchef.masterchef_backend.repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.masterchef.masterchef_backend.models.LlmCache;

@Repository
public interface LlmCacheRepository extends JpaRepository<LlmCache, UUID> {
    
    /**
     * Find cached response by input hash (primary cache lookup)
     */
    Optional<LlmCache> findByInputHash(String inputHash);

    /**
     * Check if a cache entry exists and is not expired
     */
    @Query("SELECT COUNT(c) > 0 FROM LlmCache c WHERE c.inputHash = :hash AND c.expiresAt > :now")
    boolean existsByInputHashAndNotExpired(@Param("hash") String hash, @Param("now") LocalDateTime now);

    /**
     * Find valid (non-expired) cache entry
     */
    @Query("SELECT COUNT(c) > 0 FROM LlmCache c WHERE c.inputHash = :hash AND c.expiresAt > :now")
    Optional<LlmCache> findValidCacheByHash(@Param("hash") String hash, @Param("now") LocalDateTime now);

    /**
     * Delete expired cache entries (cleanup job)
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM LlmCache c WHERE c.expiresAt < :now")
    int deleteExpiredEntries(@Param("now") LocalDateTime now);

    /**
     * Count valid (non-expired) cache entries
     */
    @Query("SELECT COUNT(c) FROM LlmCache c WHERE c.expiresAt > :now")
    long countValidEntries(@Param("now") LocalDateTime now);

}