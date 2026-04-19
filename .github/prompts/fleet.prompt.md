---
name: fleet
description: "Review and configure JayPV-OS GitHub workflows, issues, and PR execution with parallel subagent orchestration."
agent: JayPV-OS Fleet
argument-hint: "What GitHub repo, issue, PR, or workflow should jaypv-os review and configure?"
tools: [read, search, edit, execute, web, todo, agent]
---
Review and configure the requested jaypv-os GitHub prompt/workflow task.

- Gather GitHub context (issues, PRs, and repository state) first.
- Use available GitHub plugin tools when present in the session.
- Apply required prompt, agent, or workflow configuration changes.
- Return: findings, exact changes, risks, and next command.
