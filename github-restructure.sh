# GitHub Dual-Brand Restructure Automation Script

This script uses the GitHub CLI (`gh`) to automate repository transfers, renaming, and archiving based on your restructure plan. 

## Prerequisites
- Install the GitHub CLI: https://cli.github.com/
- Authenticate: `gh auth login`
- You must have admin rights on the repositories and organizations involved.

---

```sh
#!/bin/bash
# Set these variables to your GitHub org/account names
PERSONAL="jaypventuresllc"
CORP="JayPVentures-LLC"
LABS="jayventures"

# 1. Move website-design to corporate org and rename
# gh repo transfer <repo> --org <org>
gh repo transfer "$PERSONAL/website-design" --org "$CORP"
gh repo rename "$CORP/website-design" "company-website"

echo "Transferred and renamed website-design."

# 2. Move jayventures-labs to labs org and rename
gh repo transfer "$PERSONAL/jayventures-labs" --org "$LABS"
gh repo rename "$LABS/jayventures-labs" "labs"
echo "Transferred and renamed jayventures-labs."

# 3. Move jaypventuresllc.com to corporate org
gh repo transfer "$PERSONAL/jaypventuresllc.com" --org "$CORP"
echo "Transferred jaypventuresllc.com."

# 4. (Manual) Audit and split jaypventuresllc repo
echo "Please manually audit and split $PERSONAL/jaypventuresllc as needed."

# 5. Rename demo-repository in both orgs
gh repo rename "$CORP/demo-repository" "product-demo-template"
gh repo rename "$LABS/demo-repository" "demo-playground"
echo "Renamed demo repositories."

# 6. Move SOS as needed (edit as appropriate)
gh repo transfer "$PERSONAL/SOS" --org "$LABS"
echo "Transferred SOS to labs org."

# 7. Archive unused/deprecated repos (example)
# gh repo archive <repo>
# gh repo edit <repo> --description "[ARCHIVED] ..."
# Example: gh repo archive "$PERSONAL/old-repo"

# 8. Update descriptions and READMEs (manual step)
echo "Update repository descriptions and READMEs as needed."

# 9. Set access controls (manual step)
echo "Review and set repository visibility and access controls."

# 10. Done
echo "GitHub dual-brand restructure automation complete."
```

---

**Instructions:**
1. Save this script as `github-restructure.sh`.
2. Run `chmod +x github-restructure.sh` to make it executable.
3. Execute with `./github-restructure.sh`.
4. Review output and perform manual steps as prompted.

**Note:**
- Some steps (splitting repos, updating READMEs, setting access) require manual review.
- Edit the script to match your exact repo names and desired actions.
