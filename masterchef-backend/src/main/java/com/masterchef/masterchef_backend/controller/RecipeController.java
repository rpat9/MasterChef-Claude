package com.masterchef.masterchef_backend.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.masterchef.masterchef_backend.dto.GenerationHistoryResponse;
import com.masterchef.masterchef_backend.dto.RecipeExportResponse;
import com.masterchef.masterchef_backend.dto.RecipeRequest;
import com.masterchef.masterchef_backend.dto.RecipeResponse;
import com.masterchef.masterchef_backend.dto.UserMetricsResponse;
import com.masterchef.masterchef_backend.exception.ResourceNotFoundException;
import com.masterchef.masterchef_backend.models.Recipe;
import com.masterchef.masterchef_backend.models.RecipeGeneration;
import com.masterchef.masterchef_backend.models.User;
import com.masterchef.masterchef_backend.repository.RecipeGenerationRepository;
import com.masterchef.masterchef_backend.repository.RecipeRepository;
import com.masterchef.masterchef_backend.repository.UserRepository;
import com.masterchef.masterchef_backend.service.RecipeService;
import com.masterchef.masterchef_backend.service.StorageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;
    private final StorageService storageService;
    private final RecipeRepository recipeRepository;
    private final RecipeGenerationRepository recipeGenerationRepository;
    private final UserRepository userRepository;

    /**
     * Generate a recipe from ingredients
     * POST /api/v1/recipes/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<RecipeResponse> generateRecipe(
            @Valid @RequestBody RecipeRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        log.info("POST /api/v1/recipes/generate - user: {}, ingredients: {}", 
                email, request.getIngredients());

        // Get user from database to extract UUID
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RecipeResponse response = recipeService.generateRecipe(request, user.getId());
        
        log.info("Recipe generated successfully: id={}, title={}", 
                response.getId(), response.getTitle());

        return ResponseEntity.ok(response);
    }

    /**
     * GET all recipes from the authenticated user
     * GET /api/v1/recipes?page=0&size=10&sort=createdAt,desc
     */
    @GetMapping
    public ResponseEntity<Page<RecipeResponse>> getUserRecipes(
        @AuthenticationPrincipal UserDetails userDetails,
        Pageable pageable
    ) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new ResourceNotFoundException("User", email));
        
        log.info("GET /api/vi/recipes - user: {}, page: {}, size: {}",
                        email, pageable.getPageNumber(), pageable.getPageSize()
        );

        Page<Recipe> recipes = recipeRepository.findByUserId(user.getId(), pageable);
        Page<RecipeResponse> response = recipes.map(this::mapToRecipeResponse);

        return ResponseEntity.ok(response);
    }

    /**
     * Get a specific recipe by ID
     * GET /api/v1/recipes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<RecipeResponse> getRecipeById(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new ResourceNotFoundException("User", email));
        
        log.info("GET /api/v1/recipes/{} - user: {}", id, email);

        Recipe recipe = recipeRepository.findById(id)
                          .orElseThrow(() -> new ResourceNotFoundException("Recipe", id.toString()));

        if(!recipe.getUser().getId().equals(user.getId())) {
                throw new ResourceNotFoundException("Wrong Recipe", id.toString());
        }

        return ResponseEntity.ok(mapToRecipeResponse(recipe));

    }

    /**
     * Delete a recipe and its S3 exports
     * DELETE /api/v1/recipes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));

        log.info("DELETE /api/v1/recipes/{} - user: {}", id, email);

        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", id.toString()));

        // Verify ownership
        if (!recipe.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Recipe", id.toString());
        }

        // Delete S3 exports if they exist
        try {
            String s3Key = String.format("exports/%s/%s.json", user.getId(), id);
            storageService.deleteObject(s3Key);
        } catch (Exception e) {
            log.warn("Failed to delete S3 export for recipe {}: {}", id, e.getMessage());
        }

        recipeRepository.delete(recipe);
        log.info("Recipe deleted: id={}", id);

        return ResponseEntity.noContent().build();

    }


    /**
     * Export recipe to S3 and get presigned download URL
     * POST /api/v1/recipes/{id}/export
     */
    @PostMapping("/{id}/export")
    public ResponseEntity<RecipeExportResponse> exportRecipe(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));

        log.info("POST /api/v1/recipes/{}/export - user: {}", id, email);

        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", id.toString()));

        // Verify ownership
        if (!recipe.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Recipe", id.toString());
        }

        // Convert recipe to JSON
        String recipeJson = recipeService.exportRecipeAsJson(recipe);
        byte[] content = recipeJson.getBytes();

        // Upload to S3
        String s3Key = storageService.uploadRecipeExport(
                user.getId(), 
                recipe.getId(), 
                content, 
                "application/json"
        );

        // Generate presigned URL
        String presignedUrl = storageService.generatePresignedUrl(s3Key);

        RecipeExportResponse response = RecipeExportResponse.builder()
                .s3Key(s3Key)
                .presignedUrl(presignedUrl)
                .expiresIn("15 minutes")
                .fileSizeBytes((long) content.length)
                .build();

        log.info("Recipe exported: id={}, s3Key={}", id, s3Key);

        return ResponseEntity.ok(response);

    }

    /**
     * Get generation history for the authenticated user
     * GET /api/v1/recipes/history?page=0&size=20
     */
    @GetMapping("/history")
    public ResponseEntity<Page<GenerationHistoryResponse>> getGenerationHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable
    ) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));

        log.info("GET /api/v1/recipes/history - user: {}", email);

        Page<RecipeGeneration> generations = recipeGenerationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

        Page<GenerationHistoryResponse> response = generations.map(gen -> 
                GenerationHistoryResponse.builder()
                        .id(gen.getId())
                        .ingredients(gen.getIngredients())
                        .dietaryPreferences(gen.getDietaryPreferences())
                        .modelUsed(gen.getModelUsed())
                        .tokensUsed(gen.getTokensUsed())
                        .cached(gen.getCached())
                        .latencyMs(gen.getLatencyMs())
                        .status(gen.getStatus())
                        .errorMessage(gen.getErrorMessage())
                        .createdAt(gen.getCreatedAt())
                        .build()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Get user metrics (total generations, cache stats, etc.)
     * GET /api/v1/recipes/metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<UserMetricsResponse> getUserMetrics(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));

        log.info("GET /api/v1/recipes/metrics - user: {}", email);

        long totalGenerations = recipeGenerationRepository.countByUserId(user.getId());
        long cacheHits = recipeGenerationRepository.countCacheHitsByUserId(user.getId());
        long totalRecipesSaved = recipeRepository.countByUserIdAndIsSavedTrue(user.getId());
        Long totalTokensUsed = recipeGenerationRepository.sumTokensUsedByUserId(user.getId());
        Double averageLatencyMs = recipeGenerationRepository.calculateAverageLatencyByUserId(user.getId());

        double cacheHitRate = totalGenerations > 0 ? 
                (double) cacheHits / totalGenerations : 0.0;

        UserMetricsResponse response = UserMetricsResponse.builder()
                .totalGenerations(totalGenerations)
                .cacheHits(cacheHits)
                .totalRecipesSaved(totalRecipesSaved)
                .totalTokensUsed(totalTokensUsed != null ? totalTokensUsed : 0L)
                .averageLatencyMs(averageLatencyMs != null ? averageLatencyMs : 0.0)
                .cacheHitRate(cacheHitRate)
                .build();

        return ResponseEntity.ok(response);
    }

    private RecipeResponse mapToRecipeResponse(Recipe recipe) {
        return RecipeResponse.builder()
                .id(recipe.getId())
                .title(recipe.getTitle())
                .description(recipe.getDescription())
                .prepTime(recipe.getPrepTime())
                .cookTime(recipe.getCookTime())
                .totalTime(recipe.getTotalTime())
                .servings(recipe.getServings())
                .difficulty(recipe.getDifficulty())
                .cuisine(recipe.getCuisine())
                .ingredientsUsed(recipe.getIngredientsUsed())
                .instructions(recipe.getInstructions())
                .ingredients(recipe.getIngredients())
                .nutritionInfo(recipe.getNutritionInfo())
                .tags(recipe.getTags())
                .isSaved(recipe.getIsSaved())
                .createdAt(recipe.getCreatedAt())
                .build();
    }


}