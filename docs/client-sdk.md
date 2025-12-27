# Client SDK Design

## Purpose

The client SDK provides a lightweight interface for applications to capture error and transaction events and send them to the ingestion API.  
It hides transport, serialization, and failure handling details from the application developer.  
The SDK does not guarantee delivery, persistence, or real-time behavior.

---

## Initialization

The SDK requires explicit initialization before use.

Initialization requires:
- `project_id` identifying the monitored project
- Ingestion API base URL
- Optional static context (environment, service name, version)

Initialization behavior:
- Initialization must be called once during application startup
- Calling capture methods before initialization is a no-op
- Re-initialization overwrites previous configuration

---

## Public API

The SDK exposes a minimal public interface.

### captureError(error, context?)

Captures an application error event.

Behavior:
- Accepts an error object and optional contextual metadata
- Extracts message, exception type, and stack trace
- Attaches timestamp at capture time
- Serializes the event into the ingestion API schema
- Never throws exceptions to the host application

---

### captureTransaction(name, duration_ms, context?)

Captures a transaction or performance event.

Behavior:
- Accepts a logical transaction name and duration in milliseconds
- Attaches timestamp at capture time
- Serializes the event into the ingestion API schema
- Never blocks or delays application execution

---

## SDK Responsibilities

The SDK is responsible for:
- Capturing timestamps at the point of observation
- Normalizing payload structure to match the ingestion contract
- Safely serializing errors and metadata
- Preventing exceptions from escaping into the host application
- Keeping runtime overhead minimal

---

## Explicit Non-Responsibilities

The SDK does not:
- Guarantee event delivery
- Retry failed requests
- Persist events locally
- Perform batching or aggregation
- Apply sampling or rate limiting
- Perform fingerprinting or analytics

---

## Failure Behavior

- All SDK failures are silent and non-blocking
- Network or serialization errors are swallowed
- Application behavior must remain unaffected under all failure modes
