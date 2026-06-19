import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submitApplication = mutation({
  args: {
    survivor_name: v.optional(v.string()),
    date_of_birth: v.optional(v.string()),
    guardian_name: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    address: v.optional(v.string()),
    diagnosis_details: v.optional(v.string()),
    treatment_details: v.optional(v.string()),
    current_challenges: v.optional(v.string()),
    programs_interested: v.optional(v.array(v.string())),
    consent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const createdAt = new Date().toISOString();
    return await ctx.db.insert("applications", {
      ...args,
      status: "new",
      created_at: createdAt,
    });
  },
});

export const submitContactMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const createdAt = new Date().toISOString();
    return await ctx.db.insert("contact_messages", {
      ...args,
      created_at: createdAt,
    });
  },
});
