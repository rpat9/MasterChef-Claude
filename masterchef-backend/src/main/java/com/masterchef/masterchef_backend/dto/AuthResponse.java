package com.masterchef.masterchef_backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private UUID userId;
    private String email;
    private String name;
    private String accessToken;
    private String refreshToken;
    private Long expiresIn; // Seconds until access token expires
    private LocalDateTime issuedAt;

    @Builder.Default
    private String tokenType = "Bearer";
    
}