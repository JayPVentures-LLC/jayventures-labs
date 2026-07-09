import fs from "fs";
import path from "path";

const baseUrl = process.env.JVP_BASE_URL || "http://127.0.0.1:8787";
const adminToken = process.env.ADMIN_UPLOAD_TOKEN || "";
const inputPath = process.argv[2] || process.env.CSV_PATH || "";

function usage() {
  console.log(
    "Usage: ADMIN_UPLOAD_TOKEN=token node --experimental-strip-types scripts/backfill-inner-circle.ts ./members.csv"
  );
  console.log(
    "       ADMIN_UPLOAD_TOKEN=token node --experimental-strip-types scripts/backfill-inner-circle.ts ./members.json"
  );
  console.log("Optional env vars: JVP_BASE_URL, CSV_PATH");
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current.trim());
  return fields;
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function parseCsv(content: string): Array<Record<string, string>> {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows: Array<Record<string, string>> = [];

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

function toStringOrEmpty(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function mapRow(row: Record<string, string>) {
  return {
    memberId: row.memberid || row.memberkey || row.member_id || row.id || "",
    memberKey: row.memberkey || row.memberid || row.member_id || row.id || "",
    email: row.email || "",
    name: row.name || row.fullname || row.full_name || "",
    tier: row.tier || row.plan || "",
  };
}

function mapJsonRow(row: Record<string, unknown>) {
  const memberId =
    toStringOrEmpty(row.memberId) ||
    toStringOrEmpty(row.memberKey) ||
    toStringOrEmpty(row.member_id) ||
    toStringOrEmpty(row.id) ||
    "";
  const memberKey =
    toStringOrEmpty(row.memberKey) ||
    toStringOrEmpty(row.memberId) ||
    toStringOrEmpty(row.member_id) ||
    toStringOrEmpty(row.id) ||
    "";
  return {
    memberId,
    memberKey,
    email: toStringOrEmpty(row.email),
    name: toStringOrEmpty(row.name || row.fullName || row.full_name),
    tier: toStringOrEmpty(row.tier || row.plan),
  };
}

async function run() {
  if (!adminToken || !inputPath) {
    usage();
    process.exitCode = 1;
    return;
  }

  const resolved = path.resolve(inputPath);
  const content = fs.readFileSync(resolved, "utf8");
  const ext = path.extname(resolved).toLowerCase();

  let rows: Array<Record<string, string>> = [];
  if (ext === ".json") {
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.log("Invalid JSON file.");
      process.exitCode = 1;
      return;
    }

    if (!Array.isArray(parsed)) {
      console.log("JSON file must contain an array.");
      process.exitCode = 1;
      return;
    }

    rows = parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => mapJsonRow(item as Record<string, unknown>));
  } else {
    rows = parseCsv(content).map(mapRow);
  }

  if (!rows.length) {
    console.log("No rows found in input file.");
    return;
  }

  if (process.env.JPV_ALLOW_BACKFILL_HTTP_TRANSPORT !== "true") {
    throw new Error(
      "Backfill transport blocked. Set JPV_ALLOW_BACKFILL_HTTP_TRANSPORT=true only for approved operational backfills."
    );
  }

  if (!baseUrl.startsWith("https://")) {
    throw new Error("Backfill endpoint must use HTTPS.");
  }

  const response = await fetch(`${baseUrl}/inner-circle/backfill`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(rows, null, 2),
  });

  const text = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(text);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
