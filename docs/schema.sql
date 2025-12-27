-- =====================================================
-- sentinel-core database schema (v0)
-- =====================================================

-- Projects represent a logical application being monitored
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Raw events ingested from client SDKs (write-optimized)
CREATE TABLE events_raw (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id),
    event_type TEXT NOT NULL, -- 'error' | 'transaction'
    occurred_at TIMESTAMP NOT NULL,
    received_at TIMESTAMP NOT NULL DEFAULT NOW(),
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Grouped errors based on fingerprinting
CREATE TABLE error_groups (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id),
    fingerprint TEXT NOT NULL,
    first_seen TIMESTAMP NOT NULL,
    last_seen TIMESTAMP NOT NULL,
    occurrence_count INTEGER NOT NULL
);

-- Time-based aggregated metrics (read-optimized)
CREATE TABLE metrics_minute (
    project_id UUID NOT NULL REFERENCES projects(id),
    minute TIMESTAMP NOT NULL,
    error_count INTEGER NOT NULL,
    p50_latency_ms DOUBLE PRECISION,
    p95_latency_ms DOUBLE PRECISION,
    p99_latency_ms DOUBLE PRECISION,
    PRIMARY KEY (project_id, minute)
);
