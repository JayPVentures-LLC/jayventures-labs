# Instrumentation Layer Contract v0.1

## Purpose

Defines the contract for immutable event logging, trace capture, and system observability across the ASO/IAT execution runtime.

---

## 1. Responsibility

The Instrumentation Layer is responsible for:

- Capturing all runtime events
- Enforcing append-only log behavior
- Maintaining trace lineage across all layers
- Supporting replay and simulation engines

It does NOT:

- evaluate ASO logic
- compute IAT transitions
- modify registry state

---

## 2. Event Schema

All events MUST conform to:

```
InstrumentationEvent {
  event_id: string
  event_type: "execution | transition | measurement | decision | error"
  timestamp: number
  source_layer: string
  entity_id: string
  payload: object
  trace: string[]
  confidence: number
}
```

---

## 3. Logging Rules

### Rule 1: Append-only
- Events are never modified or deleted
- Corrections are appended as new events referencing prior event_id

### Rule 2: Completeness
- All events must include required schema fields
- Partial events are rejected or marked invalid

### Rule 3: Trace Integrity
- Every event must maintain lineage chain
- No orphan events allowed in validated state

---

## 4. Event Types

### Execution Event
- Result of ASO statement evaluation

### Transition Event
- IAT state changes

### Measurement Event
- Operational scoring outputs

### Decision Event
- Registry updates or mutations

### Error Event
- Failures in any layer of execution

---

## 5. Storage Model

Instrumentation data is stored in:

- Append-only event store
- Indexed by timestamp
- Indexed by entity_id
- Indexed by event_type

No in-place updates allowed.

---

## 6. Query Model

Must support:

- full timeline reconstruction
- per-entity trace graphs
- cross-layer causality tracing
- anomaly detection feeds

---

## 7. Failure Handling

If logging fails:

- system MUST retry
- if retry fails, emit error event to fallback channel
- system MUST NOT silently drop events

---

## 8. System Principle

> If it is not instrumented, it is not part of the system's observable reality.