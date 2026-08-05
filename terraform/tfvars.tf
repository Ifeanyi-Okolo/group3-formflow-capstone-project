variable "TERRAFORM_STATE_BUCKET" {
	description = "S3 bucket ARN for Terraform state"
	type        = string
	default     = "arn:aws:s3:::formflow-terraform-state-13382"
}
variable "AWS_REGION" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "AWS-RESOURCE-NAME" {
  description = "AWS resource name"
  type        = string
  default     = "formflow-sg"
}