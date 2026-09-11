# Canonical Extraordinary Claims Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing Causal Anomaly Registry into JPV's canonical evidence architecture for all extraordinary/anomalous claims while preserving CAR compatibility and fail-closed promotion.

**Architecture:** Keep `research/causal-anomaly-registry/` as the sole Labs evidence subsystem. Extend its schema, policy, runtime, tests, README, and protocols; then make enterprise governance route extraordinary claims into that subsystem rather than reimplementing scientific logic.

**Tech Stack:** Dependency-free Node.js ES modules, JSON Schema 2020-12, JSON policy, Markdown/YAML protocols, node:test.

**Spec:** `docs/superpowers/specs/2026-09-11-canonical-extraordinary-claims-evidence-design.md`

## Global Constraints

- Preserve CAR-0 through CAR-9 status names and monotonic promotion semantics.
- Preserve backwards compatibility for existing cases omitting new optional fields.
- Promotion thresholds remain policy-driven; runtime must not duplicate policy constants.
- Extraordinary interpretation is never inferred solely from lack of a conventional explanation.
- No new third-party runtime dependencies.
- CAR-9 remains manual and externally grounded.
- Governance references Labs as the canonical scientific evidence route and must not duplicate promotion logic.

---

### Task 1: Extend policy and contract

**Files:**
- Modify: `research/causal-anomaly-registry/policy/promotion-policy.v1.json`
- Modify: `research/causal-anomaly-registry/schemas/case.schema.json`
- Test: `tests/causal-anomaly-registry.test.mjs`

**Interfaces:**
- Consumes: existing CAR policy and case contract.
- Produces: policy-defined expanded falsification families, evidence levels, optional `provenance`, `information_anomaly`, and `null_model` objects.

- [ ] Add failing tests asserting the expanded falsification families exist and extended case fields validate.
- [ ] Run `node --test tests/causal-anomaly-registry.test.mjs` and verify the new assertions fail against the current policy/runtime.
- [ ] Add `LOST_KNOWLEDGE`, `UNDOCUMENTED_TRANSMISSION`, `INDEPENDENT_DISCOVERY`, `LINGUISTIC_COLLISION`, and `MULTIPLE_COMPARISONS` to policy-required falsification families.
- [ ] Add policy evidence levels `E0` through `E5` with deterministic classification thresholds.
- [ ] Extend the schema with optional provenance, information-anomaly, and null-model records plus the new falsification enums.
- [ ] Run the test file and verify existing and new contract tests pass.

### Task 2: Add deterministic null-model and evidence-level runtime

**Files:**
- Modify: `research/causal-anomaly-registry/runtime/index.mjs`
- Test: `tests/causal-anomaly-registry.test.mjs`

**Interfaces:**
- Produces: `computeFamilywiseExactMatchProbability(trials, entropyBits)` and `classifyEvidenceLevel(record, policy)`.

- [ ] Add failing tests for a 64-trial/32-bit exact-match family-wise probability and evidence-level classification of weak retrospective vs. strong prospective records.
- [ ] Run the test file and confirm failures are caused by missing exports/behavior.
- [ ] Implement `computeFamilywiseExactMatchProbability` using `1 - (1 - 2^-b)^n`, with input validation and a numerically stable approximation for extremely small probabilities.
- [ ] Implement deterministic evidence-level classification driven by policy criteria, never by free-text interpretation.
- [ ] Extend `validateCase` to validate optional extended objects without requiring them for legacy cases.
- [ ] Run the complete registry tests and verify zero failures.

### Task 3: Encode canonical research protocol and negative controls

**Files:**
- Create: `research/causal-anomaly-registry/protocols/extraordinary-claim-evidence-standard.md`
- Modify: `research/causal-anomaly-registry/README.md`

**Interfaces:**
- Consumes: extended policy/runtime.
- Produces: canonical intake/provenance/context/null-model/falsification/replication/escalation procedure.

- [ ] Document the intake sequence: exact claim -> provenance -> context -> ordinary hypotheses -> null/base-rate model -> replication -> CAR escalation.
- [ ] Encode explicit historical controls: lost knowledge, undocumented transmission, convergent discovery, linguistic collision/translation drift, corpus-scale coincidence.
- [ ] Document evidence levels E0-E5 and clarify that they are communication/triage levels, not probabilities of truth.
- [ ] Update README scope from cross-phenomenon causal anomalies to canonical extraordinary/anomalous claims while retaining mechanism neutrality.

### Task 4: Add canonical examples for information-before-time analysis

**Files:**
- Create: `research/causal-anomaly-registry/examples/retrospective-linguistic-coincidence.json`
- Create: `research/causal-anomaly-registry/examples/prospective-future-information.json`
- Test: `tests/causal-anomaly-registry.test.mjs`

**Interfaces:**
- Produces: one low-information negative control and one high-information prospective contract example.

- [ ] Add tests that both examples validate.
- [ ] Assert the retrospective linguistic coincidence cannot classify above E2/E3.
- [ ] Assert the prospective example reaches E4/E5 classification only when provenance/preregistration/entropy/corroboration fields satisfy policy.
- [ ] Run tests and verify pass.

### Task 5: Wire enterprise governance routing

**Files in `JayPVentures-LLC/jpv-governance`:**
- Modify: `docs/standards/jpv-evidence-principle.md`
- Create: `docs/standards/canonical-extraordinary-claims-evidence-routing.md`

**Interfaces:**
- Consumes: Labs CAR architecture.
- Produces: enterprise rule that extraordinary claims route to Labs and governance may not invent parallel scientific promotion semantics.

- [ ] Add the routing standard naming `JayPVentures-LLC/jayventures-labs/research/causal-anomaly-registry/` as canonical.
- [ ] Require observation/inference/hypothesis/conclusion separation before CAR intake.
- [ ] Require ordinary explanations and provenance defects to remain visible after routing.
- [ ] Prohibit governance/AI/operations layers from representing a claim as scientifically established beyond its CAR status.
- [ ] Add a cross-reference from the existing JPV Evidence Principle.

### Task 6: Verify and open PRs

**Files:** all files above.

- [ ] Run `node --test tests/causal-anomaly-registry.test.mjs` from a reconstructed isolated local copy and verify zero failures.
- [ ] Compare feature branches against `main` and inspect every changed file.
- [ ] Open a Labs PR describing compatibility, new gates, tests, and governance dependency.
- [ ] Open a governance PR describing canonical routing and non-duplication.
- [ ] Enable auto-merge only if repository policy permits and all required external checks/reviews are satisfied; otherwise leave the PRs review-ready without bypassing governance.
