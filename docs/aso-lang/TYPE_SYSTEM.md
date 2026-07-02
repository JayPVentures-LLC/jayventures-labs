# ASO-Lang Type System v0.1

## Purpose

The type system prevents category errors.

## Core types

| Type | Description |
|---|---|
| Primitive | Candidate irreducible concept. |
| Function | Derived universal function. |
| State | Condition at a point in sequence. |
| Process | Ordered transformation. |
| Transition | Movement between states. |
| Property | Attribute or measurable characteristic. |
| Phenomenon | Reported or observed experience/appearance (often human-facing); may be tracked via observations and measurements. |
| Mechanism | Domain-specific implementation. |
| Measurement | Operational construct or scoring method. |
| Theorem | Logical claim. |
| Hypothesis | Empirical claim. |
| Observation | Recorded event. |
| Decision | Accepted, rejected, deferred, or superseded research choice. |

## Type rules

### Rule 1

A mechanism may IMPLEMENT a function, but it is not identical to the function.

### Rule 2

A measurement may OPERATIONALIZE a construct, but it is not identical to the construct.

### Rule 3

An observation may EVIDENCE a hypothesis, but it does not prove the hypothesis.

### Rule 4

A theorem is evaluated by logical derivation.

A hypothesis is evaluated by evidence.

### Rule 5

A state may TRANSITIONS_TO another state.

A state should not be described as MODIFYING a process unless a mechanism is specified.

## Example type-safe statements

```text
AI.WeightUpdate IMPLEMENTS Adaptation
FeedbackDelayScore OPERATIONALIZES FeedbackDelay
CaseLog EVIDENCES IAT-HYP-0001
LatentInformation TRANSITIONS_TO AccessibleInformation
```

## Example type errors

```text
AI.WeightUpdate IS Adaptation
FeedbackDelayScore IS FeedbackDelay
CaseLog PROVES IAT-HYP-0001
LatentInformation MODIFIES Process
```
