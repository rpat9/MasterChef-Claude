package com.masterchef.masterchef_backend.exception;

/**
 * Thrown when S3/storage operations fail
 */
public class StorageException extends RuntimeException{
    public StorageException(String message) {
        super(message);
    }
    
    public StorageException(String message, Throwable cause) {
        super(message, cause);
    }
}