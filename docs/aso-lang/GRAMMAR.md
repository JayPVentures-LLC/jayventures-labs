# ASO-Lang Grammar v0.1

## Purpose

Grammar rules define legal statement forms for controlled research documentation.

## Basic syntax

In formal statements, multi-word canonical terms should be written as a single token (e.g., `OrderedChange`, `LatentInformation`) to avoid whitespace ambiguity.

    Subject RELATIONSHIP_VERB Object

Examples:

```text
System HAS State
Process CHANGES State
Feedback MODIFIES Process
Biology.Homeostasis IMPLEMENTS Persistence
```

## Definition syntax

```text
Term := Definition
```

Example:

```text
Adaptation := Feedback changing future response rules.
```

## Derivation syntax

    InputConcept + InputConcept DERIVES DerivedConcept

Note: In ASO-Lang statements, multi-word vocabulary terms are written as single PascalCase tokens (e.g., `OrderedChange` corresponds to the vocabulary term `OrderedChange`).

Example:

    Difference + Interaction + OrderedChange DERIVES Information
## Implementation syntax

```text
Domain.Mechanism IMPLEMENTS ASO.Function
```

Examples:

```text
Biology.DNA IMPLEMENTS Representation
Organization.Audit IMPLEMENTS Feedback
AI.WeightUpdate IMPLEMENTS Adaptation
```

## Measurement syntax

```text
Measure OPERATIONALIZES Construct
```

Example:

```text
FeedbackDelayScore OPERATIONALIZES FeedbackDelay
```

## Hypothesis syntax

```text
IF Condition THEN ExpectedObservation
```

Example:

```text
IF FeedbackDelay increases THEN AdaptiveInstability increases
```

## Invalid forms

### Type collapse

Invalid:

```text
Biology IS Adaptation
```

Valid:

```text
Biology.Mechanism IMPLEMENTS Adaptation
```

### Vague relation

Invalid:

```text
Information relates to Process
```

Valid:

```text
Information MODIFIES Process
```

or

```text
Process GENERATES Information
```

### Circular derivation without note

Invalid:

```text
Information DERIVES Difference
Difference DERIVES Information
```

Valid only if a circular dependency is explicitly proposed and reviewed.

## Statement classification

Every technical statement should be classifiable as one of:

- Definition
- Derivation
- Implementation
- Measurement
- Theorem
- Hypothesis
- Observation
- Decision
