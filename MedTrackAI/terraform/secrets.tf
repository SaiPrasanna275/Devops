# Secrets Manager for OpenAI API Key
resource "aws_secretsmanager_secret" "openai_api_key" {
  name        = "medtracker/openai-api-key"
  description = "OpenAI API key for MedTracker application"

  tags = {
    Name        = "medtracker-openai-api-key"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "openai_api_key" {
  secret_id     = aws_secretsmanager_secret.openai_api_key.id
  secret_string = jsonencode({
    api_key = var.openai_api_key
  })
}

# Secrets Manager for Database Credentials
resource "aws_secretsmanager_secret" "database_credentials" {
  name        = "medtracker/database-credentials"
  description = "Database credentials for MedTracker RDS instance"

  tags = {
    Name        = "medtracker-database-credentials"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "database_credentials" {
  secret_id = aws_secretsmanager_secret.database_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    engine   = "postgres"
    host     = aws_db_instance.medtracker_db.endpoint
    port     = aws_db_instance.medtracker_db.port
    dbname   = aws_db_instance.medtracker_db.db_name
  })
}