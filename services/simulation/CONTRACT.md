# Simulation Engine Contract v0.1

## Purpose

Defines the interface contract for the Simulation & Validation Engine.

This engine replays system behavior, executes counterfactuals, and validates predictive consistency of ASO/IAT outputs.

---

## 1. Responsibility

The Simulation Engine is responsible for:

- Replaying historical instrumentation logs
- Constructing counterfactual execution paths
- Validating ASO/IAT model predictions
- Computing system stability metrics

It does NOT:

- mutate live system state
- perform real-time execution
- modify registry directly

---

## 2. Input Contract

Simulation input MUST include:

```
SimulationRequest {
  simulation_id: string
  mode: "replay | counterfactual | validation"
  event_trace: object[]
  hypothesis_set: object[]
  registry_snapshot: object
  parameters: object
}
```

---

## 3. Simulation Pipeline

### Step 1: Trace Reconstruction
- Load ordered event log
- Validate trace integrity
- Rebuild system state timeline

### Step 2: Execution Replay
- Re-run ASO evaluation logic
- Re-run IAT transition engine
- Reapply instrumentation rules

### Step 3: Counterfactual Branching (optional)
- Inject modified parameters
- Recompute transition probabilities
- Generate alternate state paths

### Step 4: Comparison Layer
- Compare predicted vs observed outcomes
- Detect deviation patterns

---

## 4. Validation Engine

Validation is a sub-mode of simulation.

### Validation Steps:

- Bind hypothesis to observed events
- Compute prediction accuracy
- Evaluate structural consistency

Outputs:

- match
- partial match
- mismatch
- insufficient data

---

## 5. Scoring Model

System stability score is computed as:

- structural consistency
- predictive alignment
- transition accuracy
- measurement repeatability

Output range:

```
0.0 → unstable model
1.0 → fully consistent model
```

---

## 6. Failure Handling

Simulation failures include:

- missing event traces
- inconsistent registry snapshots
- invalid hypothesis bindings
- transition divergence errors

All failures MUST be logged and classified.

---

## 7. Constraint Model

Simulation Engine is strictly read-only.

It cannot modify:

- runtime state
- registry data
- instrumentation logs

All outputs are derived artifacts only.

---

## 8. System Principle

> The Simulation Engine does not change the system. It tests whether the system can consistently reconstruct its own behavior under replay and alternative conditions.