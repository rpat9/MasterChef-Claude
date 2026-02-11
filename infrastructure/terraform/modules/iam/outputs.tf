output "ecs_task_execution_role_arn" {
  description = "ARN of ECS task execution role"
  value       = aws_iam_role.ecs_task_execution_role.arn
}

output "ecs_task_execution_role_name" {
  description = "Name of ECS task execution role"
  value       = aws_iam_role.ecs_task_execution_role.name
}

output "ecs_task_role_arn" {
  description = "ARN of ECS task role (application permissions)"
  value       = aws_iam_role.ecs_task_role.arn
}

output "ecs_task_role_name" {
  description = "Name of ECS task role"
  value       = aws_iam_role.ecs_task_role.name
}