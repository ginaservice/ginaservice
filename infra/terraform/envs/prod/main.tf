terraform {
  required_version = ">= 1.6.0"
}

module "vpc" {
  source      = "../../modules/vpc"
  environment = "prod"
  cidr_block  = "10.20.0.0/16"
}

module "eks" {
  source      = "../../modules/eks"
  environment = "prod"
}

module "rds" {
  source         = "../../modules/rds"
  environment    = "prod"
  instance_class = "db.r6g.xlarge"
  db_password    = var.db_password
}

variable "db_password" {
  type      = string
  sensitive = true
}
