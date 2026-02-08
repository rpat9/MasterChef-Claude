package com.masterchef.masterchef_backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LlmResponse {
    
    /**
     * The generated text content
     */
    private String content;

    /**
     * Model that generated this response
     */
    private String model;

    /**
     * Number of tokens used (input + output)
     */
    private Integer tokensUsed;

    /**
     * Estimated cost in cents
     */
    @Builder.Default
    private Integer costCents = 0;

    /**
     * Whether this was served from cache
     */
    @Builder.Default
    private boolean cached = false;

    /**
     *  Generation latency in milliseconds
     */
    private Long latencyMs;

    /**
     * Timestamp of generation
     */
    @Builder.Default
    private LocalDateTime generatedAt = LocalDateTime.now();

    /**
     * Status: SUCCESS, CACHE_HIT, FAILED, TIMEOUT
     */
    private String status;

    /**
     * Error message if failed
     */
    private String errorMessage;
    
}