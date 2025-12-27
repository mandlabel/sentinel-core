# Database Access Patterns

This document describes how each database table is accessed by different system components,
focusing on read/write frequency and performance characteristics.

---

## projects

Written by:
- Project setup / administrative path

Read by:
- Ingestion API (project validation)
- Query API (project context resolution)

Access pattern:
- Low write frequency
- Low read frequency
- Not latency sensitive

---

## events_raw

Written by:
- Ingestion API

Read by:
- Worker service

Access pattern:
- High-frequency append-only writes
- Sequential reads by workers
- Latency sensitive on write path

---

## error_groups

Written by:
- Worker service (upsert on fingerprint)

Read by:
- Query API

Access pattern:
- Moderate write frequency
- Read-heavy for dashboards and error listings
- Correctness prioritized over throughput

---

## metrics_minute

Written by:
- Worker service (periodic aggregation)

Read by:
- Query API
- Dashboard

Access pattern:
- Low-frequency batch writes
- High read frequency
- Optimized for analytical queries
