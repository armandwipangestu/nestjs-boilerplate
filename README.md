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

![Alt](https://repobeats.axiom.co/api/embed/bacf3559fe13db7c67ff75df6188a697271bdd96.svg "Repobeats analytics image")

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

# Run in development mode
bun run start:dev
```

### Using Docker

```bash
docker-compose up -d
```

## Roadmap

- [ ✅ ] JWT Authentication with Refresh Tokens
- [ ✅ ] RBAC implementation
- [ ✅ ] Swagger Documentation
- [ ✅ ] Prisma & PostgreSQL Integration
- [ ✅ ] Redis Integration
- [ ✅ ] Custom Logger (Winston)
- [ ✅ ] CORS Whitelisting
- [ ✅ ] Global Validation Pipe
- [ ✅ ] CI/CD Github Actions
- [ ✅ ] Semantic Versioning & Conventional Commits
- [ ✅ ] Export data metrics using Prometheus exporter (Port 9464)
- [ ✅ ] Distributed tracing integration using OpenTelemetry
- [ ] Multi database support (SQLite, PostgreSQL, MySQL, etc.)
- [ ] Stresss / load test using K6
- [ ] Unit & E2E Tests coverage

## License

This project is [MIT licensed](https://github.com/armandwipangestu/nestjs-boilerplate/blob/main/LICENSE).
