package com.masterchef.masterchef_backend.config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudwatchlogs.CloudWatchLogsClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;

/**
 * AWS SDK v2 Configuration
 * By default, connects to LocalStack for local development
 * For production, remove endpoint overrides and use IAM instance roles
 * 
 * LocalStack endpoint is this: http://locahost:4566
 * Services emulated here are S3, CloudWatch Logs, Secrets Manager, IAM
 * 
 * Security Pattern:
 * Local: Uses dummy credentials for LocalStack
 * Production: Uses ECS task role (no credentials in code)
 * 
 * IAM Roles:
 * Task Execution Role: ALlows ECS to pull images and send logs
 * Task Role: Grants app access to S3, Secrets Manager, RDS
 * 
 */

@Configuration
public class AwsConfig {

    @Value("${aws.endpoint:http://localhost:4566}")
    private String awsEndpoint;

    @Value("${aws.region:us-east-1}")
    private String awsRegion;

    @Value("${aws.use-localstack:true}") 
    private boolean useLocalStack;

    /**
     * There are dummy credentials for LocalStack
     * PLEASE DO NOT USE THIS FOR ACTUAL PRODUCTION FOR THE LOVE OF GOD!
     */
    private AwsCredentialsProvider localStackCredentials() {
        return StaticCredentialsProvider.create(
            AwsBasicCredentials.create("test", "test")
        );
    }

    /**
     * S3 CLient for recipe exports and file storage
     * 
     * LocalStack:; Emulated S3 bucket operations
     * Production: Uses ECS task role with S3 policy attached
     * 
     * Required IAM Permissions for Production:
     * s3:PutObject, s3:GetObject, s3:DeleteObject, Your resource
     */
    @Bean
    public S3Client s3Client() {
        var builder = S3Client.builder().region(Region.of(awsRegion));

        if (useLocalStack) {
            builder.endpointOverride(URI.create(awsEndpoint))
                    .credentialsProvider(localStackCredentials())
                    .forcePathStyle(true); // Required for LocalStack S3
        }
        
        // In production (ECS), IAM task role provides credentials automatically
        return builder.build();
    }

    /**
     * CloudWatch Logs Client for centralized logging
     * 
     * LocalStack: Stores logs in local container
     * Production: Sends to CloudWatch Logs (/masterchef/backend/your-log-group)
     * 
     * Required IAM permissions for Production: logs:CreateLogStream, logs:PullLogEvents, and your resource
     */
    @Bean
    public CloudWatchLogsClient cloudWatchLogsClient() {
        var builder = CloudWatchLogsClient.builder()
                        .region(Region.of(awsRegion));
        
        if (useLocalStack) {
            builder.endpointOverride(URI.create(awsEndpoint))
                    .credentialsProvider(localStackCredentials());
        }

        return builder.build();
    }

    /**
     * Secrets Manager Client for secure credential storage
     * 
     * LocalStack: Stores secrets in local containers
     * Production: Fetches DB passwords, JWT secrets, etc you store in them
     * 
     * Required IAM roles: secretsmanager:GetSecretValue, and your resource
     */
    @Bean
    public SecretsManagerClient secretsManagerClient() {
        var builder = SecretsManagerClient.builder()
                        .region(Region.of(awsRegion));
        
        if (useLocalStack) {
            builder.endpointOverride(URI.create(awsEndpoint))
                    .credentialsProvider(localStackCredentials());
        }

        return builder.build();
    }

}
