package com.masterchef.masterchef_backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.masterchef.masterchef_backend.dto.LlmRequest;
import com.masterchef.masterchef_backend.dto.LlmResponse;
import com.masterchef.masterchef_backend.dto.RecipeRequest;
import com.masterchef.masterchef_backend.dto.RecipeResponse;
import com.masterchef.masterchef_backend.models.Recipe;
import com.masterchef.masterchef_backend.models.RecipeGeneration;
import com.masterchef.masterchef_backend.models.User;
import com.masterchef.masterchef_backend.repository.RecipeGenerationRepository;
import com.masterchef.masterchef_backend.repository.RecipeRepository;
import com.masterchef.masterchef_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecipeService {

    private final LlmOrchestrator llmOrchestrator;
    private final RecipeRepository recipeRepository;
    private final RecipeGenerationRepository recipeGenerationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate a recipe based on ingredients and preferences
     */
    @Transactional
    public RecipeResponse generateRecipe(RecipeRequest request, UUID userId) {
        log.info("Generating recipe for user: {}, ingredients: {}", userId, request.getIngredients());

        // Load user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Normalize and validate ingredients
        List<String> normalizedIngredients = normalizeIngredients(request.getIngredients());
        log.debug("Normalized ingredients: {}", normalizedIngredients);

        // Build structured prompt
        String prompt = buildPrompt(normalizedIngredients, request);
        log.debug("Generated prompt length: {} characters", prompt.length());

        // Call LLM orchestrator (handles caching automatically)
        long startTime = System.currentTimeMillis();
        LlmRequest llmRequest = LlmRequest.builder()
                .prompt(prompt)
                .model("mistral")
                .temperature(0.7)
                .userId(userId.toString())
                .ingredients(normalizedIngredients)
                .build();

        LlmResponse llmResponse = llmOrchestrator.generateWithCache(llmRequest);
        long latencyMs = System.currentTimeMillis() - startTime;

        // Save generation audit record
        RecipeGeneration generation = RecipeGeneration.builder()
                .user(user)
                .ingredients(normalizedIngredients)
                .dietaryPreferences(request.getDietaryPreferences())
                .prompt(prompt)
                .rawResponse(llmResponse.getContent())
                .modelUsed(llmResponse.getModel())
                .tokensUsed(llmResponse.getTokensUsed())
                .costCents(llmResponse.getCostCents())
                .cached(llmResponse.isCached())
                .latencyMs(latencyMs)
                .status(llmResponse.getStatus())
                .errorMessage(llmResponse.getErrorMessage())
                .build();

        generation = recipeGenerationRepository.save(generation);
        log.info("Recipe generation saved: id={}, status={}, latency={}ms, cached={}", 
                generation.getId(), generation.getStatus(), latencyMs, llmResponse.isCached());

        // Check if LLM generation was successful
        if (!"SUCCESS".equals(llmResponse.getStatus()) || llmResponse.getContent() == null) {
            throw new RuntimeException("LLM generation failed: " + llmResponse.getErrorMessage());
        }

        // Parse LLM response into structured recipe
        Recipe recipe = parseRecipeFromLlm(llmResponse.getContent(), user, normalizedIngredients);

        // Save recipe
        recipe = recipeRepository.save(recipe);
        log.info("Recipe saved: id={}, title={}", recipe.getId(), recipe.getTitle());

        // Build response
        return buildRecipeResponse(recipe, llmResponse, latencyMs);
    }

    /**
     * Normalize ingredients: lowercase, trim, remove duplicates
     */
    private List<String> normalizeIngredients(List<String> ingredients) {
        return ingredients.stream()
                .map(String::trim)
                .map(String::toLowerCase)
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Build structured prompt for LLM
     */
    private String buildPrompt(List<String> ingredients, RecipeRequest request) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are a professional chef. Create a detailed recipe using ONLY these ingredients:\n");
        prompt.append(String.join(", ", ingredients));
        prompt.append("\n\n");

        // Add dietary preferences
        if (request.getDietaryPreferences() != null && !request.getDietaryPreferences().isEmpty()) {
            prompt.append("DIETARY REQUIREMENTS: ");
            prompt.append(String.join(", ", request.getDietaryPreferences()));
            prompt.append("\n\n");
        }

        // Add servings
        prompt.append("Servings: ").append(request.getServings()).append("\n\n");

        // Add constraints
        if (request.getDifficulty() != null) {
            prompt.append("Difficulty level: ").append(request.getDifficulty()).append("\n\n");
        }

        if (request.getMaxTimeMinutes() != null && request.getMaxTimeMinutes() > 0) {
            prompt.append("Maximum cooking time: ").append(request.getMaxTimeMinutes()).append(" minutes\n\n");
        }

        // Request structured JSON output
        prompt.append("Return ONLY a valid JSON object with this EXACT structure:\n");
        prompt.append("{\n");
        prompt.append("  \"title\": \"Recipe name\",\n");
        prompt.append("  \"description\": \"Brief description\",\n");
        prompt.append("  \"prepTime\": 15,\n");
        prompt.append("  \"cookTime\": 30,\n");
        prompt.append("  \"difficulty\": \"easy\",\n");
        prompt.append("  \"cuisine\": \"Italian\",\n");
        prompt.append("  \"instructions\": [\"Step 1\", \"Step 2\", \"Step 3\"],\n");
        prompt.append("  \"ingredients\": [{\"name\": \"chicken\", \"amount\": \"500\", \"unit\": \"g\"}],\n");
        prompt.append("  \"nutritionInfo\": {\"calories\": 350, \"protein\": 30, \"carbs\": 20, \"fat\": 15},\n");
        prompt.append("  \"tags\": [\"Quick\", \"Healthy\"]\n");
        prompt.append("}\n\n");
        prompt.append("Return ONLY the JSON, no explanations or markdown.");

        return prompt.toString();
    }

    /**
     * Parse LLM response into Recipe entity
     */
    private Recipe parseRecipeFromLlm(String llmResponse, User user, List<String> ingredientsUsed) {
        try {
            // Check for null response
            if (llmResponse == null || llmResponse.trim().isEmpty()) {
                throw new RuntimeException("LLM returned empty response");
            }
            
            // Clean up potential markdown code blocks
            String cleanJson = llmResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            // Parse JSON
            JsonNode root = objectMapper.readTree(cleanJson);

            // Extract fields
            String title = root.path("title").asText("Untitled Recipe");
            String description = root.path("description").asText("");
            Integer prepTime = root.path("prepTime").asInt(0);
            Integer cookTime = root.path("cookTime").asInt(0);
            Integer totalTime = prepTime + cookTime;
            String difficulty = root.path("difficulty").asText("medium");
            String cuisine = root.path("cuisine").asText("");

            // Instructions (array to JSON string)
            String instructions = root.path("instructions").toString();

            // Ingredients (array to JSON string)
            String ingredients = root.path("ingredients").toString();

            // Nutrition info (object to JSON string)
            String nutritionInfo = root.path("nutritionInfo").toString();

            // Tags
            List<String> tags = new ArrayList<>();
            JsonNode tagsNode = root.path("tags");
            if (tagsNode.isArray()) {
                tagsNode.forEach(tag -> tags.add(tag.asText()));
            }

            // Determine servings from request (already validated in request object)
            Integer servings = 4; // Default from RecipeRequest

            return Recipe.builder()
                    .user(user)
                    .title(title)
                    .description(description)
                    .prepTime(prepTime)
                    .cookTime(cookTime)
                    .totalTime(totalTime)
                    .servings(servings)
                    .difficulty(difficulty)
                    .cuisine(cuisine)
                    .ingredientsUsed(ingredientsUsed)
                    .instructions(instructions)
                    .ingredients(ingredients)
                    .nutritionInfo(nutritionInfo)
                    .tags(tags)
                    .isSaved(true)
                    .build();

        } catch (JsonProcessingException e) {
            log.error("Failed to parse LLM response as JSON: {}", e.getMessage());
            log.debug("Raw LLM response: {}", llmResponse);

            // Fallback: create a simple recipe with raw content
            return Recipe.builder()
                    .user(user)
                    .title("Recipe from Ingredients")
                    .description("Generated recipe (parsing failed)")
                    .ingredientsUsed(ingredientsUsed)
                    .instructions("[\"" + llmResponse.replace("\"", "\\\"") + "\"]")
                    .isSaved(true)
                    .build();
        }
    }

    /**
     * Build RecipeResponse from Recipe entity
     */
    private RecipeResponse buildRecipeResponse(Recipe recipe, LlmResponse llmResponse, long latencyMs) {
        // Build metadata
        RecipeResponse.GenerationMetaData metadata = RecipeResponse.GenerationMetaData.builder()
                .model(llmResponse.getModel())
                .tokensUsed(llmResponse.getTokensUsed())
                .cached(llmResponse.isCached())
                .latencyMs(latencyMs)
                .generatedAt(LocalDateTime.now())
                .build();

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
                .metadata(metadata)
                .build();
    }

    /**
     * Export recipe as JSON string for S3 storage
     */
    public String exportRecipeAsJson(Recipe recipe) {
        try {
            return objectMapper.writeValueAsString(recipe);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize recipe to JSON: {}", e.getMessage());
            throw new RuntimeException("Failed to export recipe", e);
        }
    }

}