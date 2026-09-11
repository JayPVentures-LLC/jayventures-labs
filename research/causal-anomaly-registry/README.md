# Canonical Extraordinary Claims / Causal Anomaly Registry

A jaypVLabs research subsystem for preserving and testing anomalous or extraordinary claims across history, technology, information, causality, continuity, prediction, archaeology, physics, and other domains where the extraordinary interpretation materially exceeds ordinary evidentiary burden.

This registry is the canonical JPV research route for such claims. It is deliberately mechanism-neutral. A case may involve ordinary error, coincidence, lost knowledge, undocumented transmission, independent discovery, mistranslation, contamination, record failure, unknown conventional mechanisms, retrocausal information, nonlocal information, persistence claims, history divergence, temporal displacement, or another explanation. `UNRESOLVED` is a valid scientific outcome.

The registry retains the existing Causal Anomaly Registry (CAR) status ladder and runtime contract. The expanded scope is a forward ratchet, not a parallel subsystem.

## Diagnostic order

`OBSERVATION -> PROVENANCE -> CONTEXT -> ORDINARY HYPOTHESES -> NULL MODEL -> REPLICATION -> MODEL -> CAUSAL MODEL`

For causal cases, the original shorthand remains useful:

`WITNESS -> RECORD -> EXPERIMENT -> MODEL -> CAUSAL MODEL`

A later category is not promoted merely because an earlier explanation has not yet been found.

## Status ladder

`CAR-0 RECEIVED -> CAR-1 PRESERVED -> CAR-2 AUTHENTICATED -> CAR-3 ANOMALOUS -> CAR-4 CONVENTIONAL AUDIT CLOSED -> CAR-5 REPLICATED -> CAR-6 CAUSAL-MODEL INCONSISTENCY -> CAR-7 PROSPECTIVELY PREDICTIVE -> CAR-8 MECHANISM -> CAR-9 EXTERNALLY CONFIRMED NEW-PHYSICS FINDING`

CAR-9 is intentionally manual and externally grounded. The registry cannot manufacture scientific consensus.

## Expanded conventional audit

CAR-4 now requires the policy-defined audit to cover ordinary evidence failures plus historical and corpus-specific alternatives, including lost knowledge, undocumented transmission, independent discovery, linguistic collision/translation drift, and multiple-comparison effects. `NOT_APPLICABLE` is allowed only with explicit notes.

## Evidence levels

The registry also supports E0-E5 evidence labels for triage and communication:

- `E0`: anecdote or derivative claim.
- `E1`: authentic-looking object/document requiring provenance work.
- `E2`: securely dated/authenticated primary evidence.
- `E3`: technically anomalous or unusually specific but conventionally plausible evidence.
- `E4`: candidate future-only or otherwise extraordinary information with strong provenance, specificity, entropy, and independent corroboration.
- `E5`: preregistered, committed, high-entropy, prospectively replicated evidence with a very small null probability.

These labels are not probabilities that an extraordinary hypothesis is true and do not replace CAR promotion gates.

## Extended evidence records

Cases may optionally record:

- `provenance` for secure dating, independent anchors, editability, pre-event attestations, translation stability, custody, contamination risk, and provenance confidence;
- `information_anomaly` for future exclusivity, specificity, entropy, preregistration, corroboration, repeatability, and multiplicity-adjusted probability;
- `null_model` for trial count, per-trial probability, family-wise probability, corpus size, correction method, and assumptions.

Legacy cases that omit these fields remain valid.

## Verification

```bash
node --test tests/causal-anomaly-registry.test.mjs
node research/causal-anomaly-registry/cli/verify-case.mjs research/causal-anomaly-registry/examples/example-case.json
```

The CLI validates the record, recomputes evidence-quality and contamination scores, evaluates promotion eligibility, and emits a JSON receipt.

The runtime also exports:

- `computeFamilywiseExactMatchProbability(trials, entropyBits)`
- `classifyEvidenceLevel(record, policy)`

## Canonical protocol

See `protocols/extraordinary-claim-evidence-standard.md` for intake, provenance, historical controls, information-anomaly scoring, null models, and prospective experiment requirements.

## Research integrity

Preserve misses, failed replications, contradictory assertions, ordinary explanations, protocol deviations, negative controls, translation uncertainty, provenance weaknesses, and null-model assumptions. Do not infer wrongdoing by identifiable people from anomaly data. Human-subject collection requires appropriate independent ethics review before execution.

An unexplained observation may remain unexplained. Lack of a conventional explanation is never sufficient by itself to establish an extraordinary mechanism.
