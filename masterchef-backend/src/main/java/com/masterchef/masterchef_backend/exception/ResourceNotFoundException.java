package com.masterchef.masterchef_backend.exception;

/**
 * Thrown when a requested resource (recipe, user, etc.) is not found
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceType, String identifier) {
        super(String.format("%s not found with identifier: %s", resourceType, identifier));
    }
    
}