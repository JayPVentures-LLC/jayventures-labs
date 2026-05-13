# Tenant Isolation Runbook

## Purpose
Ensure that a failure or compromise in one tenant does not impact others.

## Steps
1. Detect tenant-specific anomaly (alert, log, trace)
2. Contain: restrict or disable affected tenant
3. Verify isolation boundaries (network, data, access)
4. Communicate with affected and unaffected tenants
5. Restore service for unaffected tenants
6. Postmortem: review isolation controls and update policies
