variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

variable "s3_bucket_arn" {
  description = "S3 bucket ARN for recipe exports"
  type        = string
}

variable "secrets_manager_arns" {
  description = "List of Secrets Manager ARNs for database credentials"
  type        = list(string)
  default     = ["*"]
}

variable "enable_rds_iam_auth" {
  description = "Enable IAM authentication for RDS"
  type        = bool
  default     = false
}

variable "rds_resource_id" {
  description = "RDS resource ID for IAM authentication"
  type        = string
  default     = ""
}