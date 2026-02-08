package com.masterchef.masterchef_backend.exception;

/**
 * Exception thrown when LLM generation fails
 */
public class LlmException extends RuntimeException {

    public LlmException(String message) {
        super(message);
    }

    public LlmException(String message, Throwable cause) {
        super(message, cause);
    }
}
