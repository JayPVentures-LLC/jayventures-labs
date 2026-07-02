# ASO-Lang v0.1

## Subtitle

A Controlled Formal Language for Adaptive Systems Ontology and Companion Research Frameworks

## Status

Draft. Experimental. Not a mathematical proof system yet.

## Purpose

ASO-Lang creates a stable research language before formal mathematics, simulations, or measurements are introduced.

It defines:

- vocabulary;
- symbols;
- statement grammar;
- relationship verbs;
- namespaces;
- type rules;
- inference rules.

## Design principles

### Unambiguous terms

Every canonical term should have one approved meaning inside a given version.

### Layer separation

Ontology, implementation, measurement, theorem, hypothesis, and simulation statements must be distinguishable.

### Function before mechanism

ASO-Lang describes adaptive functions independently from domain-specific mechanisms.

### Explicit relationships

Terms must not be connected by vague language when a relationship verb is available.

### Reviewable claims

Every ASO-Lang statement should be classifiable as definition, derivation, theorem, hypothesis, measurement, implementation, or observation.

## Core types

For the authoritative type set and type rules, see `TYPE_SYSTEM.md`. The table below is an abbreviated overview.

| Type | Meaning |
| Primitive | Candidate irreducible concept. |
| Function | Derived universal function. |
| State | Condition at a point in sequence. |
| Process | Ordered transformation. |
| Transition | Movement between states. |
| Property | Attribute or measurable characteristic. |
| Phenomenon | Reported or observed experience/appearance (often human-facing); may be tracked via observations and measurements. |
| Mechanism | Domain-specific implementation. |
| Measurement | Operational construct. |
| Theorem | Logical claim. |
| Hypothesis | Empirical claim. |
| Observation | Recorded event or case. |
| Decision | Accepted, rejected, deferred, or superseded research choice. |
## Legal statement pattern

Basic statement:

```text
[Subject] [RELATIONSHIP_VERB] [Object]
```

Examples:

```text
System HAS State
Process CHANGES State
Feedback MODIFIES Process
Representation MODELS System
Biology IMPLEMENTS Persistence
```

## Illegal statement pattern

Statements are invalid when they collapse layers without a relationship.

Invalid:

```text
Information IS Process
Biology IS Adaptation
Reflection CAUSES Existence
```

Reason:

These statements confuse type, function, and mechanism.

## Canonical relationship classes

- structural
- derivational
- transformational
- representational
- implementation
- measurement
- evidentiary
- temporal

## Core controlled sentence forms

### Definition form

```text
TERM := definition
```

### Derivation form

```text
A DERIVES B
```

### Implementation form

```text
DOMAIN.MECHANISM IMPLEMENTS ASO.FUNCTION
```

### Measurement form

```text
MEASURE OPERATIONALIZES CONSTRUCT
```

### Hypothesis form

```text
IF condition THEN expected_observation
```

### Theorem form

```text
GIVEN definitions, CLAIM follows
```

## Version rule

A term definition may not change inside a major version without a decision log entry.

## Current maturity

ASO-Lang v0.1 is sufficient for controlled documentation.

It is not yet sufficient for automated theorem proving, formal verification, or simulation execution.
