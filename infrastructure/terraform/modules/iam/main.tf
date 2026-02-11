# IAM Roles and Policies for ECS Tasks
# Implements least-privilege security model

# ECS Task Execution Role
# Used by ECS to pull images, write logs, fetch secrets
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project_name}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-ecs-task-execution-role"
    Environment = var.environment
    Purpose     = "ECS task execution"
  }
}

# Attach AWS managed policy for ECS task execution
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Additional policy for Secrets Manager access (for DB credentials)
resource "aws_iam_role_policy" "ecs_task_execution_secrets" {
  name = "${var.project_name}-ecs-task-execution-secrets"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = var.secrets_manager_arns
      }
    ]
  })
}

# ECS Task Role
# Used by the application running in ECS containers
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.project_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-ecs-task-role"
    Environment = var.environment
    Purpose     = "Application permissions"
  }
}

# S3 Access Policy (for recipe exports)
resource "aws_iam_role_policy" "ecs_task_s3_access" {
  name = "${var.project_name}-ecs-task-s3-access"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          var.s3_bucket_arn,
          "${var.s3_bucket_arn}/*"
        ]
      }
    ]
  })
}

# CloudWatch Logs Policy (for application logging)
resource "aws_iam_role_policy" "ecs_task_cloudwatch_logs" {
  name = "${var.project_name}-ecs-task-cloudwatch-logs"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = [
          "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/masterchef/*"
        ]
      }
    ]
  })
}

# Secrets Manager Access Policy (for runtime secret access)
resource "aws_iam_role_policy" "ecs_task_secrets_access" {
  name = "${var.project_name}-ecs-task-secrets-access"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = var.secrets_manager_arns
      }
    ]
  })
}

# RDS Connection Policy (if using IAM database authentication)
resource "aws_iam_role_policy" "ecs_task_rds_connect" {
  count = var.enable_rds_iam_auth ? 1 : 0
  name  = "${var.project_name}-ecs-task-rds-connect"
  role  = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "rds-db:connect"
        ]
        Resource = [
          "arn:aws:rds-db:${var.aws_region}:${var.aws_account_id}:dbuser:${var.rds_resource_id}/*"
        ]
      }
    ]
  })
}

# CloudWatch Metrics Policy (for custom metrics)
resource "aws_iam_role_policy" "ecs_task_cloudwatch_metrics" {
  name = "${var.project_name}-ecs-task-cloudwatch-metrics"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = "MasterChef/Backend"
          }
        }
      }
    ]
  })
}