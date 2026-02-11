#!/bin/bash

# LocalStack initialization script
# Creates S3 buckets and seeds Secrets Manager for local development

set -e

echo "Initializing LocalStack..."

# Wait for LocalStack to be ready
echo "⏳ Waiting for LocalStack..."
until curl -s http://localhost:4566/_localstack/health | grep -q '"s3": "available"'; do
  sleep 2
done
echo "✅ LocalStack ready"

# AWS CLI config for LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL="http://localhost:4566"

# Create S3 bucket
echo "📦 Creating S3 bucket: masterchef-recipes"
aws --endpoint-url=$ENDPOINT_URL s3 mb s3://masterchef-recipes 2>/dev/null || echo "Bucket already exists"

# Verify bucket
aws --endpoint-url=$ENDPOINT_URL s3 ls | grep masterchef-recipes && echo "✅ S3 bucket ready"

# Create CloudWatch Log Group
echo "📝 Creating CloudWatch Log Group: /masterchef/backend"
aws --endpoint-url=$ENDPOINT_URL logs create-log-group \
  --log-group-name /masterchef/backend 2>/dev/null || echo "Log group already exists"

# Verify log group
aws --endpoint-url=$ENDPOINT_URL logs describe-log-groups \
  --log-group-name-prefix /masterchef/backend | grep /masterchef/backend && echo "✅ Log group ready"

# Create test secret
echo "🔐 Creating Secrets Manager secret: masterchef/db-credentials"
aws --endpoint-url=$ENDPOINT_URL secretsmanager create-secret \
  --name masterchef/db-credentials \
  --description "Database credentials for local development" \
  --secret-string '{"username":"dev","password":"dev","host":"localhost","port":"5432","database":"masterchef"}' \
  2>/dev/null || echo "Secret already exists"

# Verify secret
aws --endpoint-url=$ENDPOINT_URL secretsmanager describe-secret \
  --secret-id masterchef/db-credentials | grep masterchef/db-credentials && echo "✅ Secret ready"

echo ""
echo "LocalStack initialization complete!"
echo ""
echo "Resources created:"
echo "  - S3 bucket: masterchef-recipes"
echo "  - CloudWatch Log Group: /masterchef/backend"
echo "  - Secret: masterchef/db-credentials"