import { query } from "./_generated/server";
import { v } from "convex/values";

function sortByCreatedAtDesc<T extends { created_at?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

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
      created_at: resource.created_at ?? null,
    }));
  },
});

export const listActiveImpactStories = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const stories = (await ctx.db.query("impact_stories").collect()) as any[];
    const activeStories = sortByCreatedAtDesc(stories).filter((story) => story.is_active);
    const limited = typeof args.limit === "number" ? activeStories.slice(0, args.limit) : activeStories;

    return limited.map((story) => ({
      id: String(story._id),
      title: story.title,
      excerpt: story.excerpt ?? null,
      content: story.content,
      author: story.author ?? null,
      category: story.category ?? null,
      date: story.date ?? null,
      image_url: story.image_url ?? null,
      is_featured: story.is_featured ?? null,
      quote: story.quote ?? null,
      quote_author: story.quote_author ?? null,
      impact_summary: story.impact_summary ?? null,
      is_active: story.is_active ?? null,
      created_at: story.created_at ?? null,
    }));
  },
});

export const listActiveTeams = query({
  args: {},
  handler: async (ctx) => {
    const teams = (await ctx.db.query("teams").collect()) as any[];
    return sortByCreatedAtDesc(teams)
      .filter((team) => team.status === "active")
      .map((team) => ({
        id: String(team._id),
        name: team.name,
        role: team.role,
        bio: team.bio ?? null,
        image_url: team.image_url ?? null,
        linkedin_url: team.linkedin_url ?? null,
        email: team.email ?? null,
        status: team.status ?? null,
        created_at: team.created_at ?? null,
      }))
      .reverse();
  },
});

export const getActiveCompetition = query({
  args: {},
  handler: async (ctx) => {
    const competitions = (await ctx.db.query("competitions").collect()) as any[];
    const activeCompetition = sortByCreatedAtDesc(competitions).find(
      (competition) => competition.status === "active" || competition.is_active,
    );

    if (!activeCompetition) {
      return null;
    }

    return {
      id: String(activeCompetition._id),
      title: activeCompetition.title,
      description: activeCompetition.description,
      prize_first: activeCompetition.prize ?? null,
      prize_second: activeCompetition.second_prize ?? null,
      prize_third: activeCompetition.third_prize ?? null,
      entry_fee: activeCompetition.ticket_price ?? activeCompetition.entry_fee ?? 0,
      end_date: activeCompetition.end_date,
      hero_image_url: activeCompetition.hero_image_url ?? activeCompetition.image_url ?? null,
      badge_text: activeCompetition.badge_text ?? null,
      subtitle: activeCompetition.subtitle ?? null,
      footer_text_1: activeCompetition.footer_text_1 ?? null,
      footer_text_2: activeCompetition.footer_text_2 ?? null,
    };
  },
});
