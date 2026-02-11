output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "db_instance_address" {
  description = "RDS instance address"
  value       = aws_db_instance.main.address
}

output "db_instance_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "db_instance_port" {
  description = "Database port"
  value       = aws_db_instance.main.port
}

output "db_security_group_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
}

output "db_secret_arn" {
  description = "ARN of Secrets Manager secret containing DB credentials"
  value       = aws_secretsmanager_secret.db_password.arn
}

output "db_instance_id" {
  description = "RDS instance identifier"
  value       = aws_db_instance.main.id
}

output "db_resource_id" {
  description = "RDS resource ID (for IAM authentication)"
  value       = aws_db_instance.main.resource_id
}