# Incident Response Runbook

## Detection
- SLO/SLI alerts (availability, latency, correctness)
- Logs, traces, metrics, external probes

## Impact Assessment
- Affected user journeys
- Regions/tenants impacted

## Immediate Containment
- Rate limit, circuit breaker, feature flag off, queue workloads

## Diagnosis Workflow
- Hypothesis checklist
- Dependency map

## Mitigation Steps
- Traffic failover
- Rollback
- Configuration freeze

## Recovery Verification
- SLI restored
- Backlog drained
- Data reconciled

## Post-Incident Actions
- RCA
- Corrective actions
- New chaos tests
