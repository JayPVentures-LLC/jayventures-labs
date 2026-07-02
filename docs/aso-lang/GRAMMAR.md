# ASO-Lang Grammar v0.1

## Purpose

Grammar rules define legal statement forms for controlled research documentation.

## Basic syntax

```text
Subject RELATIONSHIP_VERB Object
```

Examples:

```text
System HAS State
Process CHANGES State
Feedback MODIFIES Process
Biology IMPLEMENTS Persistence
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

```text
InputConcept + InputConcept DERIVES DerivedConcept
```

Example:

```text
Difference + Interaction + OrderedChange DERIVES Information
```

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
