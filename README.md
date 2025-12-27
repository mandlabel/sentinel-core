# sentinel-core

### Overview

`sentinel-core` is an event ingestion and error analytics platform inspired by Sentry.
It captures application errors and performance events, processes them asynchronously via background workers and exposes aggregated metrics for analysis and visualization.

The project focuses on backend system design, including ingestion pipelines, background processing, data modeling, and query performance.

### Intended Usage

This system is designed to be integrated into backend and frontend applications via a lightweight client SDK, allowing developers to capture and analyze runtime errors and performance metrics.

### Motivation

Modern applications generate large volumes of runtime errors and performance signals.
Handling these events synchronously leads to high latency, tight coupling, and fragile systems.

This project explores a production-style architecture where event ingestion is decoupled from processing and analytics, using TypeScript and PostgreSQL.

## Scope

### In scope

- Error and transaction event ingestion
- Asynchronous background processing
- Error grouping (fingerprinting)
- Time-based aggregations (per-minute metrics)
- Query API for analytics
- Minimal dashboard for visualization

### Out of scope

- Authentication and authorization (single-project focus)
- Multi-tenant access control
- Distributed tracing
- Alert delivery (email, Slack, etc.)
- Billing or usage limits


## High-Level Architecture

```
Client SDK
   ↓
Ingestion API (Fastify)
   ↓
Queue (async buffer)
   ↓
Worker Service
   ↓
PostgreSQL (events + aggregates)
   ↓
Query API
   ↓
Minimal Dashboard
```

Each stage is isolated to allow independent scaling, backpressure, and failure handling.

## Technology Stack

### Backend

- TypeScript
- Node.js
- Fastify
- PostgreSQL

### Frontend

- React
- TypeScript

### Infrastructure
- Docker Compose

## Design Principles

- Fast ingestion: client-facing APIs must respond quickly
- Asynchronous processing: heavy work is offloaded to workers
- Explicit data modeling: schemas are defined before implementation
- Operational realism: tradeoffs are documented, not hidden

## Current Status

This project is under active development.
Initial work focuses on system design, data modeling, and ingestion flow before implementing full processing and query pipelines.

## Future Work

- Alerting rules and thresholds
- Retention policies
- Improved aggregation strategies
- Query performance benchmarking

## Disclaimer

This is an educational and exploratory project and is not intended as a production-ready replacement for Sentry.

