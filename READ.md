# FormFlow — Dockerized 3-Tier CI/CD Capstone

Group 3 Cloud & DevOps Bootcamp capstone project. A 3-tier application (React client, Node.js server, MongoDB)
deployed to AWS EC2, with a fully automated GitHub Actions pipeline that provisions its own infrastructure.

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   client     │─────▶│   server    │─────▶│  mongodb    │
│  (Nginx,     │      │  (Node.js,  │      │  (auth-     │
│   port 80)   │      │  port 3000) │      │  enabled)   │
└─────────────┘      └─────────────┘      └─────────────┘
        all three run as containers via Docker Compose
                  on a single EC2 instance
```

- **client** — React app served via Nginx, built from `client/Dockerfile`
- **server** — Node.js/Express API, built from `server/Dockerfile`, connects to MongoDB with authenticated credentials
- **mongodb** — official `mongo:7` image, root username/password supplied via environment variables (never hardcoded), data persisted in a named Docker volume

## CI/CD Pipeline

Every push to `main` triggers `.github/workflows/deploy.yml`, which runs three jobs in sequence:

### 1. `build-and-push`
Builds the `client` and `server` Docker images and pushes them to Docker Hub (`chibucious/formflow-client`,
`chibucious/formflow-server`), tagged `latest`.

### 2. `provision`
Runs Terraform (`terraform/main.tf`) to create AWS infrastructure **only if it doesn't already exist**:
- A security group (`formflow-sg`) allowing SSH (22), HTTP (80), and the server API port (5000)
- An EC2 instance (`t2.micro`, latest Ubuntu 22.04 AMI looked up dynamically via SSM), with Docker installed
  automatically on first boot via `user_data`

Terraform state is stored remotely in an S3 bucket (`formflow-terraform-state-13382`), so repeated runs update
existing infrastructure instead of duplicating it. Authentication to AWS uses OIDC — GitHub Actions assumes an
IAM role (`gatherloop-deploy-role`) with no long-lived AWS access keys stored anywhere.

### 3. `deploy`
- Copies `docker-compose.yml` to the EC2 instance over SCP
- Writes a `.env` file on the instance directly from GitHub secrets (Docker Hub username, Mongo credentials, port
  mappings) — real credentials never touch the git repo
- Runs `docker compose pull` and `docker compose up -d` to pull the freshly built images and start all three
  containers

## Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | IAM role GitHub Actions assumes via OIDC |
| `DOCKERHUB_USERNAME` | Docker Hub account for pushing/pulling images |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `EC2_SSH_KEY` | Private key content for `formflow-key`, used to SSH into the instance |
| `MONGO_ROOT_USER` | MongoDB root username |
| `MONGO_ROOT_PASSWORD` | MongoDB root password (generated via `openssl rand -base64 24`) |
| `APP_CLIENT_PORT` | Host:container port mapping for the client, e.g. `80:80` |
| `APP_SERVER_PORT` | Host:container port mapping for the server, e.g. `5000:3000` |

## AWS IAM Setup

The GitHub Actions OIDC provider (`token.actions.githubusercontent.com`) and the `gatherloop-deploy-role` are
shared across this project and the GatherLoop capstone. The role's trust policy permits both repositories, and its
permissions policy (`formflow-terraform-permissions`) grants:
- Full EC2 access (to create/destroy the security group and instance)
- `ssm:GetParameter` (to look up the latest Ubuntu AMI ID dynamically)
- S3 access scoped to the Terraform state bucket only

## Provisioning and Destroying Manually

Provisioning normally happens automatically on push. To do it manually from the `terraform/` folder:

```bash
cd terraform
terraform init
terraform apply
```

To tear everything down cleanly (recommended over manual `aws ec2 terminate-instances`, since Terraform tracks
state):

```bash
cd terraform
terraform destroy
```

This removes the EC2 instance and security group only — it does not touch the SSH key pair, the Terraform state
bucket, Docker Hub images, or GitHub secrets, all of which are reused on the next provision.

## Troubleshooting Journey (What We Fixed Along the Way)

This pipeline didn't work on the first try — documenting the real issues hit and fixed, since this maps directly
to the capstone's incident report requirement:

1. **`docker-compose.yml` env var bug** — `DOCKERHUB_USER` was written as literal text instead of `${DOCKERHUB_USER}`,
   causing Docker to try pulling an image with a literal, invalid repository name.
2. **Missing `.env` on the server** — `CLIENT_PORT`/`SERVER_PORT` were referenced in the compose file but never
   defined anywhere, causing `no port specified` errors. Fixed by having the pipeline write `.env` from secrets.
3. **Hardcoded, unauthenticated MongoDB** — the original Dockerfile baked in `mongodb://mongodb:27017/mydatabase`
   with no credentials. Replaced with root username/password sourced from environment variables.
4. **Wrong server port** — `.env` initially assumed port 5000 internally; the Dockerfile actually exposes 3000.
   Fixed the host:container mapping to `5000:3000`.
5. **OIDC "Not authorized" errors** — root cause was GitHub appending immutable numeric IDs to the repo/owner name
   in the OIDC `sub` claim (`repo:Owner@id/repo@id:ref:...`) after a rename event, which no longer matched the
   plain-text trust policy. Diagnosed via AWS CloudTrail's logged `errorMessage`, fixed by adding the ID-qualified
   `sub` value to the trust policy alongside the plain one.
6. **Missing `ssm:GetParameter` permission** — Terraform's dynamic AMI lookup needs SSM access, which wasn't in
   the original IAM policy. Added as a scoped permission.
7. **Docker not ready in time** — on a freshly provisioned instance, the deploy job's SSH steps sometimes ran
   before the `user_data` script finished installing Docker, causing `docker: command not found`. Needs a
   readiness-polling step (or a longer fixed wait) rather than a short fixed `sleep`.

## Current Status

- [x] Docker images build and push successfully
- [x] Terraform provisions EC2 + security group automatically on push
- [x] OIDC authentication working (trust policy fixed for ID-qualified sub claims)
- [x] `.env` written automatically from GitHub secrets on each deploy
- [x] MongoDB running with authentication, not hardcoded credentials
- [ ] Reliable readiness check before deploy steps run (currently a fixed `sleep`, occasionally too short)
- [ ] Confirm application is reachable and functioning end-to-end after a fresh provision

## Founder-Facing Note

We built this so a normal `git push` to the main branch does everything: builds the app, spins up a fresh server
if one doesn't already exist, and deploys the latest version — no one needs to manually log into AWS or run
commands by hand for a routine update.