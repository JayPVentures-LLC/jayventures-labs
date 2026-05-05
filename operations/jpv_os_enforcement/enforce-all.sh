#!/bin/sh
# Run JPVOs enforcement on all .md and .ts files in the repo
for file in $(find . -type f \( -name '*.md' -o -name '*.ts' \)); do
  npx ts-node operations/jpv_os_enforcement/cli.ts jaypventures_llc "$(cat $file)"
done
