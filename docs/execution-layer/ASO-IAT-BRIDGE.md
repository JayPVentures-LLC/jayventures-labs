# ASO-IAT Bridge Layer v0.1

## Purpose

Defines the formal connection between:

- ASO (structure, process, adaptation, information)
- IAT (accessibility states and transitions)

This is the execution interface between system ontology and cognitive accessibility behavior.

---

## 1. Mapping Principle

ASO defines what exists and how systems function.

IAT defines when information becomes usable.

Bridge rule:

> ASO structures generate constraints; IAT governs accessibility of those constraints.

---

## 2. Core Mapping Table

| ASO Concept | IAT Equivalent |
|---|---|
| Information | LatentInformation / AccessibleInformation |
| Representation | LatentInformation carrier |
| Feedback | Transition trigger |
| State | Accessibility condition snapshot |
| Process | Transition pathway generator |
| Adaptation | Stable shift in transition probabilities |

---

## 3. Execution Semantics Link

From ASO Execution Layer:

```text
Measurement → produces signal
Signal → evaluated as accessibility event
Event → updates IAT state graph
```

---

## 4. Transition Binding Rules

Every ASO event must map to at least one IAT state transition:

- If feedback occurs → evaluate accessibility shift
- If observation occurs → classify state exposure
- If decision occurs → record conscious-to-applied transition

---

## 5. Intuition Binding Rule

Intuition is not treated as a source.

It is treated as:

> A high-probability latent-to-accessible transition with compressed pre-conscious processing.

No external mechanism assumption is required.

---

## 6. Deja Vu Binding Rule

Deja vu is treated as:

- accessibility activation without source resolution
- high familiarity signal without traceable representation path

It is not assigned a privileged causal model.

---

## 7. System Constraint Alignment

ASO constraints define:

- structure boundaries
- process rules
- adaptation logic

IAT determines:

- whether those constraints become usable
- when they become conscious
- when they affect behavior

---

## 8. Key Invariant

> Structure alone does not guarantee accessibility.
> Accessibility alone does not guarantee correctness.

---

## 9. Execution Outcome

This bridge enables:

- cross-layer logging
- measurable intuition tracking
- structured insight validation
- system-level cognition modeling

---

## 10. System Principle

> ASO defines the map. IAT defines when the map becomes visible to the traveler.