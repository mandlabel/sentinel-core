# Ingestion API Contract

## Purpose

The ingestion API accepts error and transaction events from client SDKs and enqueues them for asynchronous processing.  
Its responsibility is limited to validation, minimal normalization, and buffering of incoming events.  
It does not perform aggregation, fingerprinting, analytics, or long-running processing.

---

## Endpoint Definition

### POST /api/events

Accepts a single error or transaction event from a client application.

---

## Request Schema

### Request Body (JSON)

#### Common Fields

- `project_id` (UUID, required)  
  Identifier of the project the event belongs to.

- `type` (`"error"` | `"transaction"`, required)  
  Type of the event.

- `occurred_at` (ISO 8601 timestamp, required)  
  Timestamp when the event occurred in the client application.

- `payload` (object, required)  
  Event-specific data. Structure depends on the event type.

---

### Error Event Payload

Used when `type = "error"`.

- `message` (string, required)  
  Error message.

- `exception_type` (string, required)  
  Type or class of the exception.

- `stacktrace` (string, required)  
  Serialized stack trace.

- `context` (object, optional)  
  Additional contextual metadata (environment, tags, user hints, etc.).

---

### Transaction Event Payload

Used when `type = "transaction"`.

- `name` (string, required)  
  Logical name of the transaction (e.g. route or operation name).

- `duration_ms` (number, required)  
  Duration of the transaction in milliseconds.

- `status` (string, optional)  
  Outcome or status of the transaction.

- `context` (object, optional)  
  Additional contextual metadata.

---

## Validation Rules

- Requests with missing required fields are rejected.
- Unknown event types are rejected.
- Payload structure must match the event type.
- Invalid timestamps are rejected.
- Payload size is limited to a fixed maximum to prevent abuse.
- The ingestion API performs no semantic validation beyond schema correctness.

---

## Response Semantics

### Success

**200 OK**

```json
{
  "status": "accepted"
}
```

### Error Responses


**400 Bad Request**

```
Invalid request payload or schema violation.
```

**404 Not Found**

```
Unknown project_id.
```

**500 Internal Server Error**

```
Unexpected ingestion failure (should be rare).
```

## Processing Guarantees and Limitations

- Events are accepted on a best-effort basis.
- Acceptance does not guarantee immediate or synchronous persistence.
- No ordering guarantees are provided across events.
- No deduplication is performed at ingestion time.
- Events may be dropped if the system is under extreme load.
- The API response does not guarantee that the event has been durably stored.