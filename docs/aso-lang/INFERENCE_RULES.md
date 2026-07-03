# ASO-Lang Inference Rules v0.1

## Purpose

Inference rules define first-pass reasoning patterns permitted in ASO-Lang.

These are draft rules for documentation consistency, not a complete formal logic.

## Rule 1 — Derivation transitivity

If:

```text
A DERIVES B
B DERIVES C
```

Then:

A contributes to the derivation of C.

Do not state `A DERIVES C` directly unless intermediate dependencies are preserved or summarized.

## Rule 2 — Requirement inheritance

If:

```text
B REQUIRES A
C REQUIRES B
```

Then:

```text
C REQUIRES A
```

Example:

If Feedback requires Ordered Change, and Adaptation requires Feedback, then Adaptation requires Ordered Change.

## Rule 3 — Implementation separation

If:

```text
Domain.Mechanism IMPLEMENTS Function
```

It does not follow that:

```text
Domain.Mechanism IS Function
```

Mechanism and function remain separate.

## Rule 4 — Evidence is not proof

If:

```text
Observation EVIDENCES Hypothesis
```

It does not follow that the hypothesis is proven.

Evidence updates status only through validation standards.

## Rule 5 — Similarity is not equivalence

If two domain mechanisms implement the same function, they are comparable by function but not identical by mechanism.

## Rule 6 — Accessibility distinction

If information is represented, it does not follow that it is accessible.

If information is accessible, it does not follow that it is explainable.

## Rule 7 — Response/adaptation distinction

If a system responds to information, it does not follow that it adapts.

Adaptation requires future response-rule modification.

## Rule 8 — Unknown is not explanation

If a mechanism is unknown, no specific explanation is implied.

Unknown status permits competing hypotheses, not conclusion selection.

## Rule 9 — Human-use caution

If a human-related construct is defined, it does not follow that it may be used for diagnosis, accusation, employment, punishment, or rights restriction.

Human use requires separate ethical and empirical validation.

## Rule 10 — Version stability

If a term is registered in a version, its meaning cannot change silently.

Changes require decision log and migration note.
