import { getAuthUserId } from "@convex-dev/auth/server";

export const BOOTSTRAP_ADMIN_EMAIL = "sellosakadeveloper@gmail.com";
export const SETUP_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

const textEncoder = new TextEncoder();

type ViewerContext = {
  db: {
    get: (id: unknown) => Promise<any>;
    query: (tableName: string) => any;
  };
  auth: {
    getUserIdentity: () => Promise<unknown>;
  };
};

function uniqueById<T extends { _id: unknown }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = String(item._id);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeRole(role?: string | null): string {
  const normalized = (role || "").trim().toLowerCase();
  return normalized || "staff";
}

export async function hashSetupToken(token: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", textEncoder.encode(token));
  return toHex(digest);
}

export function generateSetupToken(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function getRoleRecords(ctx: ViewerContext, authUserId: unknown, email: string) {
  const byAuthUserId = authUserId
    ? await ctx.db
        .query("user_roles")
        .withIndex("by_auth_user_id", (q: any) => q.eq("auth_user_id", authUserId))
        .collect()
    : [];
  const byEmail = await ctx.db
    .query("user_roles")
    .withIndex("by_email", (q: any) => q.eq("email", email))
    .collect();
  const byLegacyUserId = authUserId
    ? await ctx.db
        .query("user_roles")
        .withIndex("by_user_id", (q: any) => q.eq("user_id", String(authUserId)))
        .collect()
    : [];

  return uniqueById([...(byAuthUserId as any[]), ...(byEmail as any[]), ...(byLegacyUserId as any[])]);
}

export async function getViewerContext(ctx: ViewerContext) {
  const authUserId = await getAuthUserId(ctx as any);
  if (!authUserId) {
    return null;
  }

  const authUser = await ctx.db.get(authUserId);
  if (!authUser) {
    return null;
  }

  const email = normalizeEmail(authUser.email || "");
  const managedUser =
    (await ctx.db
      .query("managed_users")
      .withIndex("by_auth_user_id", (q: any) => q.eq("auth_user_id", authUserId))
      .unique()) ||
    (email
      ? await ctx.db
          .query("managed_users")
          .withIndex("by_email", (q: any) => q.eq("email", email))
          .unique()
      : null);
  const roleRecords = email ? await getRoleRecords(ctx, authUserId, email) : [];
  const isBootstrapAdmin = email === BOOTSTRAP_ADMIN_EMAIL;
  const isDisabled = managedUser?.status === "disabled";
  const isAdmin = !isDisabled && (isBootstrapAdmin || roleRecords.some((role) => role.role === "admin"));

  return {
    authUserId,
    authUser,
    email,
    managedUser,
    roleRecords,
    isBootstrapAdmin,
    isAdmin,
  };
}

export async function requireAdmin(ctx: ViewerContext) {
  const viewer = await getViewerContext(ctx);
  if (!viewer || !viewer.isAdmin) {
    throw new Error("Unauthorized");
  }
  return viewer;
}
