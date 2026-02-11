package com.masterchef.masterchef_backend.config;

import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import com.masterchef.masterchef_backend.llm.LlmClient;
import com.masterchef.masterchef_backend.service.SecretsService;
import com.masterchef.masterchef_backend.service.StorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Custom health check indicators for external dependencies
 * 
 * Exposed via /actuator/health endpoint
 * 
 * Used by:
 * ECS health checks (target group health)
 * Application monitoring
 * Circuit breaker decisions
 */

@Configuration
public class HealthCheckConfig {

    /**
     * S3 / Storage health check
     */
    @Slf4j
    @Component
    @RequiredArgsConstructor
    public static class S3HealthIndicator implements HealthIndicator {

        private final StorageService storageService;

        @Override
        public Health health() {
            try {
                boolean available = storageService.isAvailable();

                if (available) {
                    return Health.up()
                            .withDetail("status", "S3 bucket accessible")
                            .build();
                } else {
                    return Health.down()
                            .withDetail("status", "S3 bucket unavaliable")
                            .build();
                }
            } catch (Exception e) {
                log.error("S3 Health check failed", e);
                return Health.down()
                        .withDetail("error", e.getMessage())
                        .build();
            }
        }
    }


    /**
     * Secrets Manager health check
     */
    @Slf4j
    @Component
    @RequiredArgsConstructor
    public static class SecretsManagerHealthIndicator implements HealthIndicator {

        private final SecretsService secretsService;

        @Override
        public Health health() {
            try {
                boolean available = secretsService.isAvailable();

                if (available) {
                    return Health.up()
                            .withDetail("status", "Secrets Manager accessible")
                            .build();
                } else {
                    return Health.down()
                            .withDetail("status", "Secrets Manager unavaliable")
                            .build();
                }
            } catch (Exception e) {
                log.error("Secrets Manager check failed", e);
                return Health.down()
                        .withDetail("error", e.getMessage())
                        .build();
            }
        }
    }


    /**
     * LLM / Ollama health check
     */
    @Slf4j
    @Component
    @RequiredArgsConstructor
    public static class LlmHealthIndicator implements HealthIndicator {

        private final LlmClient llmClient;

        @Override
        public Health health() {
            try {
                boolean available = llmClient.isAvailable();

                if (available) {
                    return Health.up()
                            .withDetail("status", "LLM service up")
                            .withDetail("model", llmClient.getModelName())
                            .build();
                } else {
                    return Health.down()
                            .withDetail("status", "LLM service unavailable")
                            .withDetail("model", llmClient.getModelName())
                            .build();
                } 
            } catch (Exception e) {
                    log.error("LLM health check failed", e);
                    return Health.down()
                            .withDetail("error", e.getMessage())
                            .build();
            }
        }
    }
    
}