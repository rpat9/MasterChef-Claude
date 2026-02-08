package com.masterchef.masterchef_backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LlmRequest {
    
    /**
     * THe full prompt to send to the LLM
     */
    private String prompt;

    /**
     * Model Name (e.g., "mistral", "gpt-4")
     */
    private String model;

    /**
     * Maximum tokens to generate (null = use model default)
     */
    private Integer maxTokens;

    /**
     * Temperature for generation (0.0 = deterministic, 1.0 = creative)
     */
    @Builder.Default
    private Double temperature = 0.7;

    /**
     * Ingredients used (for logging/debugging)
     */
    private List<String> ingredients;

    /**
     * User Id (for metrics tracking)
     */
    private String userId;

}