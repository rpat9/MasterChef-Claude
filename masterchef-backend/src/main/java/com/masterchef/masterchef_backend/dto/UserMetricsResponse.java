package com.masterchef.masterchef_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMetricsResponse {

    private Long totalGenerations;
    private Long cacheHits;
    private Long totalRecipesSaved;
    private Long totalTokensUsed;
    private Double averageLatencyMs;
    private Double cacheHitRate;
    
}