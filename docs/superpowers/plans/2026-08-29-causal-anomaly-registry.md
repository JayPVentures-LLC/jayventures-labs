# Causal Anomaly Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic, auditable causal-anomaly research registry with evidence scoring, falsification gates, prospective-prediction gates, and verification receipts.

**Architecture:** A dependency-free Node runtime under `research/causal-anomaly-registry/` interprets JSON case records and a canonical JSON promotion policy. Protocol and schema files are declarative; tests use Node's built-in test runner so verification does not depend on application runtime packages.

**Tech Stack:** Node.js ES modules, JSON Schema 2020-12 as the normative data contract, YAML protocol specifications, Node `node:test`.

**Spec:** `docs/superpowers/specs/2026-08-29-causal-anomaly-registry-design.md`

## Global Constraints

- Extraordinary interpretation is never inferred solely from failure to find a conventional explanation.
- Promotion is monotonic and fail-closed.
- Promotion thresholds live only in `policy/promotion-policy.v1.json`.
- Contradictory assertions and failed replications remain preserved.
- CAR-9 requires explicit external confirmation and manual governed review.
- Runtime verification must work without new third-party dependencies.

---

### Task 1: Runtime contract and evidence math

**Files:**
- Create: `tests/causal-anomaly-registry.test.mjs`
- Create: `research/causal-anomaly-registry/runtime/index.mjs`
- Create: `research/causal-anomaly-registry/policy/promotion-policy.v1.json`

**Interfaces:**
- Produces: `validateCase(caseRecord)`, `computeEvidenceQuality(scores)`, `computeContamination(pathwayProbabilities)`, `evaluatePromotion(caseRecord, policy)`.

- [ ] Write tests for required fields, evidence quality, contamination, and fail-closed promotion.
- [ ] Run `node --test tests/causal-anomaly-registry.test.mjs` and confirm RED because the runtime module does not exist.
- [ ] Implement the four exported runtime functions and policy interpretation.
- [ ] Re-run the test and confirm GREEN.

### Task 2: Canonical data and protocol package

**Files:**
- Create: `research/causal-anomaly-registry/schemas/case.schema.json`
- Create: `research/causal-anomaly-registry/protocols/future-information-protocol.yaml`
- Create: `research/causal-anomaly-registry/protocols/human-anomaly-prospective-registry.yaml`
- Create: `research/causal-anomaly-registry/protocols/consciousness-boundary-protocol.yaml`
- Create: `research/causal-anomaly-registry/protocols/state-anchor-network.yaml`
- Create: `research/causal-anomaly-registry/examples/example-case.json`
- Create: `research/causal-anomaly-registry/README.md`

**Interfaces:**
- Consumes: runtime contract from Task 1.
- Produces: canonical schema, protocols, and valid example case.

- [ ] Extend tests to load the example and assert it validates.
- [ ] Run the test and confirm RED while files are absent.
- [ ] Add the canonical schema, protocols, README, and example.
- [ ] Re-run the test and confirm GREEN.

### Task 3: Verification CLI and durable receipt

**Files:**
- Create: `research/causal-anomaly-registry/cli/verify-case.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `validateCase`, `computeEvidenceQuality`, `computeContamination`, `evaluatePromotion`.
- Produces: `npm run causal:registry:test` and `npm run causal:registry:verify`.

- [ ] Add a test invoking the CLI against the example and checking receipt fields.
- [ ] Run the test and confirm RED while CLI is absent.
- [ ] Implement CLI and package scripts.
- [ ] Run `node --test tests/causal-anomaly-registry.test.mjs` and the CLI directly; confirm GREEN/PASS.
