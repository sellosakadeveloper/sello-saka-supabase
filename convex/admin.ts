import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

function sortByCreatedAtDesc<T extends { created_at?: string | null; _creationTime: number }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : a._creationTime;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : b._creationTime;
    return bTime - aTime;
  });
}

function toOptionalString(value: string | null | undefined): string | undefined {
  return value && value.trim() ? value : undefined;
}

function optionalStringField<K extends string>(key: K, value: string | null | undefined): Partial<Record<K, string>> {
  const normalized = toOptionalString(value);
  return normalized === undefined ? {} : ({ [key]: normalized } as Partial<Record<K, string>>);
}

async function deleteStoredFile(ctx: { storage: { delete: (storageId: string) => Promise<void> } }, storageId?: string | null) {
  if (!storageId) {
    return;
  }

  await ctx.storage.delete(storageId);
}

export const listApplications = query({
  args: {},
  handler: async (ctx) => {
    const applications = (await ctx.db.query("applications").collect()) as any[];
    return sortByCreatedAtDesc(applications).map((application) => ({
      id: String(application._id),
      survivor_name: application.survivor_name ?? null,
      guardian_name: application.guardian_name ?? null,
      email: application.email,
      phone: application.phone,
      date_of_birth: application.date_of_birth ?? null,
      address: application.address ?? null,
      diagnosis_details: application.diagnosis_details ?? null,
      treatment_details: application.treatment_details ?? null,
      current_challenges: application.current_challenges ?? null,
      programs_interested: application.programs_interested ?? [],
      status: application.status ?? "new",
      created_at: application.created_at ?? null,
      reviewed_by: application.reviewed_by ?? null,
      reviewed_at: application.reviewed_at ?? null,
    }));
  },
});

export const updateApplicationStatus = mutation({
  args: {
    id: v.id("applications"),
    status: v.string(),
    reviewed_by: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      reviewed_by: args.reviewed_by,
      reviewed_at: new Date().toISOString(),
    });
  },
});

export const listDonations = query({
  args: {},
  handler: async (ctx) => {
    const donations = (await ctx.db.query("donations").collect()) as any[];
    return sortByCreatedAtDesc(donations).map((donation) => ({
      id: String(donation._id),
      name: donation.name,
      email: donation.email,
      phone: donation.phone ?? null,
      amount: donation.amount,
      donation_type: donation.donation_type,
      payment_method: donation.payment_method ?? null,
      status: donation.status,
      created_at: donation.created_at ?? null,
      updated_at: donation.updated_at ?? null,
    }));
  },
});

export const listCompetitions = query({
  args: {},
  handler: async (ctx) => {
    const competitions = (await ctx.db.query("competitions").collect()) as any[];
    return sortByCreatedAtDesc(competitions).map((competition) => ({
      id: String(competition._id),
      title: competition.title,
      description: competition.description,
      prize: competition.prize ?? "",
      second_prize: competition.second_prize ?? null,
      third_prize: competition.third_prize ?? null,
      ticket_price: competition.ticket_price ?? competition.entry_fee ?? 0,
      max_tickets: competition.max_tickets ?? null,
      start_date: competition.start_date,
      end_date: competition.end_date,
      status: competition.status ?? (competition.is_active ? "active" : "draft"),
      badge_text: competition.badge_text ?? null,
      subtitle: competition.subtitle ?? null,
      hero_image_url: competition.hero_image_url ?? competition.image_url ?? null,
      hero_image_storage_id: competition.hero_image_storage_id ?? null,
      image_url: competition.image_url ?? competition.hero_image_url ?? null,
      image_storage_id: competition.image_storage_id ?? null,
      footer_text_1: competition.footer_text_1 ?? null,
      footer_text_2: competition.footer_text_2 ?? null,
      is_active: competition.is_active ?? null,
      created_at: competition.created_at ?? null,
      updated_at: competition.updated_at ?? null,
    }));
  },
});

export const createCompetition = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    prize: v.string(),
    second_prize: v.optional(v.string()),
    third_prize: v.optional(v.string()),
    ticket_price: v.number(),
    max_tickets: v.optional(v.number()),
    start_date: v.string(),
    end_date: v.string(),
    image_url: v.optional(v.string()),
    hero_image_storage_id: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("competitions", {
      title: args.title,
      description: args.description,
      prize: args.prize,
      second_prize: args.second_prize,
      third_prize: args.third_prize,
      ticket_price: args.ticket_price,
      entry_fee: args.ticket_price,
      max_tickets: args.max_tickets,
      start_date: args.start_date,
      end_date: args.end_date,
      image_url: args.image_url,
      hero_image_url: args.image_url,
      hero_image_storage_id: args.hero_image_storage_id,
      image_storage_id: args.image_storage_id,
      status: args.status ?? "active",
      is_active: (args.status ?? "active") === "active",
      created_at: now,
      updated_at: now,
    });
  },
});

export const updateCompetition = mutation({
  args: {
    id: v.id("competitions"),
    title: v.string(),
    description: v.string(),
    prize: v.string(),
    second_prize: v.optional(v.string()),
    third_prize: v.optional(v.string()),
    ticket_price: v.number(),
    max_tickets: v.optional(v.number()),
    start_date: v.string(),
    end_date: v.string(),
    image_url: v.optional(v.string()),
    hero_image_storage_id: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    const patch: Record<string, unknown> = {
      title: args.title,
      description: args.description,
      prize: args.prize,
      second_prize: args.second_prize,
      third_prize: args.third_prize,
      ticket_price: args.ticket_price,
      entry_fee: args.ticket_price,
      max_tickets: args.max_tickets,
      start_date: args.start_date,
      end_date: args.end_date,
      status: args.status,
      is_active: args.status ? args.status === "active" : undefined,
      updated_at: new Date().toISOString(),
    };

    if (args.image_url) {
      patch.image_url = args.image_url;
      patch.hero_image_url = args.image_url;
    }

    if (args.hero_image_storage_id) {
      patch.hero_image_storage_id = args.hero_image_storage_id;
    }

    if (args.image_storage_id) {
      patch.image_storage_id = args.image_storage_id;
    }

    await ctx.db.patch(args.id, patch);

    if (existing) {
      if (args.hero_image_storage_id && existing.hero_image_storage_id && existing.hero_image_storage_id !== args.hero_image_storage_id) {
        await deleteStoredFile(ctx, existing.hero_image_storage_id);
      }

      if (args.image_storage_id && existing.image_storage_id && existing.image_storage_id !== args.image_storage_id) {
        await deleteStoredFile(ctx, existing.image_storage_id);
      }
    }
  },
});

export const setCompetitionStatus = mutation({
  args: {
    id: v.id("competitions"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      is_active: args.status === "active",
      updated_at: new Date().toISOString(),
    });
  },
});

export const deleteCompetition = mutation({
  args: {
    id: v.id("competitions"),
  },
  handler: async (ctx, args) => {
    const competition = await ctx.db.get(args.id);
    const entries = (await ctx.db
      .query("competition_entries")
      .withIndex("by_competition", (q) => q.eq("competition_id", args.id))
      .collect()) as any[];

    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }

    const paymentRecords = (await ctx.db
      .query("payment_records")
      .collect()
      .then((records) => records.filter((record: any) => record.competition_id === args.id))) as any[];

    for (const paymentRecord of paymentRecords) {
      await ctx.db.delete(paymentRecord._id);
    }

    if (competition?.hero_image_storage_id) {
      await deleteStoredFile(ctx, competition.hero_image_storage_id);
    }

    if (competition?.image_storage_id && competition.image_storage_id !== competition.hero_image_storage_id) {
      await deleteStoredFile(ctx, competition.image_storage_id);
    }

    await ctx.db.delete(args.id);
  },
});

export const listCompetitionEntriesByCompetition = query({
  args: {
    competitionId: v.id("competitions"),
  },
  handler: async (ctx, args) => {
    const entries = (await ctx.db
      .query("competition_entries")
      .withIndex("by_competition", (q) => q.eq("competition_id", args.competitionId))
      .collect()) as any[];

    return sortByCreatedAtDesc(entries).map((entry) => ({
      id: String(entry._id),
      competition_id: entry.competition_id ? String(entry.competition_id) : null,
      name: entry.name ?? entry.full_name ?? "",
      full_name: entry.full_name ?? entry.name ?? null,
      email: entry.email,
      phone: entry.phone,
      ticket_number: entry.ticket_number ?? null,
      proof_of_payment_url: entry.proof_of_payment_url ?? null,
      payment_method: entry.payment_method ?? null,
      payment_reference: entry.payment_reference ?? null,
      payment_status: entry.payment_status ?? null,
      status: entry.status ?? "pending",
      ticket_emailed: entry.ticket_emailed ?? null,
      age: entry.age ?? null,
      story: entry.story ?? null,
      media_url: entry.media_url ?? null,
      created_at: entry.created_at ?? null,
      updated_at: entry.updated_at ?? null,
    }));
  },
});

export const updateCompetitionEntryStatus = mutation({
  args: {
    id: v.id("competition_entries"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updated_at: new Date().toISOString(),
    });
  },
});

export const listContactMessages = query({
  args: {},
  handler: async (ctx) => {
    const messages = (await ctx.db.query("contact_messages").collect()) as any[];
    return sortByCreatedAtDesc(messages).map((message) => ({
      id: String(message._id),
      name: message.name,
      email: message.email,
      phone: message.phone ?? null,
      subject: message.subject,
      message: message.message,
      created_at: message.created_at ?? null,
    }));
  },
});

export const deleteContactMessage = mutation({
  args: {
    id: v.id("contact_messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const listImpactMetrics = query({
  args: {},
  handler: async (ctx) => {
    const metrics = (await ctx.db.query("impact_metrics").collect()) as any[];
    return [...metrics]
      .sort((a, b) => {
        const yearA = a.year ?? 0;
        const yearB = b.year ?? 0;
        if (yearA !== yearB) return yearB - yearA;
        return (b.updated_at ? new Date(b.updated_at).getTime() : b._creationTime) -
          (a.updated_at ? new Date(a.updated_at).getTime() : a._creationTime);
      })
      .map((metric) => ({
        id: String(metric._id),
        metric_name: metric.metric_name,
        metric_value: metric.metric_value,
        metric_type: metric.metric_type ?? null,
        year: metric.year ?? new Date().getFullYear(),
        created_at: metric.created_at ?? null,
        updated_at: metric.updated_at ?? null,
      }));
  },
});

export const createImpactMetric = mutation({
  args: {
    metric_name: v.string(),
    metric_value: v.number(),
    metric_type: v.string(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("impact_metrics", {
      metric_name: args.metric_name,
      metric_value: args.metric_value,
      metric_type: args.metric_type,
      year: args.year,
      created_at: now,
      updated_at: now,
    });
  },
});

export const deleteImpactMetric = mutation({
  args: {
    id: v.id("impact_metrics"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const listImpactStories = query({
  args: {},
  handler: async (ctx) => {
    const stories = (await ctx.db.query("impact_stories").collect()) as any[];
    return sortByCreatedAtDesc(stories).map((story) => ({
      id: String(story._id),
      title: story.title,
      content: story.content,
      image_url: story.image_url ?? null,
      category: story.category ?? null,
      quote: story.quote ?? null,
      quote_author: story.quote_author ?? null,
      impact_summary: story.impact_summary ?? null,
      is_active: story.is_active ?? false,
      created_at: story.created_at ?? null,
      image_storage_id: story.image_storage_id ?? null,
    }));
  },
});

export const createImpactStory = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    image_url: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
    category: v.optional(v.string()),
    quote: v.optional(v.string()),
    quote_author: v.optional(v.string()),
    impact_summary: v.optional(v.string()),
    is_active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("impact_stories", {
      title: args.title,
      content: args.content,
      ...optionalStringField("image_url", args.image_url),
      ...optionalStringField("image_storage_id", args.image_storage_id),
      ...optionalStringField("category", args.category),
      ...optionalStringField("quote", args.quote),
      ...optionalStringField("quote_author", args.quote_author),
      ...optionalStringField("impact_summary", args.impact_summary),
      is_active: args.is_active,
      created_at: now,
    });
  },
});

export const updateImpactStory = mutation({
  args: {
    id: v.id("impact_stories"),
    title: v.string(),
    content: v.string(),
    image_url: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
    category: v.optional(v.string()),
    quote: v.optional(v.string()),
    quote_author: v.optional(v.string()),
    impact_summary: v.optional(v.string()),
    is_active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    const patch: Record<string, unknown> = {
      title: args.title,
      content: args.content,
      is_active: args.is_active,
      ...optionalStringField("category", args.category),
      ...optionalStringField("quote", args.quote),
      ...optionalStringField("quote_author", args.quote_author),
      ...optionalStringField("impact_summary", args.impact_summary),
    };

    if (args.image_url) {
      patch.image_url = args.image_url;
    }

    if (args.image_storage_id) {
      patch.image_storage_id = args.image_storage_id;
    }

    await ctx.db.patch(args.id, patch);

    if (existing && args.image_storage_id && existing.image_storage_id && existing.image_storage_id !== args.image_storage_id) {
      await deleteStoredFile(ctx, existing.image_storage_id);
    }
  },
});

export const deleteImpactStory = mutation({
  args: {
    id: v.id("impact_stories"),
  },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.id);
    if (story?.image_storage_id) {
      await deleteStoredFile(ctx, story.image_storage_id);
    }
    await ctx.db.delete(args.id);
  },
});

export const listResources = query({
  args: {},
  handler: async (ctx) => {
    const resources = (await ctx.db.query("resources").collect()) as any[];
    return sortByCreatedAtDesc(resources).map((resource) => ({
      id: String(resource._id),
      title: resource.title,
      summary: resource.summary ?? null,
      type: resource.type,
      category: resource.category ?? null,
      file_url: resource.file_url ?? null,
      file_storage_id: resource.file_storage_id ?? null,
      created_at: resource.created_at ?? null,
    }));
  },
});

export const createResource = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    type: v.string(),
    category: v.optional(v.string()),
    file_url: v.optional(v.string()),
    file_storage_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("resources", {
      title: args.title,
      summary: args.summary,
      type: args.type,
      ...optionalStringField("category", args.category),
      ...optionalStringField("file_url", args.file_url),
      ...optionalStringField("file_storage_id", args.file_storage_id),
      created_at: now,
      updated_at: now,
    });
  },
});

export const updateResource = mutation({
  args: {
    id: v.id("resources"),
    title: v.string(),
    summary: v.string(),
    type: v.string(),
    category: v.optional(v.string()),
    file_url: v.optional(v.string()),
    file_storage_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    const patch: Record<string, unknown> = {
      title: args.title,
      summary: args.summary,
      type: args.type,
      updated_at: new Date().toISOString(),
      ...optionalStringField("category", args.category),
    };

    if (args.file_url) {
      patch.file_url = args.file_url;
    }

    if (args.file_storage_id) {
      patch.file_storage_id = args.file_storage_id;
    }

    await ctx.db.patch(args.id, patch);

    if (existing && args.file_storage_id && existing.file_storage_id && existing.file_storage_id !== args.file_storage_id) {
      await deleteStoredFile(ctx, existing.file_storage_id);
    }
  },
});

export const deleteResource = mutation({
  args: {
    id: v.id("resources"),
  },
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.id);
    if (resource?.file_storage_id) {
      await deleteStoredFile(ctx, resource.file_storage_id);
    }
    await ctx.db.delete(args.id);
  },
});

export const listTeams = query({
  args: {},
  handler: async (ctx) => {
    const teams = (await ctx.db.query("teams").collect()) as any[];
    return sortByCreatedAtDesc(teams).map((team) => ({
      id: String(team._id),
      name: team.name,
      role: team.role,
      bio: team.bio ?? null,
      image_url: team.image_url ?? null,
      image_storage_id: team.image_storage_id ?? null,
      linkedin_url: team.linkedin_url ?? null,
      email: team.email ?? null,
      status: team.status ?? "active",
      created_at: team.created_at ?? null,
    }));
  },
});

export const createTeam = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    bio: v.string(),
    image_url: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
    linkedin_url: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("teams", {
      name: args.name,
      role: args.role,
      bio: args.bio,
      ...optionalStringField("image_url", args.image_url),
      ...optionalStringField("image_storage_id", args.image_storage_id),
      ...optionalStringField("linkedin_url", args.linkedin_url),
      ...optionalStringField("email", args.email),
      status: "active",
      created_at: now,
    });
  },
});

export const updateTeam = mutation({
  args: {
    id: v.id("teams"),
    name: v.string(),
    role: v.string(),
    bio: v.string(),
    image_url: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
    linkedin_url: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    const patch: Record<string, unknown> = {
      name: args.name,
      role: args.role,
      bio: args.bio,
      ...optionalStringField("linkedin_url", args.linkedin_url),
      ...optionalStringField("email", args.email),
    };

    if (args.image_url) {
      patch.image_url = args.image_url;
    }

    if (args.image_storage_id) {
      patch.image_storage_id = args.image_storage_id;
    }

    await ctx.db.patch(args.id, patch);

    if (existing && args.image_storage_id && existing.image_storage_id && existing.image_storage_id !== args.image_storage_id) {
      await deleteStoredFile(ctx, existing.image_storage_id);
    }
  },
});

export const deleteTeam = mutation({
  args: {
    id: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.id);
    if (team?.image_storage_id) {
      await deleteStoredFile(ctx, team.image_storage_id);
    }
    await ctx.db.delete(args.id);
  },
});
