terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # ---- EDIT THIS: replace with the S3 bucket name you created for Terraform state ----
  backend "s3" {
    bucket = "YOUR-TERRAFORM-STATE-BUCKET"
    key    = "formflow/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

# ---------------------------------------------------------------------------
# Security group: SSH, HTTP (client), and the server's exposed port
# ---------------------------------------------------------------------------
resource "aws_security_group" "formflow_sg" {
  name        = "formflow-sg"
  description = "FormFlow app security group"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP (client)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Server API"
    from_port   = 5000
    to_port     = 5000
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
    Name = "formflow-sg"
  }
}

# ---------------------------------------------------------------------------
# Always use the latest Ubuntu 22.04 LTS AMI for the region
# ---------------------------------------------------------------------------
data "aws_ssm_parameter" "ubuntu_ami" {
  name = "/aws/service/canonical/ubuntu/server/22.04/stable/current/amd64/hvm/ebs-gp2/ami-id"
}

# ---------------------------------------------------------------------------
# EC2 instance: installs Docker automatically on first boot via user_data
# ---------------------------------------------------------------------------
resource "aws_instance" "formflow_server" {
  ami                    = data.aws_ssm_parameter.ubuntu_ami.value
  instance_type          = "t2.micro"
  key_name               = "formflow-key" # must already exist in this AWS account/region
  vpc_security_group_ids = [aws_security_group.formflow_sg.id]

  user_data = <<-EOF
    #!/bin/bash
    set -e
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker ubuntu
    mkdir -p /home/ubuntu/formflow
    chown ubuntu:ubuntu /home/ubuntu/formflow
  EOF

  tags = {
    Name = "formflow-server"
  }
}

output "public_ip" {
  description = "Public IP of the FormFlow EC2 instance"
  value       = aws_instance.formflow_server.public_ip
}