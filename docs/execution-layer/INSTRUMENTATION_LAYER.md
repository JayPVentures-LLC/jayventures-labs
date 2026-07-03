# Instrumentation Layer v0.1

## Purpose

Defines how ASO/IAT execution events are captured, logged, scored, and retained as structured observational data.

This layer converts abstract execution semantics into persistent system telemetry.

---

## 1. Instrumentation Scope

The system records four primary event classes:

- Execution Events (statements evaluated)
- State Transitions (ASO and IAT changes)
- Measurement Outputs (observational values)
- Decision Events (registry mutations)

---

## 2. Event Envelope Standard

Every recorded event MUST follow this structure:

```json
{
  "event_id": "unique-id",
  "timestamp": "ISO-8601",
  "event_type": "Execution | Transition | Measurement | Decision",
  "source_layer": "ASO | IAT | Execution | Bridge",
  "entity_id": "registry-id or concept-id",
  "input": {},
  "output": {},
  "context": {},
  "confidence": 0.0,
  "trace": []
}
```

---

## 3. Logging Rules

### Rule 1 — Immutability

Once written, events are never modified.
Corrections are appended as new events referencing original event_id.

### Rule 2 — Completeness

Every event must include:

- source layer
- entity reference
- timestamp
- confidence value

Missing fields invalidate the event.

### Rule 3 — Traceability

All derived outputs must include a trace chain:

```
Event_n → Event_n-1 → ... → Root Event
```

---

## 4. Confidence Model

Confidence is not truth.
It is a stability indicator of evaluation reliability.

### Confidence inputs:

- data consistency
- measurement repeatability
- contextual clarity
- conflict presence

### Output range:

```
0.0 (unreliable) → 1.0 (fully stable observation)
```

---

## 5. Contradiction Handling

Contradictions are never removed.
They are explicitly recorded as paired events:

- Claim Event
- Counter-Claim Event
- Resolution Status Event

Resolution states:

- unresolved
- partially resolved
- resolved by revision
- unresolved but retained

---

## 6. Event Types

### Execution Event
Represents evaluated ASO-Lang statements.

### Transition Event
Represents IAT state changes:

- Latent → Accessible
- Accessible → Conscious
- Conscious → Expressed
- Expressed → Applied

### Measurement Event
Represents operational scoring outputs.

### Decision Event
Represents registry mutations (accepted, rejected, revised).

---

## 7. Storage Model

Events are stored in append-only logs:

- chronological ordering required
- cross-linked by entity_id
- indexed by event_type

---

## 8. Query Model

Instrumentation layer must support:

- timeline reconstruction
- per-entity trace extraction
- contradiction graph extraction
- confidence trend analysis

---

## 9. System Principle

> If it is not logged, it did not participate in system evaluation.

---

## 10. Boundary Rule

Instrumentation does not interpret meaning.
It only records structured system behavior for downstream analysis.