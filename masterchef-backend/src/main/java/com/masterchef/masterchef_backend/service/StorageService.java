package com.masterchef.masterchef_backend.service;

import java.net.URI;
import java.time.Duration;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

/**
 * S3-backed storage service for recipe exports and file management
 * 
 * Operations:
 * Upload recipe exports (JSON, PDF)
 * Generate presigned download URLs (15-minute expiration)
 * Store prompt templates and versions
 * Delete old exports
 * 
 * LocalStack: Files stored in local container
 * Production: Files stored in S3 bucket (whatever you named it)
 */

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name:masterchef-recipes}")
    private String bucketName;

    @Value("${aws.endpoint:http://localhost:4566")
    private String awsEndpoint;

    @Value("${aws.region:us-east-1}")
    private String awsRegion;

    @Value("${aws.use-localstack:true}")
    private boolean useLocalStack;

    /**
     * Initialize S3 Bucket (create if not exists)
     * Called upon application startup
     */
    public void initializeBucket() {
        try {
            HeadBucketRequest headBucketRequest = HeadBucketRequest.builder().bucket(bucketName).build();
            s3Client.headBucket(headBucketRequest);
            log.info("S3 buck exists: {}", bucketName);
        } catch (NoSuchBucketException e) {
            log.info("Creating S3 bucket: {}", bucketName);

            CreateBucketRequest createBucketRequest = CreateBucketRequest.builder().bucket(bucketName).build();
            s3Client.createBucket(createBucketRequest);
            log.info("S3 bucket created: {}", bucketName);
        } catch (S3Exception e) {
            log.error("Failed to initialize S3 bucket: {}", e.getMessage(), e);
            throw new RuntimeException("S3 bucket initialization failed");
        }
    }

    /**
     * Upload recipe export to S3
     * 
     * @param userId Owner of the recipe
     * @param recipeId Recipe identifer
     * @param content File content (JSON, PDF, etc)
     * @param contentType MIME type (e.g., "application/json")
     * @return S3 object key
     */
    public String uploadRecipeExport(UUID userId, UUID recipeId, byte[] content, String contentType) {
        String extension = contentType.equals("application/pdf") ? "pdf" : "json";
        String key = String.format("exports/%s%s.%s", userId, recipeId, extension);
        
        log.info("Uploading to S3: bucket = {}, key={}, size={} bytes", bucketName, key, content.length);

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .contentLength((long) content.length)
                    .build();
            
            s3Client.putObject(putRequest, RequestBody.fromBytes(content));

            log.info("Upload successful: key={}", key);
            return key;
        } catch (S3Exception e) {
            log.error("S3 upload fialed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload to S3", e);
        }
    }

    /**
     * Generate presigned download URL (expires in 15 minutes)
     * 
     * @param key S3 object key
     * @return Presigned URL string
     */
    public String generatePresignedUrl(String key) {
        log.debug("Generating presigned URL: key={}", key);

        try {
            S3Presigner.Builder presignerBuilder = S3Presigner.builder().region(Region.of(awsRegion));

            if (useLocalStack) {
                presignerBuilder.endpointOverride(URI.create(awsEndpoint));
            }

            try (S3Presigner presigner = presignerBuilder.build()) {
                GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build();
                
                GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(15))
                        .getObjectRequest(getObjectRequest)
                        .build();
                
                PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);

                String url = presignedRequest.url().toString();
                log.info("Presigned URL generated: key={}, expiresIn=15min", key);

                return url;
            }
        } catch (S3Exception e) {
            log.error("Failed to generate presigned URL: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate presigned URL", e);
        }
    }

    /**
     * Delete object from S3
     * 
     * @param key S3 object key
     */
    public void deleteObject(String key) {
        log.info("Deleting S3 Object: key={}", key);

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            
            s3Client.deleteObject(deleteRequest);
            log.info("Deleted S3 object: key={}", key);
        } catch (S3Exception e) {
            log.error("Failed to delete S3 object: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete object from S3");
        }
    }

    /**
     * Check if S3 is available (health check)
     */
    public boolean isAvailable() {
        try {
            HeadBucketRequest request = HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build();
            
            s3Client.headBucket(request);
            return true;
        } catch (S3Exception e) {
            log.warn("S3 health check failed: {}", e.getMessage(), e);
            return false;
        }
    }

}
