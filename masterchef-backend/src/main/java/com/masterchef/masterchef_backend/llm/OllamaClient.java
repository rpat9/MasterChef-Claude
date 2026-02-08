package com.masterchef.masterchef_backend.llm;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.masterchef.masterchef_backend.dto.LlmRequest;
import com.masterchef.masterchef_backend.dto.LlmResponse;
import com.masterchef.masterchef_backend.exception.LlmException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class OllamaClient implements LlmClient{

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String defaultModel;

    public OllamaClient(
        RestTemplate restTemplate, 
        @Value("${llm.ollama.base-url}") String baseUrl,
        @Value("${llm.ollama.model}") String defaultModel
    ){
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
        this.defaultModel = defaultModel;
    }

    @Override
    public LlmResponse generate(LlmRequest request) {
        long startTime = System.currentTimeMillis();

        try {
            log.debug("Sending request to Ollama: model={}, promptLength={}", 
                request.getModel(), request.getPrompt().length()
            );

            // Build Ollama API request body
            Map<String, Object> requestBody = Map.of(
                "model", request.getModel() != null ? request.getModel() : defaultModel,
                "prompt", request.getPrompt(),
                "stream", false,
                "options", Map.of(
                    "temperature", request.getTemperature()
                )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Call Ollama API
            ResponseEntity<Map> response = restTemplate.postForEntity(
                baseUrl + "/api/generate",
                entity,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String content = (String) body.get("response");

                long latency = System.currentTimeMillis() - startTime;

                log.info("Ollama generation successful: latency={}ms, responseLength={}",
                    latency, content != null ? content.length() : 0
                );

                return LlmResponse.builder()
                    .content(content)
                    .model((String) body.getOrDefault("model", defaultModel))
                    .tokensUsed(estimateTokens(request.getPrompt() + content))
                    .costCents(0)
                    .cached(false)
                    .latencyMs(latency)
                    .generatedAt(LocalDateTime.now())
                    .status("SUCCESS")
                    .build();
            }

            throw new LlmException("Ollama returned non-OK status: " + response.getStatusCode());

        } catch (RestClientException e){
            long latency = System.currentTimeMillis() - startTime;
            log.error("Ollama generation failed: {}", e.getMessage(), e);

            return LlmResponse.builder()
                .model(defaultModel)
                .cached(false)
                .latencyMs(latency)
                .generatedAt(LocalDateTime.now())
                .status("FAILED")
                .errorMessage(e.getMessage())
                .build();
        }
    }

    @Override
    public boolean isAvailable() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                baseUrl + "/api/tags", 
                Map.class
            );
            return response.getStatusCode() == HttpStatus.OK;
        } catch (RestClientException e) {
            log.warn("Ollama health check failed: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public String getModelName() {
        return defaultModel;
    }

    @Override
    public int estimateTokens(String text) {
        // Rough estimation: ~4 characters per token
        return text.length() / 4;
    }
    
}