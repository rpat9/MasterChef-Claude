package com.masterchef.masterchef_backend.llm;

import com.masterchef.masterchef_backend.dto.LlmRequest;
import com.masterchef.masterchef_backend.dto.LlmResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

/**
 * Mock LLM client for testing without Ollama dependency
 * Returns deterministic responses for predictable test assertions
 */
@Component
@Profile("test")
public class MockLlmClient implements LlmClient {
    
    private boolean available = true;
    
    @Override
    public LlmResponse generate(LlmRequest request) {
        // Return a simple JSON recipe structure
        String mockRecipe = """
            {
                "title": "Mock Recipe",
                "description": "Test recipe using %s",
                "prepTime": 15,
                "cookTime": 30,
                "difficulty": "easy",
                "cuisine": "Test",
                "instructions": ["Step 1: Prepare ingredients", "Step 2: Cook", "Step 3: Serve"],
                "ingredients": [{"name": "test ingredient", "amount": "100", "unit": "g"}],
                "nutritionInfo": {"calories": 250, "protein": 20, "carbs": 30, "fat": 10},
                "tags": ["Test", "Mock"]
            }
            """.formatted(request.getPrompt().substring(0, Math.min(50, request.getPrompt().length())));
        
        return LlmResponse.builder()
                .content(mockRecipe)
                .model("mock-model")
                .tokensUsed(estimateTokens(mockRecipe))
                .costCents(0)
                .cached(false)
                .latencyMs(100L)
                .generatedAt(LocalDateTime.now())
                .status("SUCCESS")
                .build();
    }
    
    @Override
    public boolean isAvailable() {
        return available;
    }
    
    @Override
    public String getModelName() {
        return "mock-model";
    }
    
    @Override
    public int estimateTokens(String text) {
        return text.length() / 4;
    }
    
    // Test helper methods
    public void setAvailable(boolean available) {
        this.available = available;
    }
}