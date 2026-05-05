# JayPVentures LLC — Brand Governance & Usage

This document defines **how the JayPVentures LLC brand is used, enforced, and protected** across people, systems, bots, and interfaces.

This is not a style guide.
It is a **governance contract**.

---

## Brand Architecture (Non-Negotiable)

JayPVentures operates under a **dual-brand system**:

### 1. JayPVentures LLC (Corporate / System Brand)

* Legal entity
* Operational authority
* Institutional trust layer
* Internal tools, contracts, finance, admin, infrastructure

Tone:

* Calm
* Precise
* Authoritative
* Durable

Visual posture:

* Conservative
* High contrast
* Low ornamentation

---

### 2. jayventures (Creator / Cultural Brand)

* Public-facing creator identity
* Community, content, growth, culture
* Experimental and expressive

Tone:

* Inspirational
* Energetic
* Human
* Adaptive

**Rule:**

> These brands must never be visually or semantically merged in the same surface.

---

## Naming Rules (Hard Enforcement)

* **JayPVentures LLC**

  * Always capitalized exactly as written
  * Used in legal, operational, system contexts

* **jayventures**

  * Always lowercase
  * Used only in creator/community contexts

Bots, employees, agents, and documents must enforce this automatically.

---

## Token Governance

### Corporate Systems

* Must use **JayPVentures LLC tokens** (`jp-` prefix)
* No overrides without brand review
* Accent color usage strictly limited

### Creator Systems

* Must use **jayventures tokens**
* Expressive motion allowed
* Cultural adaptation permitted

### Prohibited

* Mixing token sets
* Inheriting creator styles into corporate systems
* “Just this once” exceptions

Governance exists to prevent drift.

---

## Surface Classification Rules

Every interface must declare its brand context:

* `corporate`
* `creator`

If no context is declared, **corporate defaults apply**.

This rule applies to:

* Web apps
* Internal tools
* AI agents
* Bots
* Documents
* Dashboards

---

## Bot & Agent Behavior

AI operating under JayPVentures LLC:

* Uses corporate tone
* Avoids slang
* Prioritizes clarity over warmth
* Defers decisions unless authorized

AI operating under jayventures:

* May be expressive
* May inspire
* May explore

**Agents must know which brand they represent.**

---

## Review & Enforcement

### Required Checks

Before release:

* Brand context declared
* Correct token set applied
* Naming conventions validated

### Authority

Final brand authority rests with **JayPVentures LLC**.

Exceptions require explicit approval.

---

## Strategic Outcome

This governance model ensures:

* Brand clarity at scale
* Zero ambiguity for employees and bots
* Long-term durability
* Freedom to experiment without erosion

Strong systems protect creativity.
# Brand Context Declaration & Enforcement Spec

This document defines **how brand context is declared, inherited, and enforced** across all JayPVentures LLC systems, interfaces, and agents.

Brand context is executable logic.
If it is not declared, it is inferred.
If it is inferred, **corporate rules apply**.

---

## Context Types (Authoritative)

Only two brand contexts exist:

* `corporate` → JayPVentures LLC
* `creator` → jayventures

No additional contexts are permitted without governance approval.

---

## Declaration Rules

Every surface **must declare** its brand context at initialization.

### Accepted Declaration Methods

* UI root attribute
* Application configuration file
* Agent/system manifest
* Document front-matter

### Example (UI)

```html
<html data-brand-context="corporate">
```

### Example (Config)

```json
{
  "brandContext": "creator"
}
```

If multiple declarations exist, **the most restrictive context wins**.

---

## Inheritance Model

Brand context propagates downward.

* Parent surface → child components
* System → agents
* Workspace → documents

Overrides are allowed **only upward**, never downward.

Example:

* Corporate workspace → creator document ❌
* Creator workspace → corporate document ✅ (with warning)

---

## Token Enforcement

### Corporate Context

* Only `jp-` token set allowed
* Creator tokens blocked at build time
* Accent usage capped

### Creator Context

* Only `jayventures-` token set allowed
* Corporate tokens allowed *only* for legal disclosure elements

Violations must fail lint/build checks.

---

## Agent Tone Enforcement

Agents must bind to brand context at instantiation.

### Corporate Agent Behavior

* Formal, concise language
* No slang or emojis
* Explicit uncertainty when applicable

### Creator Agent Behavior

* Expressive language allowed
* Motivational framing permitted
* Exploratory tone encouraged

Agents switching context must rebind tone immediately.

---

## Runtime Safeguards

The system must prevent:

* Silent context switching
* Mixed-token rendering
* Agent tone drift

When violations are detected:

* Log the event
* Revert to corporate defaults
* Notify maintainers if repeated

---

## Review & Auditing

### Automated Checks

* Context declared
* Token set valid
* Agent bindings correct

### Manual Review

* New context requests
* Cross-brand surfaces

Audit logs are mandatory for corporate systems.

---

## Failure Conditions

This spec has failed if:

* A user cannot tell who is speaking
* A surface feels ambiguous
* A bot behaves out of character

Clarity is the goal.

---

## Strategic Outcome

This enforcement layer ensures:

* Brand integrity at scale
* Autonomous systems that self-correct
* Zero drift over time

When context is explicit, trust compounds.

