# IAT Transition Model v0.1

## Purpose

Defines how information moves between accessibility states in a structured, testable way.

This model does not assume a single mechanism for intuition, memory, or insight. It defines observable transition behavior.

---

## 1. State Space

IAT operates on the following states:

- LatentInformation
- AccessibleInformation
- ConsciouslyAvailableInformation
- ExpressedInformation
- AppliedInformation

All transitions occur between these states.

---

## 2. Transition Function

Each transition is defined as:

```text
T(State_i → State_j | Context)
```

Where:

- State_i = current information state
- State_j = target information state
- Context = biological, cognitive, emotional, environmental, or unknown variables

---

## 3. Core Transitions

### T1: Latent → Accessible
Triggered by:

- cue matching
- attention shift
- sleep-state reorganization
- reduced cognitive load
- emotional salience increase

---

### T2: Accessible → Conscious
Triggered by:

- attention allocation
- working memory activation
- narrative integration
- pattern completion threshold crossing

---

### T3: Conscious → Expressed
Triggered by:

- language encoding
- motor output planning
- communication intent

---

### T4: Expressed → Applied
Triggered by:

- decision selection
- behavioral execution
- environmental interaction

---

## 4. Transition Modulators

Transitions are influenced by weighted factors:

### Biological
- sleep state
- circadian phase
- fatigue level
- stress hormones

### Cognitive
- attention focus
- working memory load
- prior knowledge density
- pattern similarity

### Emotional
- threat level
- reward salience
- uncertainty tolerance

### Environmental
- context stability
- sensory cues
- timing effects

### Unknown
- unclassified influences (tracked, not assumed)

---

## 5. Transition Constraints

- Transitions are probabilistic, not deterministic
- Multiple competing transitions may exist simultaneously
- No transition is guaranteed without sufficient enabling context

---

## 6. Intuition Mapping

Intuition is modeled as:

```text
LatentInformation → AccessibleInformation (rapid, non-linear transition)
```

followed by optional immediate progression to conscious availability.

Key distinction:

> Intuition is not a separate state. It is a transition pattern.

---

## 7. Deja Vu Mapping

Deja vu is modeled as:

- partial AccessibleInformation activation
- without resolved source binding
- producing familiarity signal without traceable origin path

---

## 8. Failure Modes

- false accessibility (incorrect activation)
- delayed conscious binding
- misattributed source memory
- noise-driven transition spikes

---

## 9. Measurement Hook

Each transition must log:

- trigger context
- prior state
- resulting state
- time delta
- confidence score
- competing explanations

---

## 10. System Principle

> Information does not “arrive.” It changes accessibility state under context-dependent constraints.