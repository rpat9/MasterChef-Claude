package com.masterchef.masterchef_backend.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recipe_generations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeGeneration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "ingredients", nullable = false, columnDefinition = "TEXT[]")
    @Builder.Default
    private List<String> ingredients = new ArrayList<>();

    @Column(name = "dietary_preferences", columnDefinition = "TEXT[]")
    @Builder.Default
    private List<String> dietaryPreferences = new ArrayList<>();

    @Column(name = "prompt", nullable = false, columnDefinition = "TEXT")
    private String prompt;

    @Column(name = "raw_response", columnDefinition = "TEXT")
    private String rawResponse;

    @Column(name = "model_used", nullable = false, length = 100)
    private String modelUsed;

    @Column(name = "tokens_used")
    private Integer tokensUsed;

    @Column(name = "cost_cents")
    @Builder.Default
    private Integer costCents = 0;

    @Column(name = "cached")
    @Builder.Default
    private Boolean cached = false;

    @Column(name = "latency_ms")
    private Long latencyMs;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
}