# Adaptive Systems Ontology
## Derivation Map v0.1

## Primitive set

| Primitive | Minimal meaning | Necessary because |
|---|---|---|
| Existence | Something is | Without being, nothing can be derived. |
| Difference | Something can be distinguished | Without distinction, there is no identity, boundary, measurement, or information. |
| Interaction | Something can affect something else | Without influence, there is no process, causation, feedback, or adaptation. |
| Ordered Change | Something can change in sequence | Without before/after ordering, there is no process, memory, feedback, learning, or evolution. |

## Primary derivation chain

```text
Existence
  -> Difference
  -> Interaction
  -> Ordered Change
  -> Boundary
  -> Identity
  -> Relation
  -> Structure
  -> State
  -> Process
  -> Information
  -> Representation
  -> Feedback
  -> Persistence
  -> Response
  -> Process Modification
  -> Adaptation
  -> Learning
  -> Evolution
  -> Reflection
  -> Recursive Design
```

This chain is illustrative and non-exhaustive, not strictly linear. Additional branches—including Replication, Selection, Recursion, and Evaluation—are defined in the dependency table below, and several concepts require multiple earlier primitives or derived concepts.

## Derived concept dependencies

Vocabulary alignment: the compact tokens `ProcessModification` and `IntentionalProcessModification` correspond to the canonical concept labels `Process Modification` and `Intentional Process Modification` used below.

| Concept | Derived from | Definition |
|---|---|---|
| Boundary | Existence + Difference | A distinguishable separation between system and environment or one entity and another. |
| Identity | Existence + Difference + Ordered Change | Traceable distinction across sequence. |
| Relation | Difference + Interaction | A connection, comparison, or relevance between distinguishable entities. |
| Structure | Existence + Difference + Interaction + Ordered Change | Stable organization among distinguishable parts or states. |
| State | Structure + Ordered Change | Measurable condition of a structure at a point in sequence. |
| Process | Interaction + Ordered Change | Ordered transformation from one state to another. |
| Information | Difference + Interaction + Ordered Change | A difference that affects a system's state, process, or representation. |
| Representation | Information + Structure | Stored structure corresponding to information about something else. |
| Feedback | Process + Information + Ordered Change | Result of one process becoming information for a later process. |
| Persistence | Structure + Process + Ordered Change | Continuation of identifiable structure through sustaining processes. |
| Response | Information + Process | A change in current state or action caused by information. |
| Process Modification | Process + Ordered Change | A change to the transformation rule that maps one state to a later state. |
| Adaptation | Feedback + Persistence + Process Modification | Feedback changing future response rules. |
| Learning | Adaptation + Representation | Feedback-modified representation that alters future response. |
| Replication | Structure + Process + Ordered Change | Production of a traceably similar structure, pattern, or rule across sequence. |
| Constraint | Difference + Interaction + Ordered Change + Structure | A stable difference in structure, state, or interaction that limits possible future processes. |
| Selection | Difference + Interaction + Constraint + Ordered Change | Differential persistence or replication among alternatives under environmental conditions. |
| Evolution | Adaptation + Replication + Selection + Ordered Change | Accumulated adaptive difference across generations, versions, institutions, or populations. |
| Recursion | Representation + Process | A process operating on its own output, representation, or process structure. |
| Reflection | Representation + Recursion | A system representing itself or its own processes. |
| Intentional Process Modification | Reflection + Evaluation (see adaptive-classification-rubric.md#evaluation-checklist) + Process Modification | Deliberate revision of a process based on represented goals, evidence, or expected consequences. |
| Recursive Design | Reflection + Adaptation + Intentional Process Modification | A system modifying the process by which it modifies itself. |

## Constraint result

Constraint was tested as a possible fifth primitive. Current result: derived.

Working definition:

> A constraint is a stable difference in structure, state, or interaction that limits possible future processes.

Constraint narrows the set of possible processes, but it can be derived from difference, interaction, ordered change, and stable structure.

## Information result

Information was tested as a possible replacement for difference. Current result: derived.

Working definition:

> Information is a difference that makes a difference to a system across ordered change.

Difference is more primitive because difference can exist without becoming information, but information cannot exist without difference.

## Existence and difference result

Existence and difference were tested for merger. Current result: separate primitives.

Existence gives:

> There is.

Difference gives:

> It is not identical.

Measurement, identity, process, information, and adaptation all require difference. Existence alone is not sufficient.

## Minimality test

| Removed primitive | Failure |
|---|---|
| Existence | Nothing can be. |
| Difference | No identity, measurement, information, or state change. |
| Interaction | No influence, causation, process, feedback, or adaptation. |
| Ordered Change | No sequence, memory, feedback, learning, or evolution. |

Current verdict:

> The four-primitives model survives first-pass minimality and sufficiency testing.

## Strongest theorem candidate

> A system becomes adaptive when persistent structure uses feedback from prior interactions to modify future processes across ordered change.

Short form:

> Adaptation is feedback-modified process persistence.
