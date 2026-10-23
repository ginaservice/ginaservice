terraform {
  required_version = ">= 1.6.0"
}

module "vpc" {
  source      = "../../modules/vpc"
  environment = "staging"
  cidr_block  = "10.30.0.0/16"
}

module "eks" {
  source      = "../../modules/eks"
  environment = "staging"
}

module "rds" {
  source         = "../../modules/rds"
  environment    = "staging"
  instance_class = "db.t4g.medium"
  db_password    = var.db_password
}

variable "db_password" {
  type      = string
  sensitive = true
}
