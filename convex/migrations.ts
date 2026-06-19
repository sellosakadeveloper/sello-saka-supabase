import type { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";

const supportedTableNames = [
  "applications",
  "competitions",
  "competition_entries",
  "contact_messages",
  "contact_submissions",
  "donations",
  "impact_stories",
  "impact_metrics",
  "payment_records",
  "resources",
  "team_members",
  "teams",
  "user_roles",
] as const;

type SupportedTableName = (typeof supportedTableNames)[number];

type LegacyImportMapping = {
  _id: Id<"legacy_import_mappings">;
  _creationTime: number;
  source: string;
  table_name: string;
  legacy_id: string;
  convex_id: string;
  created_at: string;
};

type GenericSupabaseRow = Record<string, unknown> & { id: string };

function normalizeOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeOptionalBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function normalizeOptionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
  return normalized.length > 0 ? normalized : [];
}

function normalizeDonationId(value: unknown): Id<"donations"> | undefined {
  return normalizeOptionalString(value) as Id<"donations"> | undefined;
}

function normalizeCompetitionId(value: unknown): Id<"competitions"> | undefined {
  return normalizeOptionalString(value) as Id<"competitions"> | undefined;
}

function normalizeCompetitionEntryId(value: unknown): Id<"competition_entries"> | undefined {
  return normalizeOptionalString(value) as Id<"competition_entries"> | undefined;
}

async function getExistingImportMapping(
  ctx: MutationCtx | QueryCtx,
  source: string,
  tableName: SupportedTableName,
  legacyId: string,
): Promise<LegacyImportMapping | null> {
  return (await ctx.db
    .query("legacy_import_mappings")
    .withIndex("by_source_and_table_name_and_legacy_id", (q) =>
      q.eq("source", source).eq("table_name", tableName).eq("legacy_id", legacyId),
    )
    .unique()) as LegacyImportMapping | null;
}

async function recordImportMapping(
  ctx: MutationCtx,
  source: string,
  tableName: SupportedTableName,
  legacyId: string,
  convexId: string,
) {
  const existing = await getExistingImportMapping(ctx, source, tableName, legacyId);
  if (existing) {
    if (existing.convex_id !== convexId) {
      await ctx.db.patch(existing._id, {
        convex_id: convexId,
      });
    }
    return existing._id;
  }

  return await ctx.db.insert("legacy_import_mappings", {
    source,
    table_name: tableName,
    legacy_id: legacyId,
    convex_id: convexId,
    created_at: new Date().toISOString(),
  });
}

async function insertSupabaseRow(ctx: MutationCtx, tableName: SupportedTableName, row: GenericSupabaseRow): Promise<string> {
  switch (tableName) {
    case "applications":
      return String(
        await ctx.db.insert("applications", {
          survivor_name: normalizeOptionalString(row.survivor_name),
          date_of_birth: normalizeOptionalString(row.date_of_birth),
          guardian_name: normalizeOptionalString(row.guardian_name),
          email: String(row.email),
          phone: String(row.phone),
          address: normalizeOptionalString(row.address),
          diagnosis_details: normalizeOptionalString(row.diagnosis_details),
          treatment_details: normalizeOptionalString(row.treatment_details),
          current_challenges: normalizeOptionalString(row.current_challenges),
          programs_interested: normalizeOptionalStringArray(row.programs_interested),
          consent: normalizeOptionalBoolean(row.consent),
          status: normalizeOptionalString(row.status),
          reviewed_by: normalizeOptionalString(row.reviewed_by),
          reviewed_at: normalizeOptionalString(row.reviewed_at),
          created_at: normalizeOptionalString(row.created_at),
        }),
      );
    case "competitions":
      return String(
        await ctx.db.insert("competitions", {
          title: String(row.title),
          description: String(row.description),
          prize: normalizeOptionalString(row.prize),
          second_prize: normalizeOptionalString(row.second_prize),
          third_prize: normalizeOptionalString(row.third_prize),
          ticket_price: normalizeOptionalNumber(row.ticket_price),
          entry_fee: normalizeOptionalNumber(row.entry_fee),
          max_tickets: normalizeOptionalNumber(row.max_tickets),
          start_date: String(row.start_date),
          end_date: String(row.end_date),
          status: normalizeOptionalString(row.status),
          badge_text: normalizeOptionalString(row.badge_text),
          subtitle: normalizeOptionalString(row.subtitle),
          hero_image_url: normalizeOptionalString(row.hero_image_url),
          image_url: normalizeOptionalString(row.image_url),
          footer_text_1: normalizeOptionalString(row.footer_text_1),
          footer_text_2: normalizeOptionalString(row.footer_text_2),
          is_active: normalizeOptionalBoolean(row.is_active),
          created_at: normalizeOptionalString(row.created_at),
          updated_at: normalizeOptionalString(row.updated_at),
        }),
      );
    case "competition_entries":
      return String(
        await ctx.db.insert("competition_entries", {
          competition_id: normalizeCompetitionId(row.competition_id),
          name: normalizeOptionalString(row.name),
          full_name: normalizeOptionalString(row.full_name),
          email: String(row.email),
          phone: String(row.phone),
          ticket_number: normalizeOptionalString(row.ticket_number),
          proof_of_payment_url: normalizeOptionalString(row.proof_of_payment_url),
          payment_method: normalizeOptionalString(row.payment_method),
          payment_reference: normalizeOptionalString(row.payment_reference),
          payment_status: normalizeOptionalString(row.payment_status),
          ticket_emailed: normalizeOptionalBoolean(row.ticket_emailed),
          status: normalizeOptionalString(row.status),
          age: normalizeOptionalNumber(row.age),
          story: normalizeOptionalString(row.story),
          media_url: normalizeOptionalString(row.media_url),
          created_at: normalizeOptionalString(row.created_at),
          updated_at: normalizeOptionalString(row.updated_at),
        }),
      );
    case "contact_messages":
      return String(
        await ctx.db.insert("contact_messages", {
          name: String(row.name),
          email: String(row.email),
          phone: normalizeOptionalString(row.phone),
          subject: String(row.subject),
          message: String(row.message),
          created_at: normalizeOptionalString(row.created_at),
        }),
      );
    case "contact_submissions":
      return String(
        await ctx.db.insert("contact_submissions", {
          name: String(row.name),
          email: String(row.email),
          subject: String(row.subject),
          message: String(row.message),
          status: normalizeOptionalString(row.status),
          created_at: normalizeOptionalString(row.created_at),
        }),
      );
    case "donations":
      return String(
        await ctx.db.insert("donations", {
          name: String(row.name),
          email: String(row.email),
          phone: normalizeOptionalString(row.phone),
          amount: Number(row.amount),
          donation_type: String(row.donation_type),
          payment_method: normalizeOptionalString(row.payment_method),
          status: String(row.status),
          created_at: normalizeOptionalString(row.created_at),
          updated_at: normalizeOptionalString(row.updated_at),
        }),
      );
    case "impact_stories":
      return String(
        await ctx.db.insert("impact_stories", {
          title: String(row.title),
          excerpt: normalizeOptionalString(row.excerpt),
          content: String(row.content),
          author: normalizeOptionalString(row.author),
          category: normalizeOptionalString(row.category),
          date: normalizeOptionalString(row.date),
          image_url: normalizeOptionalString(row.image_url),
          is_featured: normalizeOptionalBoolean(row.is_featured),
          quote: normalizeOptionalString(row.quote),
          quote_author: normalizeOptionalString(row.quote_author),
          impact_summary: normalizeOptionalString(row.impact_summary),
          is_active: normalizeOptionalBoolean(row.is_active),
          created_at: normalizeOptionalString(row.created_at),
        }),
      );
    case "impact_metrics":
      return String(
        await ctx.db.insert("impact_metrics", {
          metric_name: String(row.metric_name),
          metric_value: Number(row.metric_value),
          metric_type: normalizeOptionalString(row.metric_type),
          year: normalizeOptionalNumber(row.year),
          created_at: normalizeOptionalString(row.created_at),
          updated_at: normalizeOptionalString(row.updated_at),
        }),
      );
    case "payment_records":
      return String(
        await ctx.db.insert("payment_records", {
          payment_reference: String(row.payment_reference),
          provider: String(row.provider),
          status: String(row.status),
          purpose: String(row.purpose),
          amount: Number(row.amount),
          currency: String(row.currency),
          payer_name: String(row.payer_name),
          payer_email: String(row.payer_email),
          payer_phone: normalizeOptionalString(row.payer_phone),
          donation_id: normalizeDonationId(row.donation_id),
          competition_entry_id: normalizeCompetitionEntryId(row.competition_entry_id),
          competition_id: normalizeCompetitionId(row.competition_id),
          provider_payment_id: normalizeOptionalString(row.provider_payment_id),
          provider_status: normalizeOptionalString(row.provider_status),
          provider_payload: row.provider_payload ?? undefined,
          return_url: normalizeOptionalString(row.return_url),
          cancel_url: normalizeOptionalString(row.cancel_url),
          verified_at: normalizeOptionalString(row.verified_at),
          completed_at: normalizeOptionalString(row.completed_at),
          created_at: normalizeOptionalString(row.created_at),
          updated_at: normalizeOptionalString(row.updated_at),
        }),
      );
    case "resources":
      return String(
        await ctx.db.insert("resources", {
          title: String(row.title),
          summary: normalizeOptionalString(row.summary),
          type: String(row.type),
          category: normalizeOptionalString(row.category),
          file_url: normalizeOptionalString(row.file_url),
          created_at: normalizeOptionalString(row.created_at),
          updated_at: normalizeOptionalString(row.updated_at),
        }),
      );
    case "team_members":
      return String(
        await ctx.db.insert("team_members", {
          name: String(row.name),
          role: String(row.role),
          bio: normalizeOptionalString(row.bio),
          image_url: normalizeOptionalString(row.image_url),
          order_index: normalizeOptionalNumber(row.order_index),
          social_links: row.social_links ?? undefined,
          created_at: normalizeOptionalString(row.created_at),
        }),
      );
    case "teams":
      return String(
        await ctx.db.insert("teams", {
          name: String(row.name),
          role: String(row.role),
          bio: normalizeOptionalString(row.bio),
          image_url: normalizeOptionalString(row.image_url),
          linkedin_url: normalizeOptionalString(row.linkedin_url),
          email: normalizeOptionalString(row.email),
          status: normalizeOptionalString(row.status),
          created_at: normalizeOptionalString(row.created_at),
        }),
      );
    case "user_roles":
      return String(
        await ctx.db.insert("user_roles", {
          user_id: normalizeOptionalString(row.user_id),
          role: String(row.role),
          created_at: normalizeOptionalString(row.created_at),
        }),
      );
    default: {
      const exhaustiveCheck: never = tableName;
      throw new Error(`Unsupported table: ${exhaustiveCheck}`);
    }
  }
}

async function countTable(ctx: QueryCtx, tableName: SupportedTableName): Promise<number> {
  switch (tableName) {
    case "applications":
      return (await ctx.db.query("applications").collect()).length;
    case "competitions":
      return (await ctx.db.query("competitions").collect()).length;
    case "competition_entries":
      return (await ctx.db.query("competition_entries").collect()).length;
    case "contact_messages":
      return (await ctx.db.query("contact_messages").collect()).length;
    case "contact_submissions":
      return (await ctx.db.query("contact_submissions").collect()).length;
    case "donations":
      return (await ctx.db.query("donations").collect()).length;
    case "impact_stories":
      return (await ctx.db.query("impact_stories").collect()).length;
    case "impact_metrics":
      return (await ctx.db.query("impact_metrics").collect()).length;
    case "payment_records":
      return (await ctx.db.query("payment_records").collect()).length;
    case "resources":
      return (await ctx.db.query("resources").collect()).length;
    case "team_members":
      return (await ctx.db.query("team_members").collect()).length;
    case "teams":
      return (await ctx.db.query("teams").collect()).length;
    case "user_roles":
      return (await ctx.db.query("user_roles").collect()).length;
    default: {
      const exhaustiveCheck: never = tableName;
      throw new Error(`Unsupported table: ${exhaustiveCheck}`);
    }
  }
}

export const importSupabaseBatch = internalMutation({
  args: {
    source: v.string(),
    table: v.union(
      v.literal("applications"),
      v.literal("competitions"),
      v.literal("competition_entries"),
      v.literal("contact_messages"),
      v.literal("contact_submissions"),
      v.literal("donations"),
      v.literal("impact_stories"),
      v.literal("impact_metrics"),
      v.literal("payment_records"),
      v.literal("resources"),
      v.literal("team_members"),
      v.literal("teams"),
      v.literal("user_roles"),
    ),
    rows: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    let created = 0;
    let existing = 0;
    const mappings: Array<{ legacyId: string; convexId: string; status: "created" | "existing" }> = [];

    for (const candidate of args.rows) {
      const row = candidate as GenericSupabaseRow;
      if (!row.id || typeof row.id !== "string") {
        throw new Error(`Missing legacy id for ${args.table} import row`);
      }

      const existingMapping = await getExistingImportMapping(ctx, args.source, args.table, row.id);
      if (existingMapping) {
        existing += 1;
        mappings.push({
          legacyId: row.id,
          convexId: existingMapping.convex_id,
          status: "existing",
        });
        continue;
      }

      const convexId = await insertSupabaseRow(ctx, args.table, row);
      await recordImportMapping(ctx, args.source, args.table, row.id, convexId);
      created += 1;
      mappings.push({
        legacyId: row.id,
        convexId,
        status: "created",
      });
    }

    return {
      table: args.table,
      processed: args.rows.length,
      created,
      existing,
      mappings,
    };
  },
});

export const getSupabaseBackfillSummary = internalQuery({
  args: {
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const tableSummaries = await Promise.all(
      supportedTableNames.map(async (tableName) => {
        const imported = await ctx.db
          .query("legacy_import_mappings")
          .withIndex("by_source_and_table_name", (q) => q.eq("source", args.source).eq("table_name", tableName))
          .collect();

        return {
          table: tableName,
          convexCount: await countTable(ctx, tableName),
          mappedLegacyIds: imported.length,
        };
      }),
    );

    return {
      source: args.source,
      tables: tableSummaries,
    };
  },
});
