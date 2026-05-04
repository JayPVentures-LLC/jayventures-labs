## Pre-commit Hook

To enforce JPVOs rules on commit, add this to your .git/hooks/pre-commit:

```sh
#!/bin/sh
BRAND_ID="jaypventures_llc"
FILES=$(git diff --cached --name-only | grep -E '\\.(ts|js|md|txt)$')
EXIT=0
for file in $FILES; do
	if grep -q . "$file"; then
		CONTENT=$(cat "$file" | head -c 1000)
		npx ts-node operations/jpv_os_enforcement/cli.ts "$BRAND_ID" "$CONTENT"
		if [ $? -ne 0 ]; then
			echo "JPVOs enforcement violation in $file"
			EXIT=1
		fi
	fi
done
exit $EXIT
```

Or symlink from .githooks/pre-commit for multi-platform support.
## CLI Usage

You can run the enforcement engine as a CLI:

```sh
npx ts-node cli.ts <brand_id> <text>
# Example:
npx ts-node cli.ts jaypventures_llc "this is a vibe"
```

Returns violations and exits nonzero if any are found.
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
