# GinaService — AWS Multi-AZ VPC Module
variable "environment" { type = string }
variable "cidr_block"  { type = string, default = "10.20.0.0/16" }

resource "aws_vpc" "gina_vpc" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name        = "gina-vpc-${var.environment}"
    Platform    = "GinaService"
    Environment = var.environment
  }
}

output "vpc_id" {
  value = aws_vpc.gina_vpc.id
}
