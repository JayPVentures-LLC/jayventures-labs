# JPVOs Enforcement Engine Automation

This engine enforces brand, voice, and routing rules across the workspace.

## How to Use

- **CLI:**
  - `npx ts-node operations/jpv_os_enforcement/cli.ts <brand_id> <text>`
- **Pre-commit:**
  - Add the provided script to `.git/hooks/pre-commit` or symlink `.githooks/pre-commit`.
- **CI:**
  - Add a step to your CI pipeline to run the CLI against changed files.

## Example CI Step (GitHub Actions)

```yaml
- name: JPVOs Enforcement
  run: |
    for file in $(git diff --name-only ${{ github.event.before }} ${{ github.sha }} | grep -E '\\.(ts|js|md|txt)$'); do
      CONTENT=$(cat "$file" | head -c 1000)
      npx ts-node operations/jpv_os_enforcement/cli.ts jaypventures_llc "$CONTENT"
    done
```

## Extending
- Add more enforcement logic in `enforcement_engine.ts`.
- Update YAML spec as governance evolves.
