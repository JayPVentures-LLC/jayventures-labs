# Cross-Phenomenon Causal Anomaly Registry

A jaypVLabs research subsystem for preserving and testing observations that appear inconsistent with ordinary information flow or causal ordering.

The registry is deliberately mechanism-neutral. A case may involve memory, record integrity, experimental error, unknown conventional mechanisms, retrocausal information, nonlocal information, persistence claims, history divergence, temporal displacement, or another explanation. `UNRESOLVED` is a valid scientific outcome.

## Diagnostic order

`WITNESS -> RECORD -> EXPERIMENT -> MODEL -> CAUSAL MODEL`

A later category is not promoted merely because an earlier explanation has not yet been found.

## Status ladder

`CAR-0 RECEIVED -> CAR-1 PRESERVED -> CAR-2 AUTHENTICATED -> CAR-3 ANOMALOUS -> CAR-4 CONVENTIONAL AUDIT CLOSED -> CAR-5 REPLICATED -> CAR-6 CAUSAL-MODEL INCONSISTENCY -> CAR-7 PROSPECTIVELY PREDICTIVE -> CAR-8 MECHANISM -> CAR-9 EXTERNALLY CONFIRMED NEW-PHYSICS FINDING`

CAR-9 is intentionally manual and externally grounded. The registry cannot manufacture scientific consensus.

## Verification

```bash
node --test tests/causal-anomaly-registry.test.mjs
node research/causal-anomaly-registry/cli/verify-case.mjs research/causal-anomaly-registry/examples/example-case.json
```

The CLI validates the record, recomputes evidence-quality and contamination scores, evaluates promotion eligibility, and emits a JSON receipt.

## Research integrity

Preserve misses, failed replications, contradictory assertions, ordinary explanations, protocol deviations, and negative controls. Do not infer wrongdoing by identifiable people from anomaly data. Human-subject collection requires appropriate independent ethics review before execution.
