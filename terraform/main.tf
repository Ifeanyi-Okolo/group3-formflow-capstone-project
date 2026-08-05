terraform {
  backend "s3" {
    bucket = "TERRAFORM_STATE_BUCKET"
    key    = "formflow/terraform.tfstate"
    region = "AWS_REGION"
  }
}

provider "aws" {
  region = "AWS_REGION"
}

resource "aws_security_group" "formflow_sg" {
  name        = "AWS-RESOURCE-NAME"
  description = "FormFlow app security group"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
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
}

data "aws_ssm_parameter" "ubuntu_ami" {
  name = "/aws/service/canonical/ubuntu/server/22.04/stable/current/amd64/hvm/ebs-gp2/ami-id"
}

resource "aws_instance" "formflow_server" {
  ami                    = data.aws_ssm_parameter.ubuntu_ami.value
  instance_type          = "t2.micro"
  key_name               = "formflow-key"
  vpc_security_group_ids = [aws_security_group.formflow_sg.id]

  user_data = <<-EOF
    #!/bin/bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker ubuntu
    mkdir -p /home/ubuntu/formflow
    chown ubuntu:ubuntu /home/ubuntu/formflow
  EOF

  tags = { Name = "formflow-server" }
}

output "public_ip" {
  description = "Public IP of the FormFlow EC2 instance"
  value       = aws_instance.formflow_server.public_ip
}