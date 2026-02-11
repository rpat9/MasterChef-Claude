# Main Terraform Configuration for Dev Environment
# Orchestrates all modules to deploy complete infrastructure

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Uncomment to use S3 backend for state management
  # backend "s3" {
  #   bucket         = "masterchef-terraform-state"
  #   key            = "dev/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "masterchef-terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# Networking Module
module "networking" {
  source = "../../modules/networking"

  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  enable_nat_gateway   = var.enable_nat_gateway
  enable_vpc_flow_logs = var.enable_vpc_flow_logs
}

# ECS Module (must be created before RDS to get security group)
module "ecs" {
  source = "../../modules/ecs"

  project_name            = var.project_name
  environment             = var.environment
  aws_region              = var.aws_region
  vpc_id                  = module.networking.vpc_id
  public_subnet_ids       = module.networking.public_subnet_ids
  private_subnet_ids      = module.networking.private_subnet_ids
  task_execution_role_arn = module.iam.ecs_task_execution_role_arn
  task_role_arn           = module.iam.ecs_task_role_arn
  db_secret_arn           = module.rds.db_secret_arn

  container_image             = var.container_image
  task_cpu                    = var.task_cpu
  task_memory                 = var.task_memory
  desired_count               = var.desired_count
  min_capacity                = var.min_capacity
  max_capacity                = var.max_capacity
  log_retention_days          = var.log_retention_days
  enable_container_insights   = var.enable_container_insights
  enable_deletion_protection  = var.enable_deletion_protection
  enable_ecs_exec             = var.enable_ecs_exec

  depends_on = [module.networking]
}

# RDS Module
module "rds" {
  source = "../../modules/rds"

  project_name            = var.project_name
  environment             = var.environment
  vpc_id                  = module.networking.vpc_id
  private_subnet_ids      = module.networking.private_subnet_ids
  ecs_security_group_id   = module.ecs.ecs_security_group_id

  db_name                     = var.db_name
  db_username                 = var.db_username
  db_engine_version           = var.db_engine_version
  db_instance_class           = var.db_instance_class
  db_allocated_storage        = var.db_allocated_storage
  enable_multi_az             = var.enable_multi_az
  backup_retention_days       = var.backup_retention_days
  enable_performance_insights = var.enable_performance_insights
  enable_deletion_protection  = var.enable_deletion_protection

  depends_on = [module.networking, module.ecs]
}

# IAM Module
module "iam" {
  source = "../../modules/iam"

  project_name         = var.project_name
  environment          = var.environment
  aws_region           = var.aws_region
  aws_account_id       = data.aws_caller_identity.current.account_id
  s3_bucket_arn        = module.ecs.s3_bucket_arn
  secrets_manager_arns = [module.rds.db_secret_arn]
  enable_rds_iam_auth  = var.enable_rds_iam_auth
  rds_resource_id      = module.rds.db_resource_id

  depends_on = [module.ecs, module.rds]
}