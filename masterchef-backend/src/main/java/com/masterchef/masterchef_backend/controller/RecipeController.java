package com.masterchef.masterchef_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.masterchef.masterchef_backend.dto.RecipeRequest;
import com.masterchef.masterchef_backend.dto.RecipeResponse;
import com.masterchef.masterchef_backend.models.User;
import com.masterchef.masterchef_backend.repository.UserRepository;
import com.masterchef.masterchef_backend.service.RecipeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;
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
}