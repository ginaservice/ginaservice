# GinaService — AWS RDS PostgreSQL 16 Multi-AZ Module
variable "environment"     { type = string }
variable "instance_class"  { type = string, default = "db.r6g.large" }
variable "allocated_gb"    { type = number, default = 100 }
variable "db_password"     { type = string, sensitive = true }

resource "aws_db_instance" "gina_postgres" {
  identifier              = "gina-postgres-${var.environment}"
  engine                  = "postgres"
  engine_version          = "16.2"
  instance_class          = var.instance_class
  allocated_storage       = var.allocated_gb
  storage_encrypted       = true
  multi_az                = var.environment == "prod"
  db_name                 = "gina_db"
  username                = "gina"
  password                = var.db_password
  backup_retention_period = 14
  skip_final_snapshot     = var.environment != "prod"

  tags = {
    Platform    = "GinaService"
    Environment = var.environment
  }
}

output "rds_endpoint" {
  value = aws_db_instance.gina_postgres.endpoint
}
