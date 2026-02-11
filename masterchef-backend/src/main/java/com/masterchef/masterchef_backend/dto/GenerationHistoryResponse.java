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
public class GenerationHistoryResponse {

    private UUID id;
    private List<String> ingredients;
    private List<String> dietaryPreferences;
    private String modelUsed;
    private Integer tokensUsed;
    private Boolean cached;
    private Long latencyMs;
    private String status;
    private String errorMessage;
    private LocalDateTime createdAt;
    
}