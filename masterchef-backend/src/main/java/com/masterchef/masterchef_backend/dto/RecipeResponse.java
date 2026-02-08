package com.masterchef.masterchef_backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeResponse {

    private UUID id;
    private String title;
    private String description;
    private Integer prepTime;
    private Integer cookTime;
    private Integer totalTime;
    private Integer servings;
    private String difficulty;
    private String cuisine;
    private List<String> ingredientsUsed;
    
    /**
     * Parsed structured data (will be JSON strings from entity)
     */
    private String instructions;
    private String ingredients;
    private String nutritionInfo;

    private List<String> tags;
    private Boolean isSaved;
    private LocalDateTime createdAt;

    /**
     * Generation metadata
     */
    private GenerationMetaData metadata;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerationMetaData {
        private String model;
        private Integer tokensUsed;
        private Long latencyMs;
        private Boolean cached;
        private LocalDateTime generatedAt;
    }
    
}