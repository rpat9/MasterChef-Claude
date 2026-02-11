package com.masterchef.masterchef_backend.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.services.cloudwatchlogs.model.ResourceNotFoundException;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.CreateSecretRequest;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueResponse;
import software.amazon.awssdk.services.secretsmanager.model.ListSecretsRequest;
import software.amazon.awssdk.services.secretsmanager.model.SecretsManagerException;
import software.amazon.awssdk.services.secretsmanager.model.UpdateSecretRequest;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecretsService {
    
    private final SecretsManagerClient secretsManagerClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${aws.secrets-manager.enabled:true}")
    private boolean secretsManagerEnabled;

    /**
     * Get secret value by name
     * 
     * @param secretName Name of the secret in AWS Secrets Manager
     * @return Secret value string
     */
    public String getSecret(String secretName) {
        if(!secretsManagerEnabled) {
            log.warn("Secrets Manager disabled, skipping fetching");
            return null;
        }
        log.debug("Fetching secret: {}", secretName);

        try {
            GetSecretValueRequest request = GetSecretValueRequest.builder()
                    .secretId(secretName)
                    .build();

            GetSecretValueResponse response = secretsManagerClient.getSecretValue(request);

            log.info("Secret fetch successfully: {}", secretName);

            return response.secretString();

        } catch (ResourceNotFoundException e) {
            log.error("Secret not found: {}", secretName);
            return null;
        } catch (SecretsManagerException e) {
            log.error("Failed to fetch secret: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch secret from AWS", e);
        }
    }

    /**
     * Get secret as key-value map (for JSON secrets)
     * 
     * @param secretName Name of the secret
     * @return Map of key-value pairs
     */
    @SuppressWarnings("unchecked")
    public Map<String, String> getSecretAsMap(String secretName) {
        String secretJson = getSecret(secretName);

        if (secretJson == null) {
            return Map.of();
        }

        try {
            return objectMapper.readValue(secretJson, Map.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse secret JSON: {}", e.getMessage(), e);
            return Map.of();
        }
    }

    /**
     * Create or update a secret (used for LocalStack initialization)
     * 
     * @param secretName Name of the secret
     * @param secretValue Value to store
     */
    public void createOrUpdateSecret(String secretName, String secretValue) {
        if(!secretsManagerEnabled) {
            log.warn("Secrets Manager is disabled, skipping creation");
            return;
        }
        log.info("Creating/updating secret: {}", secretName);

        try {

            UpdateSecretRequest updateRequest = UpdateSecretRequest.builder()
                    .secretId(secretName)
                    .secretString(secretValue)
                    .build();
            
            secretsManagerClient.updateSecret(updateRequest);
            log.info("Secret updated: {}", secretName);

        } catch (ResourceNotFoundException e) {

            // This means that the secret does not exist yet so we have to add it
            CreateSecretRequest createRequest = CreateSecretRequest.builder()
                    .name(secretName)
                    .secretString(secretValue)
                    .description("Masterchef backend secret")
                    .build();
            
            secretsManagerClient.createSecret(createRequest);
            log.info("Secret created: {}", secretName);

        } catch (SecretsManagerException e) {
            log.error("Failed to create/update secret: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to manage secret", e);
        }
    }

    /**
     * Check if Secrets Manager is available (health check)
     */
    public boolean isAvailable() {
        if (!secretsManagerEnabled) {
            return false;
        }

        try {
            ListSecretsRequest request = ListSecretsRequest.builder()
                    .maxResults(1)
                    .build();
            
            secretsManagerClient.listSecrets(request);
            return true;
        } catch (SecretsManagerException e) {
            log.warn("Secrets Manager health check failed: {}", e.getMessage(), e);
            return false;
        }
    }

}