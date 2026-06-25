import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  applications: defineTable({
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
    status: v.optional(v.string()),
    reviewed_by: v.optional(v.string()),
    reviewed_at: v.optional(v.string()),
    created_at: v.optional(v.string()),
  }),

  competitions: defineTable({
    title: v.string(),
    description: v.string(),
    prize: v.optional(v.string()),
    second_prize: v.optional(v.string()),
    third_prize: v.optional(v.string()),
    ticket_price: v.optional(v.number()),
    entry_fee: v.optional(v.number()),
    max_tickets: v.optional(v.number()),
    start_date: v.string(),
    end_date: v.string(),
    status: v.optional(v.string()),
    badge_text: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    hero_image_url: v.optional(v.string()),
    hero_image_storage_id: v.optional(v.string()),
    image_url: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
    footer_text_1: v.optional(v.string()),
    footer_text_2: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  }).index("by_status", ["status"]),

  competition_entries: defineTable({
    competition_id: v.optional(v.id("competitions")),
    name: v.optional(v.string()),
    full_name: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    ticket_number: v.optional(v.string()),
    ticket_pdf_storage_id: v.optional(v.id("_storage")),
    proof_of_payment_url: v.optional(v.string()),
    payment_method: v.optional(v.string()),
    payment_reference: v.optional(v.string()),
    payment_status: v.optional(v.string()),
    ticket_emailed: v.optional(v.boolean()),
    status: v.optional(v.string()),
    age: v.optional(v.number()),
    story: v.optional(v.string()),
    media_url: v.optional(v.string()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  }).index("by_competition", ["competition_id"]).index("by_payment_reference", ["payment_reference"]),

  contact_messages: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
    created_at: v.optional(v.string()),
  }).index("by_created_at", ["created_at"]),

  contact_submissions: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.optional(v.string()),
    created_at: v.optional(v.string()),
  }).index("by_created_at", ["created_at"]),

  donations: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    amount: v.number(),
    donation_type: v.string(),
    payment_method: v.optional(v.string()),
    status: v.string(),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  }),

  impact_stories: defineTable({
    title: v.string(),
    excerpt: v.optional(v.string()),
    content: v.string(),
    author: v.optional(v.string()),
    category: v.optional(v.string()),
    date: v.optional(v.string()),
    image_url: v.optional(v.string()),
    is_featured: v.optional(v.boolean()),
    quote: v.optional(v.string()),
    quote_author: v.optional(v.string()),
    impact_summary: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    created_at: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
  }).index("by_active", ["is_active"]).index("by_created_at", ["created_at"]),

  impact_metrics: defineTable({
    metric_name: v.string(),
    metric_value: v.number(),
    metric_type: v.optional(v.string()),
    year: v.optional(v.number()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  }),

  payment_records: defineTable({
    payment_reference: v.string(),
    idempotency_key: v.optional(v.string()),
    provider: v.string(),
    status: v.string(),
    purpose: v.string(),
    purpose_context: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    payer_name: v.string(),
    payer_email: v.string(),
    payer_phone: v.optional(v.string()),
    donation_id: v.optional(v.id("donations")),
    competition_entry_id: v.optional(v.id("competition_entries")),
    competition_id: v.optional(v.id("competitions")),
    provider_payment_id: v.optional(v.string()),
    provider_status: v.optional(v.string()),
    provider_payload: v.optional(v.any()),
    return_url: v.optional(v.string()),
    cancel_url: v.optional(v.string()),
    verified_at: v.optional(v.string()),
    completed_at: v.optional(v.string()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  })
    .index("by_payment_reference", ["payment_reference"])
    .index("by_idempotency_key", ["idempotency_key"]),

  resources: defineTable({
    title: v.string(),
    summary: v.optional(v.string()),
    type: v.string(),
    category: v.optional(v.string()),
    file_url: v.optional(v.string()),
    file_storage_id: v.optional(v.string()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  }).index("by_created_at", ["created_at"]),

  team_members: defineTable({
    name: v.string(),
    role: v.string(),
    bio: v.optional(v.string()),
    image_url: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
    order_index: v.optional(v.number()),
    social_links: v.optional(v.any()),
    created_at: v.optional(v.string()),
  }).index("by_order_index", ["order_index"]),

  teams: defineTable({
    name: v.string(),
    role: v.string(),
    bio: v.optional(v.string()),
    image_url: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
    linkedin_url: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.optional(v.string()),
    created_at: v.optional(v.string()),
  }).index("by_status", ["status"]).index("by_created_at", ["created_at"]),

  managed_users: defineTable({
    email: v.string(),
    auth_user_id: v.optional(v.id("users")),
    status: v.string(),
    created_by_auth_user_id: v.optional(v.id("users")),
    setup_token_hash: v.optional(v.string()),
    setup_token_expires_at: v.optional(v.number()),
    last_setup_email_sent_at: v.optional(v.string()),
    activated_at: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_auth_user_id", ["auth_user_id"])
    .index("by_status", ["status"])
    .index("by_setup_token_hash", ["setup_token_hash"]),

  user_roles: defineTable({
    user_id: v.optional(v.string()),
    auth_user_id: v.optional(v.id("users")),
    email: v.optional(v.string()),
    role: v.string(),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  })
    .index("by_user_id", ["user_id"])
    .index("by_auth_user_id", ["auth_user_id"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  legacy_import_mappings: defineTable({
    source: v.string(),
    table_name: v.string(),
    legacy_id: v.string(),
    convex_id: v.string(),
    created_at: v.string(),
  })
    .index("by_source_and_table_name_and_legacy_id", ["source", "table_name", "legacy_id"])
    .index("by_source_and_table_name", ["source", "table_name"]),
});
