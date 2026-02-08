package com.masterchef.masterchef_backend.dto;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeRequest {

    @NotNull(message = "Ingredients are required")
    @Size(min = 3, max = 15, message = "Please provide between 3 and 15 ingredients")
    private List<String> ingredients;

    @Builder.Default
    private List<String> dietaryPreferences = new ArrayList<>();

    @Min(value = 1, message = "Servings must be at least 1")
    @Max(value = 12, message = "Servings cannot exceed 12")
    @Builder.Default
    private Integer servings = 4;

    /**
     * Cooking skill level: easy, medium, hard
     */
    private String difficulty;

    /**
     * Time constraint in minutes (options)
     */
    @Min(value = 0, message = "Time cannot be negative")
    private Integer maxTimeMinutes;
    
}