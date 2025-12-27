# System Design

## Purpose

This system provides a backend platform for collecting, processing, and analyzing application errors and performance events.  
It is intended for developers who want visibility into runtime failures and basic performance characteristics of their applications.  
The system does not aim to replace full observability platforms or provide real-time guarantees, alerting, or enterprise-grade features.

---

## Error Event Lifecycle

1. An error or performance event occurs inside a client application.
2. The client SDK captures the event and serializes the relevant data (timestamp, context, stack trace, metadata).
3. The SDK sends the event as an HTTP request to the ingestion API.
4. The ingestion API validates the payload and immediately enqueues the event into an asynchronous buffer.
5. A worker service consumes the event from the queue.
6. The worker computes a fingerprint for error grouping and updates aggregated metrics.
7. Processed data is persisted into PostgreSQL as events and time-based aggregates.
8. The query API exposes aggregated data for analytical queries.
9. The dashboard retrieves data from the query API and visualizes errors and metrics.

---

## Non-Goals

- User authentication or authorization
- Multi-project or multi-tenant access control
- Distributed tracing or span-level analysis
- Alert delivery via email, Slack, or other channels
- Real-time processing guarantees or low-latency SLAs
- Billing, quotas, or usage enforcement
