# JPV Repetition System-Defect Audit Trigger

Status: ENFORCED
Version: 1.0.0
Authority: Founder directive
Scope: all repositories, entities, subsystems, operators, agents, automations, workflows, runtimes, and future governed systems.

## Automatic trigger
More than three Founder repetitions, restatements, reissues, or material corrections of the same matter automatically create a system/process defect flag. The fourth occurrence triggers it without further instruction.

`REPETITION_COUNT > 3 => SYSTEM_DEFECT_FLAG=TRUE`

## Mandatory response
Flag the defect; audit execution/reasoning and the governing process; audit routing, continuity, authority, state persistence, validation, tooling and handoffs; identify root cause or exact fault boundary; remediate within available authority; strengthen recurrence prevention; validate against the original requirement and established constraints; perform authoritative readback for persistent changes; and record a defect receipt with trigger count, matter, cause/fault boundary, corrections, evidence, dependency and owner.

## Counting
Count by matter, not exact wording. Semantically equivalent repetitions count. Do not reset because the session, operator, tool, repository, branch, provider or interface changes.

## Fail closed
After trigger, do not ask the Founder to repeat the requirement, substitute acknowledgment/explanation/planning for remediation, persist only to conversational memory when system persistence is required, or claim closure without validation.

`JPV_SYSTEM_DEFECT=OPEN`

Closure requires root-cause/fault-boundary analysis, remediation, recurrence control, validation and evidence receipt.

`JPV_SYSTEM_DEFECT=CLOSED_VERIFIED`
