# Canonical Extraordinary Claims Evidence Architecture

## Purpose

Extend the existing jaypVLabs Causal Anomaly Registry into the canonical JPV evidence architecture for anomalous, extraordinary, temporally displaced, historically discontinuous, scientifically surprising, or otherwise high-claim-burden assertions.

The architecture must not create a parallel research system. It ratchets the existing CAR-0 through CAR-9 registry forward while preserving compatibility with existing cases and verification tooling.

## Authority and routing

jaypVLabs owns research intake, falsification, provenance, replication, null-model analysis, prospective experiments, and evidence promotion.

JayPVentures LLC governance owns policy recognition, routing requirements, and enterprise-level evidence standards. Governance must reference the Labs registry as the canonical extraordinary-claims research route rather than duplicating scientific logic.

JPV-OS may consume registry outputs for routing and operational decisions, but it must not independently promote an extraordinary claim beyond the Labs evidence state.

## Scope

The canonical architecture applies to all extraordinary or anomalous claims, including but not limited to:

- retrocausal or future-information claims;
- nonlocal information or state-inconsistency claims;
- temporal displacement or causal-loop claims;
- historical technology discontinuities;
- apparently premature scientific or mathematical information;
- undocumented transmission candidates;
- purported prophecies, predictions, linguistic coincidences, or future-specific terminology;
- out-of-place artifacts or disputed historical functions;
- unexplained experimental results that would materially conflict with established models;
- extraordinary persistence, continuity, or survival claims;
- any claim for which the extraordinary interpretation materially exceeds ordinary evidentiary burden.

Ordinary, disproven, contaminated, mistranslated, coincidental, or fully explained cases remain in the registry as negative controls.

## Evidence architecture

The existing CAR status ladder remains canonical and monotonic:

`CAR-0 RECEIVED -> CAR-1 PRESERVED -> CAR-2 AUTHENTICATED -> CAR-3 ANOMALOUS -> CAR-4 CONVENTIONAL AUDIT CLOSED -> CAR-5 REPLICATED -> CAR-6 CAUSAL-MODEL INCONSISTENCY -> CAR-7 PROSPECTIVELY PREDICTIVE -> CAR-8 MECHANISM -> CAR-9 EXTERNALLY CONFIRMED NEW-PHYSICS FINDING`

No status may be skipped. Failure to find an ordinary explanation does not itself justify an extraordinary interpretation.

## Required ordinary-explanation families

The conventional audit must explicitly test, when applicable:

- witness or memory error;
- leakage;
- fraud or fabrication;
- record or archive error;
- timestamp or dating error;
- software or instrumentation failure;
- statistical error;
- social contamination;
- conventional physics;
- lost or discontinuous knowledge;
- undocumented transmission;
- independent discovery or convergent invention;
- linguistic collision, abbreviation collision, or translation drift;
- multiple-comparison or corpus-scale coincidence effects.

Each family must be `EXPLAINED`, `UNSUPPORTED`, `INCONCLUSIVE`, `FAILED_TO_EXPLAIN`, or `NOT_APPLICABLE`. CAR-4 remains fail-closed.

## Provenance requirements

Cases may record a provenance profile containing:

- earliest secure date;
- independent date anchors;
- whether the source could have been edited after that date;
- independent pre-event attestations;
- original-language stability and translation review;
- chain-of-custody or archaeological-context notes;
- contamination risks;
- provenance confidence.

Digital timestamps, screenshots, catalog dates, or platform metadata are not dispositive by themselves when edits or backdating remain possible.

## Information-anomaly requirements

Cases involving alleged information before its time may record an information-anomaly profile containing:

- future exclusivity;
- specificity;
- entropy bits;
- preregistration state;
- independent pre-event attestations;
- repeatability;
- null-model identifier;
- multiplicity-adjusted probability where calculable.

Short phrases, vague prophecies, flexible translations, and retrospective semantic matches are low-information evidence unless surrounding context supplies future-only specificity.

## Null models and base rates

The registry must support explicit null-model records for coincidence and prediction analysis. A null model may record trial count, per-trial probability, family-wise probability, multiplicity correction, corpus size, assumptions, and calculation notes.

A claim must not be promoted because an isolated match feels improbable when the search space or number of opportunities has not been quantified.

## Prospective evidence

Prospective, preregistered evidence has materially higher diagnostic value than retrospective pattern matching.

CAR-7 remains restricted to high-entropy, precommitted, exact-match prospective predictions meeting the canonical promotion policy. The policy's minimum entropy, timestamp-authority, ordering, and exact-match gates remain the single source of truth.

Future-randomness experiments must record protocol hashes, target-generation time, commitment time, commitment verification, randomness source, analysis-code hash when applicable, null probability, misses, and all trials.

## Evidence levels

The registry recognizes an evidence ladder for triage and communication:

- `E0`: anecdote or derivative claim;
- `E1`: authentic-looking object or document requiring provenance work;
- `E2`: securely dated/authenticated primary evidence;
- `E3`: technically anomalous but still period-plausible or conventionally reproducible evidence;
- `E4`: candidate future-only or otherwise extraordinary information with strong provenance and independent corroboration;
- `E5`: preregistered, cryptographically or independently committed, prospectively replicated evidence capable of supporting new-physics investigation.

Evidence levels are not probabilities that an extraordinary claim is true and do not replace CAR promotion gates.

## Runtime behavior

The dependency-free Node runtime must expose deterministic helpers to:

- validate the extended case contract;
- compute evidence quality;
- compute contamination;
- compute a null-model family-wise probability for exact independent matches;
- classify an evidence level from provenance and information-anomaly fields;
- evaluate CAR promotion using the promotion policy.

The runtime must preserve backwards compatibility for existing cases that omit the new optional fields.

## Safety and epistemic integrity

The system must preserve misses, failed replications, ordinary explanations, contradictory evidence, translation uncertainty, provenance weaknesses, and null-model assumptions.

It must not infer misconduct by identifiable people from anomaly data. Human-subject collection requires appropriate independent ethics review.

## Acceptance criteria

- Existing example cases continue to validate.
- Existing CAR promotion behavior remains monotonic and fail-closed.
- New falsification families are policy-driven and enforced at CAR-4.
- Provenance, information-anomaly, null-model, and evidence-level fields validate deterministically.
- Null-model exact-match family-wise probability is deterministic and tested.
- Evidence-level classification is deterministic and tested.
- A short retrospective phrase with weak specificity cannot be classified above E2/E3 merely because it resembles a later term.
- A secure, future-only, independently attested, preregistered high-entropy record can classify E4/E5 when the required fields are present.
- Governance documentation explicitly routes extraordinary-claim investigation to the Labs registry and forbids parallel promotion logic.
