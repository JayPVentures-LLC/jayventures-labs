# Causal Anomaly Registry Design

## Purpose

Establish a jaypVLabs research subsystem for cross-phenomenon causal-anomaly intake, evidence preservation, falsification, replication, and escalation without treating unexplained observations as proof of extraordinary causality.

## Scope

The subsystem covers claims involving apparent retrocausal information, nonlocal information, survival/persistence claims, history divergence, temporal displacement, causal loops, and independently authenticated state inconsistency. It also stores ordinary and disproven cases as negative controls.

The subsystem does not assert that time travel, reincarnation, timeline editing, post-biological consciousness, or nonlocal information transfer exists. Its function is to preserve observations and apply deterministic evidence gates.

## Architecture

`research/causal-anomaly-registry/` owns the research data contract, promotion policy, protocols, examples, and a dependency-free Node runtime. `tests/causal-anomaly-registry.test.mjs` tests the canonical runtime. The promotion policy is the single source of truth for status-gate parameters; runtime code interprets that policy and does not duplicate its thresholds.

Case state advances through CAR-0 to CAR-9. Promotion is monotonic and fail-closed. A case can remain unresolved indefinitely. Extraordinary interpretation is never inferred solely from the absence of a conventional explanation.

## Core objects

A case contains atomic claims, immutable evidence descriptors, sources, assertions, experiments, prospective predictions, replications, falsification records, contamination inputs, evidence scores, a disposition, and optional mechanism/external-confirmation records.

Raw contradictory assertions are preserved independently. Derived disposition never overwrites source assertions.

## Evidence integrity

Evidence descriptors include SHA-256, acquisition/observation timestamps, source, signature state, independent timestamp authorities, and transformation history. Original bytes remain outside the registry when necessary; the registry records immutable identity and custody metadata.

## Falsification

The canonical falsification families are witness, memory, leakage, fraud, record, timestamp, software, instrumentation, statistics, social contamination, and conventional physics. `NOT_APPLICABLE` is an explicit disposition and must be justified in notes.

## Promotion semantics

- CAR-0: received.
- CAR-1: preserved evidence exists and the case contract validates.
- CAR-2: evidence provenance is authenticated by valid signature or independent timestamp authority, with no invalid signature.
- CAR-3: an anomaly claim is recorded and ordinary explanation is not marked sufficient.
- CAR-4: all policy-required falsification families are closed as `FAILED_TO_EXPLAIN` or `NOT_APPLICABLE` and none is `EXPLAINED`.
- CAR-5: policy-minimum independent PASS replications exist.
- CAR-6: a causal signature is present and evidence/discriminatory thresholds pass.
- CAR-7: a preregistered high-entropy prospective prediction meets commitment, ordering, timestamp, and exact-match requirements.
- CAR-8: a reproducible mechanism record exists and independent replications pass.
- CAR-9: never automatic; requires explicit external-confirmation evidence meeting policy thresholds and a human-governed review flag.

## Scoring

Eight 0-5 evidence dimensions produce evidence quality as their arithmetic mean divided by 5. Contamination is combined as `1 - product(1 - c_i)` from explicit pathway probabilities. These are evidence-quality metrics, not probabilities that an extraordinary hypothesis is true.

## Protocols

Four baseline protocols are preserved: Future Information Protocol, Independent State Anchor Network, Human Anomaly Prospective Registry, and Consciousness Boundary Protocol. Protocol documents must distinguish observation from interpretation and require prospective capture where applicable.

## CLI and receipts

`cli/verify-case.mjs` validates a case, computes scores, evaluates every promotion gate, and emits deterministic JSON to stdout or a receipt file. A failing contract exits non-zero. A valid unresolved case is a successful verification result even if it cannot advance.

## Safety and epistemic integrity

The registry must preserve ordinary explanations, failed replications, misses, contradiction, and exculpatory evidence. It must not generate accusations about identifiable people from anomaly data. Human-subject studies require independent ethics/IRB review where applicable before collection.

## Acceptance criteria

The checked-in example validates; score and contamination calculations are deterministic; promotion gates fail closed; CAR-9 cannot be reached without explicit external confirmation and manual review; CLI emits a durable receipt; tests exercise validation, scoring, contamination, and promotion; repository scripts expose a single command for verification.
