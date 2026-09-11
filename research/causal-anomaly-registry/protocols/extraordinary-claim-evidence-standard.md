# Extraordinary Claim Evidence Standard

## Purpose

This is the canonical jaypVLabs procedure for any claim whose extraordinary interpretation materially exceeds ordinary evidentiary burden. It applies across history, technology, physics, information, continuity, causality, prediction, archaeology, and other anomalous domains.

The procedure is mechanism-neutral. Its job is to preserve evidence, test ordinary explanations aggressively, quantify uncertainty, and promote only what survives deterministic evidence gates.

## Intake order

1. Record the exact claim without embellishment.
2. Preserve the original object, document, post, measurement, or observation identity.
3. Record source, acquisition time, hashes, signatures, independent timestamp authorities, and transformation history where available.
4. Separate Observation, Inference, Hypothesis, and Conclusion.
5. Establish the earliest secure date rather than relying on a displayed or claimed date.
6. Record whether the source could have been edited, backdated, mistranslated, contaminated, or inserted later.
7. Reconstruct the contemporary capability, language, scientific knowledge, craft tradition, trade network, and information-access environment.
8. Test ordinary hypotheses and record each as a falsification family.
9. Quantify base rates and multiple-comparison exposure for coincidence or prediction claims.
10. Replicate or reconstruct the claimed capability using period-appropriate or protocol-appropriate methods.
11. Prefer prospective preregistered tests over retrospective pattern matching whenever the phenomenon permits it.
12. Evaluate CAR promotion only after the evidence record is complete enough for the requested gate.

## Mandatory ordinary-explanation families

The promotion policy is authoritative. When applicable, the audit must include:

- `WITNESS`
- `MEMORY`
- `LEAKAGE`
- `FRAUD`
- `RECORD`
- `TIMESTAMP`
- `SOFTWARE`
- `INSTRUMENTATION`
- `STATISTICS`
- `SOCIAL_CONTAMINATION`
- `CONVENTIONAL_PHYSICS`
- `LOST_KNOWLEDGE`
- `UNDOCUMENTED_TRANSMISSION`
- `INDEPENDENT_DISCOVERY`
- `LINGUISTIC_COLLISION`
- `MULTIPLE_COMPARISONS`

An ordinary explanation marked `EXPLAINED` blocks CAR-4. A family may be `NOT_APPLICABLE` only with explicit justification. Missing work remains open; absence of an explanation is not evidence for an extraordinary mechanism.

## Historical anomaly controls

### Lost or discontinuous knowledge

Test whether a sophisticated capability could have existed within contemporary materials, observation, mathematics, craft, or institutional practice but later disappeared because artifacts, specialists, texts, recipes, supply chains, or markets were lost.

### Undocumented transmission

Test whether information could have moved through trade, manuscripts, translation, migration, correspondence, espionage, scholarly travel, workshops, or oral transmission even when the exact route is no longer documented.

### Independent discovery

Test whether the result follows naturally from the problem constraints, available mathematics, repeated observation, or convergent engineering. Similarity is not evidence of hidden transmission or temporal leakage when the solution space is narrow.

### Linguistic collision and translation drift

Short phrases, abbreviations, names, and prophecies require original-language context. Determine whether later terminology is being projected backward, whether an abbreviation had a contemporary meaning, and whether translation choices introduce the apparent anomaly.

### Multiple comparisons

Estimate the number of opportunities for a match. Searching billions of posts, books, patents, names, dates, or predictions after an event creates many chances for a striking coincidence. A raw-looking match is not interpretable until the search space and matching rule are fixed.

## Provenance profile

Use the optional `provenance` record to preserve:

- `earliest_secure_date`
- `securely_dated`
- `independent_date_anchors`
- `editable_after_date`
- `independent_pre_event_attestations`
- `translation_stable`
- `chain_of_custody_notes`
- `contamination_risks`
- `provenance_confidence`

A screenshot or platform timestamp by itself is not treated as immutable provenance when edits or metadata rewriting remain possible.

## Information-anomaly profile

Use the optional `information_anomaly` record for alleged information that should not have existed at the origin time:

- `future_exclusivity`: 0–3
- `specificity`: 0–3
- `entropy_bits`
- `preregistered`
- `independent_pre_event_attestations`
- `repeatability`: 0–3
- `null_model_id`
- `multiplicity_adjusted_probability`

Future exclusivity asks whether a contemporary route could derive the information. Specificity asks how constrained the claim was before the target event. Entropy measures independent information content rather than emotional surprise.

## Null models

Use `null_model` to record the probability model rather than relying on intuition. For exact independent b-bit matches across n fixed trials, the canonical family-wise probability is:

`1 - (1 - 2^-b)^n`

The runtime helper `computeFamilywiseExactMatchProbability(trials, entropyBits)` implements this calculation deterministically.

For retrospective corpus searches, record corpus size, number of candidate targets, matching rule, language normalization, translation policy, and multiplicity correction. If these were not fixed before the search, the limitation must remain visible.

## Evidence levels

Evidence levels are communication and triage labels. They are not probabilities that an extraordinary hypothesis is true and they never replace CAR promotion.

- `E0`: anecdote or derivative claim.
- `E1`: authentic-looking object or document requiring provenance work.
- `E2`: securely dated/authenticated primary evidence.
- `E3`: technically anomalous or unusually specific evidence that remains compatible with conventional pathways.
- `E4`: candidate future-only or otherwise extraordinary information with strong provenance, specificity, entropy, and independent corroboration.
- `E5`: preregistered, committed, high-entropy, prospectively replicated evidence with an extremely small null probability.

`classifyEvidenceLevel(record, policy)` applies the policy deterministically.

## Prospective experiments

Prospective experiments must predefine:

- hypothesis;
- target-generation source and time;
- protocol hash;
- commitment mechanism;
- commitment time;
- independent timestamp authorities;
- primary endpoint;
- stopping rule;
- exclusions;
- analysis-code hash where applicable;
- trial count and null model;
- treatment of misses and failed replications.

All trials, misses, deviations, and negative controls are preserved.

CAR-7 remains stricter than an E5 communication label: the promotion policy controls minimum entropy, exact-match, timestamp-authority, and ordering requirements.

## Interpretation rule

A case may remain unresolved indefinitely.

`UNRESOLVED` is scientifically valid. JPV does not fill explanatory gaps with an extraordinary mechanism, and it does not erase anomalous evidence merely because the mechanism is unknown.
