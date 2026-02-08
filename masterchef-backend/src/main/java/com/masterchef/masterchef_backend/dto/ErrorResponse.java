package com.masterchef.masterchef_backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private Integer status;
    private String error;
    private String message;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    private String path;

    /**
     * Validation errors (for 400 Bad Request)
     */
    private List<FieldError> validationErrors;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldError {
        private String field;
        private String message;
        private Object rejectedValue;
    }
    
}