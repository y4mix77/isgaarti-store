# ISGAARTI Store

**ISGAARTI Store** is a full-stack ecommerce platform built for a modern multi-role marketplace experience. It connects clients, vendors, and administrators through a polished Angular interface, a secured Spring Boot API, PostgreSQL persistence, Stripe payment flow, ImageKit media storage, and a production-ready DevOps foundation.

The project is designed as a serious ecommerce system, not a simple storefront: product catalog, cart, promotions, order tracking, vendor inventory, admin control, vendor approval, dashboards, invoices, and operational activity flows are all part of the platform.

## Flagship Summary

```text
Angular storefront
Spring Boot REST API
PostgreSQL database
JWT role security
Stripe payment integration
ImageKit product media
Docker production runtime
Kubernetes + Kustomize deployment
GitHub Actions CI
GHCR image publishing
```

## Main Roles

- **Client**: browse catalog, manage cart, apply promo codes, pay, track orders, download invoices.
- **Vendor**: manage products, images, stock, suppliers, promotions, and customer orders.
- **Admin**: manage users, vendor approvals, categories, global promotions, dashboards, and alerts.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Angular 21, TypeScript, CSS |
| Backend | Spring Boot 4, Spring Security, Spring Data JPA |
| Database | PostgreSQL |
| Auth | JWT, role-based access control |
| Payments | Stripe |
| Media | ImageKit.io |
| DevOps | Docker, Docker Compose, Kubernetes, Kustomize |
| CI/CD | GitHub Actions, GitHub Container Registry |

## DevOps Readiness

The project includes a complete production-preparation chain:

- environment-based configuration;
- secret-safe `.env.example` and Kubernetes secret templates;
- Dockerfiles for backend and frontend;
- `docker-compose.prod.yml` for local production rehearsal;
- Kubernetes manifests split with Kustomize;
- local and production overlays;
- GitHub Actions pipeline;
- automatic Docker image publishing to GHCR.

Published images:

```text
ghcr.io/y4mix77/isgaarti-backend:latest
ghcr.io/y4mix77/isgaarti-frontend:latest
```

## Run With Docker Compose

Create a local `.env` from the example, fill the real secrets, then run:

```powershell
docker compose -f docker-compose.prod.yml up --build -d
```

Open:

```text
http://localhost:4301
```

Backend health:

```text
http://localhost:8080/api/health
```

## Run With Kubernetes Local

Create the local Kubernetes secret:

```powershell
Copy-Item k8s\overlays\local\secret.example.yml k8s\overlays\local\secret.yml
```

Deploy:

```powershell
kubectl apply -k k8s\overlays\local
```

Open:

```text
http://localhost:30431
```

## Project Structure

```text
backend/boutique      Spring Boot API
frontend              Angular ecommerce interface
k8s                   Kubernetes base and overlays
docs                  Project documentation
.github/workflows     CI pipeline
```

## Status

```text
Application: functional
Docker: ready
Kubernetes local: ready
CI: passing
Container registry: ready
Cloud deployment: prepared, not yet hosted
```

**ISGAARTI Store is cloud-ready: containerized, orchestrable, secured by environment configuration, validated by CI, and prepared for enterprise-grade deployment.**
