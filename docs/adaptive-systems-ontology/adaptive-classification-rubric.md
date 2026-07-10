# Adaptive Systems Ontology
## Adaptive Classification Rubric v0.1

## Purpose

This rubric classifies whether a system is inert, reactive, responsive, context-adaptive, learning-adaptive, or evolutionary-adaptive.

The decisive question is:

> Does feedback alter the future response rule?

## Boundary distinction

Response is not adaptation.

- Response changes the current state.
- Adaptation changes the future rule.

## Classification levels

| Level | Name | Definition | Example |
|---:|---|---|---|
| 0 | Inert | No meaningful response in the tested context. | Unmoved object under no relevant interaction. |
| 1 | Reactive | State changes occur through external process, but no internal response rule exists. | Falling rock. |
| 2 | Responsive | System reacts to input through fixed rules. | Basic thermostat. |
| 3 | Context-Adaptive | System changes behavior inside a temporary context, but does not update its durable rule. | LLM inference session using context. |
| 4 | Learning-Adaptive | Feedback updates future response patterns. | Human learning, immune memory, AI training pipeline. |
| 5 | Evolutionary-Adaptive | Adaptive changes accumulate across generations, versions, institutions, or populations. | Ecosystem, viral population, civilization. |

## Classification rule

A system cannot be classified above Level 3 unless feedback changes future behavior beyond the immediate context.

Short form:

> Context change is not enough. Rule change is required.

## Evaluation checklist

Score each criterion from 0 to 5.

0 = absent  
1 = minimal  
2 = limited  
3 = moderate  
4 = strong  
5 = exceptional

| Dimension | Question |
|---|---|
| Information Capacity | How effectively does the system acquire relevant information? |
| Representation Capacity | How accurately does the system preserve or model relevant information? |
| Evaluation Capacity | How effectively does the system distinguish risk, opportunity, priority, or significance? |
| Execution Capacity | How reliably does the system convert evaluation into action or state change? |
| Feedback Capacity | How effectively does the system detect consequences? |
| Adaptation Capacity | Does feedback change future response patterns? |
| Recursive Capacity | Can subsystems adapt independently or can the system evaluate its own adaptation? |

## Adaptive Capacity Index draft

A provisional unweighted index may be calculated as:

```text
ACI = ((IC + RC + EC + XC + FC + AC + RC2) / 35) * 100
```

Where:

- IC = Information Capacity
- RC = Representation Capacity
- EC = Evaluation Capacity
- XC = Execution Capacity
- FC = Feedback Capacity
- AC = Adaptation Capacity
- RC2 = Recursive Capacity

## Weight caution

Equal weighting is not assumed to be true. The unweighted index is a draft measurement scaffold only. Future validation should use evidence to determine whether dimensions should be weighted differently.

## Example classifications

| System | Classification | Reason |
|---|---|---|
| Falling rock | Level 1: Reactive | State changes occur, but no internal rule updates. |
| Fire | Level 2: Responsive | Reacts to fuel and oxygen, but does not revise future behavior. |
| Basic thermostat | Level 2: Responsive | Responds to temperature through fixed rule. |
| LLM inference session | Level 3: Context-Adaptive | Uses context but does not update base parameters during ordinary inference. |
| Learning thermostat | Level 4: Learning-Adaptive | Updates future heating/cooling patterns from feedback. |
| Immune system | Level 4: Learning-Adaptive | Exposure changes future immune response. |
| Human brain | Level 4: Learning-Adaptive | Experience changes future perception, decision, and behavior. |
| AI training pipeline | Level 4: Learning-Adaptive | Feedback updates model parameters. |
| Viral population | Level 5: Evolutionary-Adaptive | Mutation and selection change future population traits. |
| Ecosystem | Level 5: Evolutionary-Adaptive | Populations and relationships shift over ecological and evolutionary time. |
| Civilization | Level 5: Evolutionary-Adaptive | Institutions, technologies, and cultures can accumulate revisions over time. |

## Human boundary

Humans can be studied as adaptive systems, but this rubric must not be used as a standalone tool to rank human worth, assign blame, diagnose, punish, or deny opportunity. Human use requires ethical review, domain expertise, and people-protection standards.

## Current strongest classification principle

> Complex systems can respond. Adaptive systems revise. Evolutionary systems accumulate revision over time.
