import { createAccount, modifyAccountCredentials } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { sendAccountSetupEmail } from "./authEmail";
import {
  BOOTSTRAP_ADMIN_EMAIL,
  SETUP_TOKEN_TTL_MS,
  generateSetupToken,
  getViewerContext,
  hashSetupToken,
  normalizeEmail,
  normalizeRole,
  requireAdmin,
} from "./authHelpers";

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

export const getBootstrapStatus = query({
  args: {},
  handler: async (ctx) => {
    const bootstrapManagedUser = await ctx.db
      .query("managed_users")
      .withIndex("by_email", (q) => q.eq("email", BOOTSTRAP_ADMIN_EMAIL))
      .unique();
    const bootstrapAccount = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) => q.eq("provider", "password").eq("providerAccountId", BOOTSTRAP_ADMIN_EMAIL))
      .unique();

    return {
      requiresBootstrap: !bootstrapAccount,
      bootstrapEmail: BOOTSTRAP_ADMIN_EMAIL,
    };
  },
});

export const getAdminSession = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerContext(ctx as any);
    if (!viewer) {
      return null;
    }

    return {
      email: viewer.email,
      isAdmin: viewer.isAdmin,
      isBootstrapAdmin: viewer.isBootstrapAdmin,
      authUserId: String(viewer.authUserId),
      reviewedByUserId: String(viewer.authUserId),
      status: viewer.managedUser?.status ?? (viewer.isBootstrapAdmin ? "active" : null),
      role:
        viewer.roleRecords.find((role) => role.role === "admin")?.role ??
        (viewer.isBootstrapAdmin ? "admin" : viewer.roleRecords[0]?.role ?? null),
    };
  },
});

export const ensureViewerRecord = mutation({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerContext(ctx as any);
    if (!viewer) {
      throw new Error("Not authenticated");
    }

    const now = new Date().toISOString();
    const managedUser = viewer.managedUser;

    if (managedUser) {
      const patch: Record<string, unknown> = {
        auth_user_id: viewer.authUserId,
        updated_at: now,
      };
      if (managedUser.status === "invited") {
        patch.status = "active";
        patch.activated_at = managedUser.activated_at ?? now;
      }
      await ctx.db.patch(managedUser._id, patch);
    } else if (viewer.isBootstrapAdmin) {
      await ctx.db.insert("managed_users", {
        email: viewer.email,
        auth_user_id: viewer.authUserId,
        status: "active",
        created_by_auth_user_id: viewer.authUserId,
        activated_at: now,
        created_at: now,
        updated_at: now,
      });
    }

    const roleRecords = viewer.roleRecords;
    if (viewer.isBootstrapAdmin && !roleRecords.some((role) => role.role === "admin")) {
      await ctx.db.insert("user_roles", {
        user_id: String(viewer.authUserId),
        auth_user_id: viewer.authUserId,
        email: viewer.email,
        role: "admin",
        created_at: now,
        updated_at: now,
      });
    }

    for (const roleRecord of roleRecords) {
      await ctx.db.patch(roleRecord._id, {
        user_id: String(viewer.authUserId),
        auth_user_id: viewer.authUserId,
        email: viewer.email,
        updated_at: now,
      });
    }

    return { success: true };
  },
});

export const getCurrentAdminStateInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await getViewerContext(ctx as any);
  },
});

export const getManagedUserByEmailInternal = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("managed_users")
      .withIndex("by_email", (q) => q.eq("email", normalizeEmail(args.email)))
      .unique();
  },
});

export const getPasswordAccountByEmailInternal = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "password").eq("providerAccountId", normalizeEmail(args.email)),
      )
      .unique();
  },
});

export const getRoleByEmailInternal = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const roleRecord = await ctx.db
      .query("user_roles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    return roleRecord?.role ?? (email === BOOTSTRAP_ADMIN_EMAIL ? "admin" : "staff");
  },
});

export const upsertManagedUserInviteInternal = internalMutation({
  args: {
    email: v.string(),
    role: v.string(),
    status: v.string(),
    invitedByAuthUserId: v.optional(v.id("users")),
    setupTokenHash: v.string(),
    setupTokenExpiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const email = normalizeEmail(args.email);
    const role = normalizeRole(args.role);
    const existingManagedUser = await ctx.db
      .query("managed_users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    let authUserId = existingManagedUser?.auth_user_id;
    if (existingManagedUser) {
      await ctx.db.patch(existingManagedUser._id, {
        status: args.status,
        created_by_auth_user_id: args.invitedByAuthUserId ?? existingManagedUser.created_by_auth_user_id,
        setup_token_hash: args.setupTokenHash,
        setup_token_expires_at: args.setupTokenExpiresAt,
        last_setup_email_sent_at: now,
        updated_at: now,
      });
    } else {
      await ctx.db.insert("managed_users", {
        email,
        auth_user_id: authUserId,
        status: args.status,
        created_by_auth_user_id: args.invitedByAuthUserId,
        setup_token_hash: args.setupTokenHash,
        setup_token_expires_at: args.setupTokenExpiresAt,
        last_setup_email_sent_at: now,
        created_at: now,
        updated_at: now,
      });
    }

    const existingRole =
      (authUserId
        ? (await ctx.db
            .query("user_roles")
            .withIndex("by_auth_user_id", (q) => q.eq("auth_user_id", authUserId))
            .collect())[0]
        : null) ||
      (await ctx.db
        .query("user_roles")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique());

    if (existingRole) {
      await ctx.db.patch(existingRole._id, {
        user_id: authUserId ? String(authUserId) : existingRole.user_id,
        auth_user_id: authUserId,
        email,
        role,
        updated_at: now,
      });
    } else {
      await ctx.db.insert("user_roles", {
        user_id: authUserId ? String(authUserId) : undefined,
        auth_user_id: authUserId,
        email,
        role,
        created_at: now,
        updated_at: now,
      });
    }
  },
});

export const activateManagedUserInternal = internalMutation({
  args: {
    email: v.string(),
    authUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const email = normalizeEmail(args.email);
    const managedUser = await ctx.db
      .query("managed_users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (managedUser) {
      await ctx.db.patch(managedUser._id, {
        auth_user_id: args.authUserId,
        status: "active",
        setup_token_hash: undefined,
        setup_token_expires_at: undefined,
        activated_at: managedUser.activated_at ?? now,
        updated_at: now,
      });
    }

    const roleRecords = [
      ...(await ctx.db.query("user_roles").withIndex("by_email", (q) => q.eq("email", email)).collect()),
      ...(await ctx.db.query("user_roles").withIndex("by_user_id", (q) => q.eq("user_id", String(args.authUserId))).collect()),
    ] as any[];

    const seen = new Set<string>();
    for (const roleRecord of roleRecords) {
      if (seen.has(String(roleRecord._id))) {
        continue;
      }
      seen.add(String(roleRecord._id));
      await ctx.db.patch(roleRecord._id, {
        user_id: String(args.authUserId),
        auth_user_id: args.authUserId,
        email,
        updated_at: now,
      });
    }
  },
});

export const bootstrapManagedUserInternal = internalMutation({
  args: {
    email: v.string(),
    authUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const email = normalizeEmail(args.email);
    const managedUser = await ctx.db
      .query("managed_users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (managedUser) {
      await ctx.db.patch(managedUser._id, {
        auth_user_id: args.authUserId,
        status: "active",
        created_by_auth_user_id: args.authUserId,
        activated_at: managedUser.activated_at ?? now,
        updated_at: now,
      });
    } else {
      await ctx.db.insert("managed_users", {
        email,
        auth_user_id: args.authUserId,
        status: "active",
        created_by_auth_user_id: args.authUserId,
        activated_at: now,
        created_at: now,
        updated_at: now,
      });
    }

    const existingRole = await ctx.db
      .query("user_roles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existingRole) {
      await ctx.db.patch(existingRole._id, {
        user_id: String(args.authUserId),
        auth_user_id: args.authUserId,
        email,
        role: "admin",
        updated_at: now,
      });
    } else {
      await ctx.db.insert("user_roles", {
        user_id: String(args.authUserId),
        auth_user_id: args.authUserId,
        email,
        role: "admin",
        created_at: now,
        updated_at: now,
      });
    }
  },
});

export const bootstrapAdminAccount = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    if (email !== BOOTSTRAP_ADMIN_EMAIL) {
      throw new Error("Unauthorized");
    }

    const existingAccount = await ctx.runQuery((internal as any).admin.getPasswordAccountByEmailInternal, {
      email,
    });
    if (existingAccount) {
      throw new Error("Bootstrap admin account already exists");
    }

    if (!args.password || args.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const created = await createAccount(ctx as any, {
      provider: "password",
      account: {
        id: email,
        secret: args.password,
      },
      profile: {
        email,
      },
    });

    await ctx.runMutation((internal as any).admin.bootstrapManagedUserInternal, {
      email,
      authUserId: created.user._id,
    });

    return { success: true };
  },
});

export const inviteManagedUser = action({
  args: {
    email: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const adminState = await ctx.runQuery((internal as any).admin.getCurrentAdminStateInternal, {});
    if (!adminState?.isAdmin) {
      throw new Error("Unauthorized");
    }

    const email = normalizeEmail(args.email);
    if (email === BOOTSTRAP_ADMIN_EMAIL) {
      throw new Error("The bootstrap admin account is managed separately");
    }

    const existingManagedUser = await ctx.runQuery((internal as any).admin.getManagedUserByEmailInternal, {
      email,
    });
    if (existingManagedUser?.status === "disabled") {
      throw new Error("This account is disabled");
    }

    const token = generateSetupToken();
    const tokenHash = await hashSetupToken(token);
    await ctx.runMutation((internal as any).admin.upsertManagedUserInviteInternal, {
      email,
      role: normalizeRole(args.role),
      status: existingManagedUser?.status === "active" ? "active" : "invited",
      invitedByAuthUserId: adminState.authUserId,
      setupTokenHash: tokenHash,
      setupTokenExpiresAt: Date.now() + SETUP_TOKEN_TTL_MS,
    });

    await sendAccountSetupEmail({
      email,
      token,
      kind: "invite",
    });

    return { success: true };
  },
});

export const requestPasswordSetup = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const managedUser = await ctx.runQuery((internal as any).admin.getManagedUserByEmailInternal, {
      email,
    });
    const passwordAccount = await ctx.runQuery((internal as any).admin.getPasswordAccountByEmailInternal, {
      email,
    });

    if (!managedUser && !passwordAccount) {
      return { success: true };
    }

    if (managedUser?.status === "disabled") {
      throw new Error("This account is disabled");
    }

    const role = await ctx.runQuery((internal as any).admin.getRoleByEmailInternal, {
      email,
    });
    const token = generateSetupToken();
    const tokenHash = await hashSetupToken(token);

    await ctx.runMutation((internal as any).admin.upsertManagedUserInviteInternal, {
      email,
      role,
      status: managedUser?.status === "active" || passwordAccount ? "active" : "invited",
      invitedByAuthUserId: managedUser?.created_by_auth_user_id,
      setupTokenHash: tokenHash,
      setupTokenExpiresAt: Date.now() + SETUP_TOKEN_TTL_MS,
    });

    await sendAccountSetupEmail({
      email,
      token,
      kind: "reset",
    });

    return { success: true };
  },
});

export const completeUserSetup = action({
  args: {
    email: v.string(),
    token: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    if (!args.password || args.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const managedUser = await ctx.runQuery((internal as any).admin.getManagedUserByEmailInternal, {
      email,
    });
    if (!managedUser) {
      throw new Error("Invitation not found");
    }
    if (managedUser.status === "disabled") {
      throw new Error("This account is disabled");
    }
    if (!managedUser.setup_token_hash || !managedUser.setup_token_expires_at) {
      throw new Error("This setup link is no longer valid");
    }
    if (managedUser.setup_token_expires_at < Date.now()) {
      throw new Error("This setup link has expired");
    }

    const providedHash = await hashSetupToken(args.token);
    if (providedHash !== managedUser.setup_token_hash) {
      throw new Error("Invalid setup link");
    }

    const existingAccount = await ctx.runQuery((internal as any).admin.getPasswordAccountByEmailInternal, {
      email,
    });

    let authUserId = existingAccount?.userId;
    if (existingAccount) {
      await modifyAccountCredentials(ctx as any, {
        provider: "password",
        account: {
          id: email,
          secret: args.password,
        },
      });
    } else {
      const created = await createAccount(ctx as any, {
        provider: "password",
        account: {
          id: email,
          secret: args.password,
        },
        profile: {
          email,
        },
      });
      authUserId = created.user._id;
    }

    await ctx.runMutation((internal as any).admin.activateManagedUserInternal, {
      email,
      authUserId,
    });

    return { success: true };
  },
});

export const listManagedUsers = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await requireAdmin(ctx as any);
    const managedUsers = (await ctx.db.query("managed_users").collect()) as any[];
    const roleRows = (await ctx.db.query("user_roles").collect()) as any[];
    const roleByEmail = new Map<string, string>();
    const roleByAuthUserId = new Map<string, string>();

    for (const roleRow of roleRows) {
      if (roleRow.email) {
        roleByEmail.set(roleRow.email, roleRow.role);
      }
      if (roleRow.auth_user_id) {
        roleByAuthUserId.set(String(roleRow.auth_user_id), roleRow.role);
      }
    }

    const mapped = sortByCreatedAtDesc(managedUsers).map((managedUser) => ({
      id: String(managedUser._id),
      email: managedUser.email,
      authUserId: managedUser.auth_user_id ? String(managedUser.auth_user_id) : null,
      status: managedUser.status,
      role:
        (managedUser.auth_user_id ? roleByAuthUserId.get(String(managedUser.auth_user_id)) : undefined) ||
        roleByEmail.get(managedUser.email) ||
        "staff",
      activatedAt: managedUser.activated_at ?? null,
      createdAt: managedUser.created_at,
      updatedAt: managedUser.updated_at,
      lastSetupEmailSentAt: managedUser.last_setup_email_sent_at ?? null,
      isBootstrapAdmin: managedUser.email === BOOTSTRAP_ADMIN_EMAIL,
    }));

    if (viewer.isBootstrapAdmin && !mapped.some((managedUser) => managedUser.email === BOOTSTRAP_ADMIN_EMAIL)) {
      mapped.unshift({
        id: String(viewer.authUserId),
        email: viewer.email,
        authUserId: String(viewer.authUserId),
        status: "active",
        role: "admin",
        activatedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSetupEmailSentAt: null,
        isBootstrapAdmin: true,
      });
    }

    return mapped;
  },
});

export const listApplications = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
    const entries = (await ctx.db
      .query("competition_entries")
      .withIndex("by_competition", (q) => q.eq("competition_id", args.competitionId))
      .collect()) as any[];
    const paymentRecords = (await ctx.db.query("payment_records").collect()) as any[];
    const paymentRecordsByReference = new Map<string, any>();

    for (const paymentRecord of paymentRecords) {
      if (paymentRecord.payment_reference) {
        paymentRecordsByReference.set(paymentRecord.payment_reference, paymentRecord);
      }
    }

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
      payment_record_status: entry.payment_reference
        ? paymentRecordsByReference.get(entry.payment_reference)?.status ?? null
        : null,
      provider_status: entry.payment_reference
        ? paymentRecordsByReference.get(entry.payment_reference)?.provider_status ?? null
        : null,
      provider_payment_id: entry.payment_reference
        ? paymentRecordsByReference.get(entry.payment_reference)?.provider_payment_id ?? null
        : null,
      payment_verified_at: entry.payment_reference
        ? paymentRecordsByReference.get(entry.payment_reference)?.verified_at ?? null
        : null,
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

export const getPaymentReconciliationTimeline = query({
  args: {
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx as any);
    const events = (await ctx.db
      .query("payment_reconciliation_events")
      .withIndex("by_payment_reference_and_occurred_at", (q) => q.eq("payment_reference", args.paymentReference))
      .order("desc")
      .take(50)) as any[];

    return events.map((event) => ({
      id: String(event._id),
      channel: event.channel,
      event_type: event.event_type,
      payment_reference: event.payment_reference,
      provider_payment_id: event.provider_payment_id ?? null,
      status_before: event.status_before ?? null,
      status_after: event.status_after ?? null,
      parsed_provider_status: event.parsed_provider_status ?? null,
      signature_valid: event.signature_valid ?? null,
      merchant_match: event.merchant_match ?? null,
      amount_match: event.amount_match ?? null,
      duplicate_detected: event.duplicate_detected ?? null,
      processing_result: event.processing_result ?? null,
      error_message: event.error_message ?? null,
      raw_response_status: event.raw_response_status ?? null,
      occurred_at: event.occurred_at,
    }));
  },
});

export const retryPayfastPaymentReconciliation = action({
  args: {
    paymentReference: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const adminState = await ctx.runQuery((internal as any).admin.getCurrentAdminStateInternal, {});
    if (!adminState?.isAdmin) {
      throw new Error("Unauthorized");
    }

    const result: any = await ctx.runAction((internal as any).paymentsNode.manuallyReconcilePayfastPayment, {
      paymentReference: args.paymentReference,
    });
    return result;
  },
});

export const updateCompetitionEntryStatus = mutation({
  args: {
    id: v.id("competition_entries"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx as any);
    await ctx.db.patch(args.id, {
      status: args.status,
      updated_at: new Date().toISOString(),
    });
  },
});

export const listContactMessages = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
    await ctx.db.delete(args.id);
  },
});

export const listImpactMetrics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
    await ctx.db.delete(args.id);
  },
});

export const listImpactStories = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
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
    await requireAdmin(ctx as any);
    const team = await ctx.db.get(args.id);
    if (team?.image_storage_id) {
      await deleteStoredFile(ctx, team.image_storage_id);
    }
    await ctx.db.delete(args.id);
  },
});
