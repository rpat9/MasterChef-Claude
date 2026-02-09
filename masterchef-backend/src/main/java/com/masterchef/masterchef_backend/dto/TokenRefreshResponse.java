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
public class TokenRefreshResponse {
    
    private String accessToken;
    private Long expiresIn;
    private LocalDateTime issuedAt;

    @Builder.Default
    private String tokenType = "Bearer";

}