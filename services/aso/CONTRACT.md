# ASO Engine Contract v0.1

## Purpose

Defines the interface contract for the ASO evaluation engine.

The ASO engine evaluates structural meaning, relationships, and validity of ASO-Lang statements.

---

## 1. Responsibility

The ASO Engine is responsible for:

- Parsing ASO-Lang statements into structured form
- Validating ontology correctness
- Resolving vocabulary and namespace references
- Producing structural evaluation outputs

It does NOT:

- manage IAT accessibility states
- perform simulation or replay
- store persistent system state

---

## 2. Input Contract

Input MUST be an execution event:

```
ASOEvent {
  id: string
  statement: string
  type: "definition | derivation | relation | hypothesis | measurement"
  timestamp: number
  trace: string[]
}
```

---

## 3. Processing Pipeline

### Step 1: Parse
- Convert statement into AST-like structure

### Step 2: Validate
- Check grammar compliance
- Verify allowed relationship verbs
- Validate namespace correctness

### Step 3: Resolve
- Map terms to vocabulary registry IDs
- Verify type consistency

### Step 4: Evaluate
- Determine structural validity
- Produce derived relationships if applicable

---

## 4. Output Contract

```
ASOResult {
  event_id: string
  valid: boolean
  derived_relations: object[]
  errors: string[]
  trace: string[]
}
```

---

## 5. Failure Handling

- Invalid grammar → reject with error
- Unknown term → unresolved dependency flag
- Type mismatch → structural invalidation

All failures MUST be returned, not dropped.

---

## 6. Design Constraint

The ASO Engine is stateless.

All persistence is handled externally via:

- Registry Service
- Instrumentation Layer
- Simulation Engine

---

## 7. System Principle

> The ASO Engine determines structural validity, not meaning truth.