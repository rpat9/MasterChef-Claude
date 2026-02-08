package com.masterchef.masterchef_backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.masterchef.masterchef_backend.models.Recipe;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, UUID> {
    
    /**
     * Find all saved recipes for a specific user
     */
    List<Recipe> findByUserIdAndIsSavedTrue(UUID userId);

    /**
     * Find all recipes for a user with pagination
     */
    Page<Recipe> findByUserId(UUID userId, Pageable pageable);

    /**
     * Find recipes by user and saved status with pagination
     */
    Page<Recipe> findByUserIdAndIsSaved(UUID userId, boolean isSaved, Pageable pageable);

    /**
     * Search recipes by tags (using PostgreSQL array contains operator)
     */
    @Query("SELECT r FROM Recipe r WHERE r.user.id = :userId AND :tag MEMBER OF r.tags")
    List<Recipe> findByUserIdAndTagsContaining(@Param("userId") UUID userId, @Param("tag") String tag);

    /**
     * Count saved recipes for a user
     */
    long countByUserIdAndIsSavedTrue(UUID userId);
}