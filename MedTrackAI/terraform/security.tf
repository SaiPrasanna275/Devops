# Security Groups
resource "aws_security_group" "eks_cluster_sg" {
  name        = "medtracker-eks-cluster-sg"
  description = "Security group for EKS cluster"
  vpc_id      = aws_vpc.medtracker_vpc.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "medtracker-eks-cluster-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "medtracker-rds-sg"
  description = "Security group for RDS PostgreSQL instance"
  vpc_id      = aws_vpc.medtracker_vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "medtracker-rds-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "redis_sg" {
  name        = "medtracker-redis-sg"
  description = "Security group for Redis ElastiCache"
  vpc_id      = aws_vpc.medtracker_vpc.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "medtracker-redis-sg"
    Environment = var.environment
  }
}

# WAF for Application Load Balancer
resource "aws_wafv2_web_acl" "medtracker_waf" {
  name  = "medtracker-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  # Rate limiting rule
  rule {
    name     = "RateLimitRule"
    priority = 1

    override_action {
      none {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule"
      sampled_requests_enabled   = true
    }

    action {
      block {}
    }
  }

  # SQL injection protection
  rule {
    name     = "SQLInjectionRule"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "SQLInjectionRule"
      sampled_requests_enabled   = true
    }

    action {
      block {}
    }
  }

  # Common attack protection
  rule {
    name     = "CommonAttackRule"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonAttackRule"
      sampled_requests_enabled   = true
    }

    action {
      block {}
    }
  }

  tags = {
    Name        = "medtracker-waf"
    Environment = var.environment
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "medtracker-waf"
    sampled_requests_enabled   = true
  }
}