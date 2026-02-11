# Networking Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.networking.private_subnet_ids
}

# ECS Outputs
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.ecs.service_name
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.ecs.alb_dns_name
}

output "application_url" {
  description = "Application URL"
  value       = "http://${module.ecs.alb_dns_name}"
}

output "s3_bucket_name" {
  description = "S3 bucket for recipe exports"
  value       = module.ecs.s3_bucket_name
}

# RDS Outputs
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.db_instance_endpoint
  sensitive   = true
}

output "rds_database_name" {
  description = "RDS database name"
  value       = module.rds.db_instance_name
}

output "db_secret_arn" {
  description = "Secrets Manager ARN for database credentials"
  value       = module.rds.db_secret_arn
  sensitive   = true
}

# IAM Outputs
output "task_execution_role_arn" {
  description = "ECS task execution role ARN"
  value       = module.iam.ecs_task_execution_role_arn
}

output "task_role_arn" {
  description = "ECS task role ARN"
  value       = module.iam.ecs_task_role_arn
}

# Deployment Information
output "deployment_instructions" {
  description = "Post-deployment steps"
  value = <<-EOT
    
    ========================================
    MasterChef Backend - Deployment Complete
    ========================================
    
    Application URL: http://${module.ecs.alb_dns_name}
    
    Health Check: http://${module.ecs.alb_dns_name}/actuator/health
    
    Next Steps:
    1. Build and push Docker image:
       docker build -t ${var.container_image} ./masterchef-backend
       docker push ${var.container_image}
    
    2. Update ECS service to use new image:
       aws ecs update-service --cluster ${module.ecs.cluster_name} \
         --service ${module.ecs.service_name} --force-new-deployment
    
    3. View logs:
       aws logs tail /ecs/${var.project_name}-backend --follow
    
    4. Database credentials stored in Secrets Manager:
       aws secretsmanager get-secret-value --secret-id ${module.rds.db_secret_arn}
    
    Resources Created:
    - VPC with public/private subnets across ${length(var.availability_zones)} AZs
    - Application Load Balancer
    - ECS Fargate cluster with auto-scaling (${var.min_capacity}-${var.max_capacity} tasks)
    - RDS PostgreSQL ${var.db_instance_class} (${var.db_allocated_storage}GB)
    - S3 bucket for recipe exports
    - CloudWatch log groups and alarms
    - IAM roles with least-privilege policies
    
    ========================================
  EOT
}