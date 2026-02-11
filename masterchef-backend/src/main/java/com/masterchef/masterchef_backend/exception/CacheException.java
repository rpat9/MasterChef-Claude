package com.masterchef.masterchef_backend.exception;

/**
 * Thrown when cache operations fail
 */
public class CacheException extends RuntimeException {
    
    public CacheException(String message) {
        super(message);
    }
    
    public CacheException(String message, Throwable cause) {
        super(message, cause);
    }
}