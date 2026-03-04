<h1 align="center">A Production-Ready NestJS Boilerplate</h1>

<div align="center">

![NestJS](https://img.shields.io/badge/-NestJS-131821?style=for-the-badge&logo=nestjs)&nbsp;
![Prisma](https://img.shields.io/badge/-Prisma-131821?style=for-the-badge&logo=prisma)&nbsp;
![Bun](https://img.shields.io/badge/-Bun-131821?style=for-the-badge&logo=bun)&nbsp;
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-131821?style=for-the-badge&logo=postgresql)&nbsp;
![Docker](https://img.shields.io/badge/-Docker-131821?style=for-the-badge&logo=docker)&nbsp;
![Redis](https://img.shields.io/badge/-Redis-131821?style=for-the-badge&logo=redis)&nbsp;
![Swagger](https://img.shields.io/badge/-Swagger-131821?style=for-the-badge&logo=swagger)&nbsp;
![S3](https://img.shields.io/badge/-S3-131821?style=for-the-badge&logo=minio)&nbsp;
![OpenTelemetry](https://img.shields.io/badge/-OpenTelemetry-131821?style=for-the-badge&logo=opentelemetry)&nbsp;
![Grafana](https://img.shields.io/badge/-Grafana-131821?style=for-the-badge&logo=grafana)&nbsp;
![Loki](https://img.shields.io/badge/-Loki-131821?style=for-the-badge&logo=grafana)&nbsp;
![Tempo](https://img.shields.io/badge/-Tempo-131821?style=for-the-badge&logo=grafana)&nbsp;
![Alloy](https://img.shields.io/badge/-Alloy-131821?style=for-the-badge&logo=grafana)&nbsp;
![Prometheus](https://img.shields.io/badge/-Prometheus-131821?style=for-the-badge&logo=prometheus)&nbsp;
![k6](https://img.shields.io/badge/-k6-131821?style=for-the-badge&logo=k6)&nbsp;
![Jest](https://img.shields.io/badge/-Jest-131821?style=for-the-badge&logo=jest)&nbsp;

</div>

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" />
</p>

## Description

A powerful, type-safe NestJS boilerplate designed for scalability and developer experience. It comes pre-configured with essential tools like Prisma ORM, JWT Authentication (including Refresh Tokens), RBAC, Swagger documentation, and a robust logging system.

## Features

- **Authentication & Security**
  - JWT Access Tokens & Refresh Tokens
  - HttpOnly Cookie support for secure token storage
  - RBAC (Role-Based Access Control)
  - CORS Whitelisting
  - Password hashing with Bcrypt
- **Developer Experience**
  - Fully Typed with TypeScript
  - DTO Validation via `class-validator` & `class-transformer`
  - OpenAPI (Swagger) Integration at `/docs`
  - Global Validation Pipe
  - Unified Error Handling
- **Database & Ops**
  - Prisma ORM for type-safe database access
  - Redis integration for caching/logging
  - Docker & Docker Compose support
  - Custom Logger (Winston) with daily rotation
- **Performance & Observability**
  - Powered by Bun for fast execution
  - Throttling & Rate Limiting
  - Distributed Tracing with OpenTelemetry
  - Metrics exposure via Prometheus exporter `/metrics` with default port `9464`
  - Log correlation (Trace ID injection into Winston logs)

## Repo Stats

![Alt](https://repobeats.axiom.co/api/embed/bacf3559fe13db7c67ff75df6188a697271bdd96.svg 'Repobeats analytics image')

## Star History

<a href="https://www.star-history.com/#armandwipangestu/nestjs-boilerplate&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=armandwipangestu/nestjs-boilerplate&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=armandwipangestu/nestjs-boilerplate&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=armandwipangestu/nestjs-boilerplate&type=date&legend=top-left" />
 </picture>
</a>

## Contributors

<a href="https://github.com/armandwipangestu/nestjs-boilerplate/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=armandwipangestu/nestjs-boilerplate" />
</a>

## Running the Application

### Using Bun

```bash
# Clone the repository
git clone https://github.com/armandwipangestu/nestjs-boilerplate.git

# Install dependencies
bun install

# Setup environment variables
cp .env.example .env

# Generate Prisma client
bun run prisma generate

# Run migrations
bun run prisma:migrate:deploy

# Run seeder
bun run prisma:seed

# Run in development mode
bun run start:dev
```

### Using Docker

> [!NOTE]
> If you want to run `loki`, `tempo`, and `prometheus`. You should change ownership folder using this command:
>
> ```bash
> # loki
> sudo chown -R 10001:10001 ./docker-data/loki
>
> # tempo
> sudo chown -R 10001:10001 ./docker-data/tempo
>
> # prometheus
> sudo chown -R 65534:65534 ./docker-data/prometheus
> ```
>
> You can also import dashboard for metrics using `observability/grafana/dashboard-metrics.json` and logs using `observability/grafana/dashboard-logs.json`.

```bash
docker-compose up -d
```

### Load Testing with k6

You can perform load testing using the provided `k6` script located at `observability/k6/load-test.js`.

#### Running Locally

If you have `k6` installed on your machine:

```bash
# Basic run
k6 run observability/k6/load-test.js

# Run with custom environment variables
BASE_URL=http://localhost:3000 k6 run observability/k6/load-test.js
```

## Roadmap

- [x] JWT Authentication with Refresh Tokens
- [x] RBAC implementation
- [x] Swagger Documentation
- [x] Prisma & PostgreSQL Integration
- [x] Redis Integration
- [x] Custom Logger (Winston)
- [x] CORS Whitelisting
- [x] Global Validation Pipe
- [x] CI/CD Github Actions
- [x] Semantic Versioning & Conventional Commits
- [x] Export data metrics using Prometheus exporter (Port 9464)
- [x] Distributed tracing integration using OpenTelemetry
- [x] Observability setup using OpenTelemetry, Grafana, Loki, Tempo, and Prometheus
- [x] Multi database support (SQLite, PostgreSQL, MySQL, etc.)
- [x] Load testing using k6
- [x] Unit & E2E Tests coverage

## License

This project is [MIT licensed](https://github.com/armandwipangestu/nestjs-boilerplate/blob/main/LICENSE).
