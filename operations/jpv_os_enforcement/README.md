# JPVOs Enforcement Engine

This is the root for the JPVOs enforcement engine implementation. This engine will:
- Parse the jpv_os YAML spec
- Enforce brand, voice, mission, and routing constraints
- Detect violations (mixed_voice, misrouted_revenue, unclear_authority)
- Take enforcement actions (reject_output, reroute, log)

## Setup & Usage

### 1. Install dependencies
```sh
cd operations/jpv_os_enforcement
npm init -y
npm install js-yaml
```

### 2. Run the enforcement engine
```sh
npx ts-node run_enforcement.ts
```

### 3. Integrate with workspace automation
- Add as a pre-commit hook, CI job, or CLI tool as needed.

## Next Steps
- Expand enforcement logic for all rules
- Add test cases for each enforcement rule
