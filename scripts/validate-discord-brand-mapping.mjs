import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const candidatePaths = [
  "operations/entitlement-system/config/discordGuilds.ts",
  "src/config/discordGuilds.ts",
  "apps/entitlements/src/config/discordGuilds.ts",
  "apps/worker/src/config/discordGuilds.ts",
  "packages/entitlements/src/config/discordGuilds.ts",
];

const configPath = candidatePaths
  .map((p) => path.join(root, p))
  .find((p) => fs.existsSync(p));

if (!configPath) {
  console.error("❌ Discord guild config not found.");
  console.error("Checked:");
  for (const p of candidatePaths) console.error(`  - ${p}`);
  process.exit(1);
}

const source = fs.readFileSync(configPath, "utf8");
const failures = [];

// Extract the text block for each brand key so checks don't bleed across blocks.
// If a key isn't present the block will be empty (caught separately).
const jpvIdx = source.indexOf("jaypventures:");
const llcIdx = source.indexOf("jaypventuresllc:");
const jpvBlock = jpvIdx >= 0 ? source.slice(jpvIdx, llcIdx > jpvIdx ? llcIdx : undefined) : "";
const llcBlock = llcIdx >= 0 ? source.slice(llcIdx) : "";

function check(label, cond) {
  if (!cond) failures.push(label);
}

// Brand keys present
check("DISCORD_GUILD_CONFIG must include jaypventures", jpvBlock.length > 0);
check("DISCORD_GUILD_CONFIG must include jaypventuresllc", llcBlock.length > 0);

// Guild purpose — correct direction
check(
  "jaypventures must be mapped to creator purpose",
  /guildPurpose\s*:\s*["']creator["']/.test(jpvBlock)
);
check(
  "jaypventuresllc must be mapped to labs/institutional/business purpose",
  /guildPurpose\s*:\s*["']labs_institutional_business["']/.test(llcBlock)
);

// Guild purpose — must not be inverted
check(
  "jaypventures must not be mapped to labs/institutional/business purpose",
  !/guildPurpose\s*:\s*["']labs_institutional_business["']/.test(jpvBlock)
);
check(
  "jaypventuresllc must not be mapped to creator purpose",
  !/guildPurpose\s*:\s*["']creator["']/.test(llcBlock)
);

// jaypventures creator role keys
check("jaypventures must include community role", /community\s*:/.test(jpvBlock));
check("jaypventures must include vip role", /vip\s*:/.test(jpvBlock));
check("jaypventures must include member role", /member\s*:/.test(jpvBlock));

// jaypventuresllc labs/institutional role keys
check("jaypventuresllc must include partner role", /partner\s*:/.test(llcBlock));
check("jaypventuresllc must include admin role", /admin\s*:/.test(llcBlock));
check("jaypventuresllc must include labs role", /labs\s*:/.test(llcBlock));
check("jaypventuresllc must include institute role", /institute\s*:/.test(llcBlock));
check("jaypventuresllc must include business role", /business\s*:/.test(llcBlock));

if (failures.length > 0) {
  console.error("❌ Discord brand mapping validation failed.");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  console.error("");
  console.error("Required mapping:");
  console.error("  jaypventures    → creator guild           + community / vip / member roles");
  console.error("  jaypventuresllc → labs/institutional guild + partner / admin / labs / institute / business roles");
  process.exit(1);
}

console.log("✅ Discord brand mapping validation passed.");
console.log(`   Config checked: ${path.relative(root, configPath)}`);
console.log("   jaypventures    → creator");
console.log("   jaypventuresllc → labs / institutional / business");
