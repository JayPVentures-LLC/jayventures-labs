# IAT Engine Contract v0.1

## Purpose

Defines the interface contract for the IAT (Information Accessibility Theory) engine.

The IAT engine models how information transitions between latent, accessible, conscious, expressed, and applied states.

---

## 1. Responsibility

The IAT Engine is responsible for:

- Maintaining accessibility state graph
- Computing probabilistic transitions between states
- Updating information visibility status
- Responding to ASO-derived structural signals

It does NOT:

- validate ontology structure (ASO responsibility)
- perform simulation or replay
- persist long-term logs (instrumentation responsibility)

---

## 2. Input Contract

Input MUST be an execution event:

```
IATEvent {
  id: string
  context_id: string
  signal_type: string
  timestamp: number
  trace: string[]
  aso_context: object
}
```

---

## 3. Internal State Model

The engine maintains an accessibility graph:

```
LatentInformation
AccessibleInformation
ConsciouslyAvailableInformation
ExpressedInformation
AppliedInformation
```

Each node contains weighted information sets.

---

## 4. Processing Pipeline

### Step 1: Context Binding
- Receive ASO evaluation output
- Bind structural context to IAT signal

### Step 2: Transition Evaluation
- Compute possible state transitions
- Apply probability weights
- Evaluate trigger conditions

### Step 3: State Update
- Apply validated transitions
- Maintain trace history of movement

### Step 4: Output Emission
- Emit updated accessibility state delta

---

## 5. Transition Rules

### Allowed transitions:

- Latent → Accessible
- Accessible → Conscious
- Conscious → Expressed
- Expressed → Applied

### Constraint:

No reverse transitions unless explicitly triggered by corrective events.

---

## 6. Probability Model

Transitions are computed using weighted factors:

- cognitive load
- attention allocation
- emotional salience
- environmental cues
- prior activation frequency

Output:

```
P(transition)
```

---

## 7. Failure Handling

- Invalid signal → ignore with log
- Missing context → degrade probability model
- Conflicting signals → resolve via weighted merge

All failures MUST be recorded as events.

---

## 8. Design Constraint

The IAT Engine is stateful but not persistent.

Persistence is handled externally by:

- Instrumentation Layer
- Registry Service
- Simulation Engine

---

## 9. System Principle

> The IAT Engine does not determine meaning. It determines accessibility dynamics of information within a system.