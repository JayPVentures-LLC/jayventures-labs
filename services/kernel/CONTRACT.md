# Kernel Service Contract v0.1

## Purpose

Defines the interface contract for the ASO Execution Kernel service.

This is a non-executable specification used by the Runtime Orchestration Layer.

---

## 1. Responsibility

The Kernel is responsible for:

- Receiving events
- Parsing ASO-Lang statements
- Routing events to ASO and IAT engines
- Emitting execution results

It does NOT:

- store long-term state
- perform simulation
- modify registry directly

---

## 2. Input Event Schema

All kernel inputs MUST follow this structure:

```
Event {
  id: string
  type: string
  payload: object
  timestamp: number
  trace: string[]
}
```

---

## 3. Processing Contract

### Step 1: Ingestion
- Accept event from queue
- Validate schema

### Step 2: Classification
- Identify ASO statement type
- Identify IAT relevance

### Step 3: Dispatch
- Send structural logic to ASO Engine
- Send accessibility logic to IAT Engine

### Step 4: Return
- Receive computed results
- Package execution response

---

## 4. Output Contract

Kernel outputs a normalized execution result:

```
ExecutionResult {
  event_id: string
  status: "success | failure | partial"
  aso_result: object
  iat_result: object
  trace: string[]
}
```

---

## 5. Failure Handling

Kernel MUST:

- never silently drop events
- always emit failure result with reason
- preserve trace lineage

---

## 6. Design Constraint

Kernel is stateless by design.

All persistent state is externalized to:

- Registry Service
- Instrumentation Layer
- Simulation Engine

---

## 7. System Principle

> The Kernel is a router, not a thinker. It coordinates evaluation but does not interpret meaning.