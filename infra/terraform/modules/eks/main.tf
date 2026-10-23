# GinaService — AWS EKS Cluster Module (Kubernetes 1.30)
variable "environment"    { type = string }
variable "cluster_name"   { type = string, default = "gina-eks" }
variable "k8s_version"    { type = string, default = "1.30" }
variable "subnet_ids"     { type = list(string), default = [] }
variable "cluster_role"   { type = string, default = "" }

resource "aws_eks_cluster" "gina_eks" {
  name     = "${var.cluster_name}-${var.environment}"
  role_arn = var.cluster_role
  version  = var.k8s_version

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_Private_access = true
    endpoint_public_access  = true
  }

  tags = {
    Platform    = "GinaService"
    Environment = var.environment
  }
}

output "cluster_endpoint" {
  value = aws_eks_cluster.gina_eks.endpoint
}
