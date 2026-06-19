import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const ENV_FILES = [".env.local", ".env"];
const SOURCE_NAME = "supabase";
const DEFAULT_BATCH_SIZE = Number(process.env.SUPABASE_CONVEX_BATCH_SIZE || "100");
const DEFAULT_TABLE_ORDER = [
  "applications",
  "competitions",
  "contact_messages",
  "contact_submissions",
  "donations",
  "impact_stories",
  "impact_metrics",
  "resources",
  "team_members",
  "teams",
  "user_roles",
  "competition_entries",
  "payment_records",
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const parsed = {};

  for (const rawLine of fileContents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    const commentIndex = value.indexOf(" #");
    if (commentIndex >= 0) {
      value = value.slice(0, commentIndex).trim();
    }

    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function loadEnv() {
  const combined = {};
  for (const relativePath of ENV_FILES) {
    Object.assign(combined, parseEnvFile(path.join(ROOT, relativePath)));
  }
  return combined;
}

const loadedEnv = loadEnv();

function envValue(...keys) {
  for (const key of keys) {
    if (process.env[key]) {
      return process.env[key];
    }
    if (loadedEnv[key]) {
      return loadedEnv[key];
    }
  }
  return undefined;
}

function requireEnv(...keys) {
  const value = envValue(...keys);
  if (!value) {
    throw new Error(`Missing required environment variable. Expected one of: ${keys.join(", ")}`);
  }
  return value;
}

const supabaseUrl = requireEnv("SUPABASE_URL", "VITE_SUPABASE_URL");
const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const convexCliEntry = path.join(ROOT, "node_modules", "convex", "bin", "main.js");

function parseArgs(argv) {
  const tables = [];
  let batchSize = DEFAULT_BATCH_SIZE;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--table") {
      const tableName = argv[index + 1];
      if (!tableName) {
        throw new Error("Expected a table name after --table");
      }
      tables.push(tableName);
      index += 1;
      continue;
    }

    if (token === "--batch-size") {
      const rawBatchSize = argv[index + 1];
      if (!rawBatchSize) {
        throw new Error("Expected a number after --batch-size");
      }
      batchSize = Number(rawBatchSize);
      index += 1;
      continue;
    }
  }

  return {
    batchSize: Number.isFinite(batchSize) && batchSize > 0 ? batchSize : DEFAULT_BATCH_SIZE,
    tables: tables.length > 0 ? tables : DEFAULT_TABLE_ORDER,
  };
}

function runConvex(functionName, args) {
  const output = execFileSync(
    process.execPath,
    [convexCliEntry, "run", functionName, JSON.stringify(args), "--typecheck=disable"],
    {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  return output.trim() ? JSON.parse(output) : null;
}

async function countSupabaseRows(tableName) {
  const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true });
  if (error) {
    throw new Error(`Failed to count ${tableName}: ${error.message}`);
  }
  return count ?? 0;
}

async function fetchSupabaseBatch(tableName, from, to) {
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .order("id", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch ${tableName} rows ${from}-${to}: ${error.message}`);
  }

  return data ?? [];
}

function requireMappedId(tableName, mapping, legacyId, fieldName) {
  if (!legacyId) {
    return undefined;
  }

  const mappedId = mapping.get(legacyId);
  if (!mappedId) {
    throw new Error(`Missing ${fieldName} mapping for ${tableName} legacy id ${legacyId}`);
  }
  return mappedId;
}

function transformRow(tableName, row, mappingsByTable) {
  if (tableName === "competition_entries") {
    return {
      ...row,
      competition_id: requireMappedId(tableName, mappingsByTable.competitions, row.competition_id, "competition_id"),
    };
  }

  if (tableName === "payment_records") {
    return {
      ...row,
      donation_id: requireMappedId(tableName, mappingsByTable.donations, row.donation_id, "donation_id"),
      competition_entry_id: requireMappedId(
        tableName,
        mappingsByTable.competition_entries,
        row.competition_entry_id,
        "competition_entry_id",
      ),
      competition_id: requireMappedId(tableName, mappingsByTable.competitions, row.competition_id, "competition_id"),
    };
  }

  return row;
}

function updateMappings(mappingStore, tableName, result) {
  const tableMap = mappingStore[tableName];
  for (const mapping of result.mappings || []) {
    tableMap.set(mapping.legacyId, mapping.convexId);
  }
}

async function migrateTable(tableName, batchSize, mappingStore) {
  const total = await countSupabaseRows(tableName);
  console.log(`\n[${tableName}] ${total} source rows`);

  if (total === 0) {
    return { total: 0, created: 0, existing: 0 };
  }

  let created = 0;
  let existing = 0;

  for (let offset = 0; offset < total; offset += batchSize) {
    const rows = await fetchSupabaseBatch(tableName, offset, offset + batchSize - 1);
    const transformedRows = rows.map((row) => transformRow(tableName, row, mappingStore));
    const result = runConvex("internal.migrations.importSupabaseBatch", {
      source: SOURCE_NAME,
      table: tableName,
      rows: transformedRows,
    });

    updateMappings(mappingStore, tableName, result);
    created += result.created || 0;
    existing += result.existing || 0;

    console.log(
      `[${tableName}] processed ${Math.min(offset + rows.length, total)}/${total} ` +
        `(created ${created}, existing ${existing})`,
    );
  }

  return { total, created, existing };
}

async function main() {
  const { batchSize, tables } = parseArgs(process.argv.slice(2));
  const mappingStore = Object.fromEntries(DEFAULT_TABLE_ORDER.map((tableName) => [tableName, new Map()]));

  console.log("Supabase to Convex backfill");
  console.log(`Root: ${ROOT}`);
  console.log(`Tables: ${tables.join(", ")}`);
  console.log(`Batch size: ${batchSize}`);
  console.log("");
  console.log("Prerequisite: run `./node_modules/.bin/convex.cmd dev --once` before this script so the migration functions are deployed.");

  const results = [];

  for (const tableName of tables) {
    if (!(tableName in mappingStore)) {
      throw new Error(`Unsupported table name: ${tableName}`);
    }
    results.push({
      table: tableName,
      ...(await migrateTable(tableName, batchSize, mappingStore)),
    });
  }

  const summary = runConvex("internal.migrations.getSupabaseBackfillSummary", {
    source: SOURCE_NAME,
  });

  console.log("\nMigration results");
  for (const result of results) {
    console.log(
      `- ${result.table}: source ${result.total}, created ${result.created}, existing ${result.existing}`,
    );
  }

  console.log("\nConvex summary");
  for (const table of summary.tables || []) {
    console.log(`- ${table.table}: convex ${table.convexCount}, mapped legacy ids ${table.mappedLegacyIds}`);
  }

  console.log(
    "\nNote: this backfill preserves legacy Supabase file and image URLs in Convex records. " +
      "It does not download and re-upload historical binaries into Convex storage.",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
