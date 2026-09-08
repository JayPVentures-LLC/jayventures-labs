## Pre-commit Hook

To enforce JPVOs rules on commit, add this to your `.git/hooks/pre-commit`:

```sh
#!/bin/sh
BRAND_ID="jaypventures_llc"
FILES=$(git diff --cached --name-only | grep -E '\.(ts|js|md|txt)$')
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

Or symlink from `.githooks/pre-commit` for multi-platform support.

## CLI Usage

```sh
npx ts-node cli.ts <brand_id> <text>
# Example:
npx ts-node cli.ts jaypventures_llc "this is a vibe"
```

Returns violations and exits nonzero if any are found.

# JPVOs Enforcement Engine

This is the root for the JPVOs enforcement engine implementation. This engine will:
- Parse the JPV-OS YAML spec
- Enforce brand, voice, mission, and routing constraints
- Detect violations such as mixed voice, misrouted revenue, and unclear authority
- Take enforcement actions such as reject output, reroute, and log

## Setup & Usage

### 1. Install dependencies
```sh
cd operations/jpv_os_enforcement
npm install
```

### 2. Run the enforcement engine
```sh
npx ts-node run_enforcement.ts
```

### 3. Integrate with JPV-native automation
Invoke the CLI from the JPV execution plane, pre-commit hooks, or an approved external runner. Do not create `.github/workflows`.

## Usage

### Manual Check
```sh
npm run enforce:brand -- "your text here"
```

### Pre-commit Hook
- Blocks commits with violations in staged `.md`, `.ts`, `.js`, and `.json` files.
- Activate the repository hook path according to the workspace bootstrap procedure.

### Automated Enforcement
- JPV-native orchestration invokes the enforcement engine on the relevant repository changes.
- GitHub Actions is not an execution dependency.

### Bulk Check
```sh
sh operations/jpv_os_enforcement/enforce-all.sh
```

## Adding Brands or Rules
- Edit `operations/jpv_os_enforcement/jpv_os.yaml` to add brands, deny/allow lists, or enforcement rules.

## Supported File Types
- Markdown: `.md`
- TypeScript: `.ts`
- JavaScript: `.js`
- JSON: `.json`

## Test Coverage
- See `operations/jpv_os_enforcement/tests/` for enforcement engine tests.
