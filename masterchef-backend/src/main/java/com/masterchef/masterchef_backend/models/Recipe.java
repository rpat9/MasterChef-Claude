package com.masterchef.masterchef_backend.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

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
@Table(name = "recipes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipe {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "prep_time")
    private Integer prepTime;

    @Column(name = "cook_time")
    private Integer cookTime;

    @Column(name = "total_time")
    private Integer totalTime;

    @Column(name = "servings")
    private Integer servings;

    @Column(name = "difficulty", length = 50)
    private String difficulty;

    @Column(name = "cuisine", length = 100)
    private String cuisine;

    @Column(name = "ingredients_used", nullable = false, columnDefinition = "TEXT[]")
    @Builder.Default
    private List<String> ingredientsUsed = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "instructions", columnDefinition = "JSONB")
    private String instructions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ingredients", columnDefinition = "JSONB")
    private String ingredients;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "nutrition_info", columnDefinition = "JSONB")
    private String nutritionInfo;

    @Column(name = "tags", columnDefinition = "TEXT[]")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Column(name = "is_saved")
    @Builder.Default
    private Boolean isSaved = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}