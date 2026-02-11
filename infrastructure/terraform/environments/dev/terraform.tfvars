# Dev Environment Configuration Values

# Project
project_name = "masterchef"
environment  = "dev"
aws_region   = "us-east-1"

# Networking
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]
enable_nat_gateway = true

# ECS - Minimal resources for dev
task_cpu      = "512"   # 0.5 vCPU
task_memory   = "1024"  # 1GB RAM
desired_count = 1       # Single task for dev
min_capacity  = 1
max_capacity  = 2

# RDS - Minimal resources for dev
db_instance_class  = "db.t3.micro"
db_allocated_storage = 20
enable_multi_az      = false  # Single AZ for dev (cost savings)

# Features
enable_container_insights   = true
enable_performance_insights = true
enable_deletion_protection  = false  # Allow easy teardown in dev
enable_ecs_exec            = true    # Enable debugging