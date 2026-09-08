# JPVOs Enforcement Engine Automation

This engine enforces brand, voice, and routing rules across the workspace.

## How to Use

- **CLI:** `npx ts-node operations/jpv_os_enforcement/cli.ts <brand_id> <text>`
- **Pre-commit:** add the provided script to `.git/hooks/pre-commit` or symlink `.githooks/pre-commit`.
- **JPV execution plane:** invoke the CLI against changed files from the approved JPV-native orchestration path.

## Example Provider-Neutral Invocation

```sh
for file in $(git diff --name-only "$BASE_SHA" "$HEAD_SHA" | grep -E '\.(ts|js|md|txt)$'); do
  CONTENT=$(cat "$file" | head -c 1000)
  npx ts-node operations/jpv_os_enforcement/cli.ts jaypventures_llc "$CONTENT"
done
```

The execution environment supplies `BASE_SHA` and `HEAD_SHA`. The repository must remain free of `.github/workflows`; GitHub Actions is not an execution route for JPV.

## Extending
- Add more enforcement logic in `enforcement_engine.ts`.
- Update the YAML spec as governance evolves.
