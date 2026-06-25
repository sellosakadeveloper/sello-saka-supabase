import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

type PaymentPurpose = "donation" | "competition_entry";
type PaymentProvider = "payfast" | "paystack";

type PaymentRecord = {
  _id: Id<"payment_records">;
  payment_reference: string;
  idempotency_key?: string | null;
  provider: PaymentProvider;
  status: string;
  purpose: PaymentPurpose;
  purpose_context?: string | null;
  amount: number;
  currency: string;
  payer_name: string;
  payer_email: string;
  payer_phone?: string | null;
  donation_id?: Id<"donations"> | null;
  competition_entry_id?: Id<"competition_entries"> | null;
  competition_id?: Id<"competitions"> | null;
  provider_payment_id?: string | null;
  provider_status?: string | null;
  provider_payload?: unknown;
  return_url?: string | null;
  cancel_url?: string | null;
  verified_at?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function getSiteUrl(siteUrl?: string): string {
  return (siteUrl || "").replace(/\/$/, "");
}

function generatePaymentReference(): string {
  return `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

async function getPaymentRecordByReferenceHelper(ctx: { db: any }, paymentReference: string): Promise<PaymentRecord> {
  const paymentRecord = await ctx.db
    .query("payment_records")
    .withIndex("by_payment_reference", (q: any) => q.eq("payment_reference", paymentReference))
    .unique();

  if (!paymentRecord) {
    throw new Error("Payment record not found");
  }

  return paymentRecord as PaymentRecord;
}

async function getPaymentRecordByIdempotencyKeyHelper(
  ctx: { db: any },
  idempotencyKey: string,
): Promise<PaymentRecord | null> {
  const paymentRecord = await ctx.db
    .query("payment_records")
    .withIndex("by_idempotency_key", (q: any) => q.eq("idempotency_key", idempotencyKey))
    .unique();

  return (paymentRecord as PaymentRecord | null) ?? null;
}

async function buildInitializedPaymentResponseFromRecord(
  ctx: { db: any },
  paymentRecord: PaymentRecord,
) {
  let itemName = "Donation";
  let metadataCompetitionId: string | null = null;
  let donationType: string | undefined;

  if (paymentRecord.purpose === "competition_entry") {
    if (!paymentRecord.competition_id) {
      throw new Error("Competition payment record missing competition linkage");
    }

    const competition = await ctx.db.get(paymentRecord.competition_id);
    if (!competition) {
      throw new Error("Competition not found for payment");
    }

    itemName = competition.title ? `Competition Entry - ${competition.title}` : "Competition Entry";
    metadataCompetitionId = String(paymentRecord.competition_id);
  } else if (paymentRecord.purpose_context) {
    donationType = paymentRecord.purpose_context;
  }

  return {
    provider: paymentRecord.provider,
    purpose: paymentRecord.purpose,
    payment_reference: paymentRecord.payment_reference,
    amount: paymentRecord.amount,
    email: paymentRecord.payer_email,
    payer_name: paymentRecord.payer_name,
    payer_email: paymentRecord.payer_email,
    payer_phone: paymentRecord.payer_phone || "",
    return_url: paymentRecord.return_url || "",
    cancel_url: paymentRecord.cancel_url || "",
    item_name: itemName,
    metadata: {
      payment_reference: paymentRecord.payment_reference,
      purpose: paymentRecord.purpose,
      purpose_context: paymentRecord.purpose_context ?? null,
      competition_id: metadataCompetitionId,
      name: paymentRecord.payer_name,
      phone: paymentRecord.payer_phone || undefined,
      donation_type: donationType,
    },
  };
}

async function buildCompetitionSuccessPayload(
  ctx: { db: any; storage: { getUrl: (storageId: Id<"_storage">) => Promise<string | null> } },
  paymentRecord: PaymentRecord,
) {
  if (!paymentRecord.competition_entry_id || !paymentRecord.competition_id) {
    return null;
  }

  const entry = await ctx.db.get(paymentRecord.competition_entry_id);
  const competition = await ctx.db.get(paymentRecord.competition_id);

  if (!entry || !competition || !entry.ticket_number) {
    return null;
  }

  const drawDate = new Date(competition.end_date);
  drawDate.setDate(drawDate.getDate() + 1);
  const startDate = new Date(competition.start_date);
  const endDate = new Date(competition.end_date);
  const entryDate = new Date(entry.created_at || paymentRecord.completed_at || Date.now());
  const ticketDownloadUrl = entry.ticket_pdf_storage_id
    ? await ctx.storage.getUrl(entry.ticket_pdf_storage_id as Id<"_storage">)
    : null;

  return {
    ticket_number: entry.ticket_number,
    reference: paymentRecord.payment_reference,
    participant_name: paymentRecord.payer_name,
    email: paymentRecord.payer_email,
    participant_phone: paymentRecord.payer_phone || "",
    competition_title: competition.title,
    prize: competition.prize || competition.title,
    entry_price: Number(competition.ticket_price ?? competition.entry_fee ?? paymentRecord.amount ?? 0),
    competition_period: `${startDate.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })} - ${endDate.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`,
    draw_date: drawDate.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    entry_date: entryDate.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    ticket_download_url: ticketDownloadUrl,
    ticket_emailed: Boolean(entry.ticket_emailed),
  };
}

async function generateTicketNumber(ctx: { db: any }): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SSKF-${year}-`;
  const entries = await ctx.db.query("competition_entries").collect();

  let highest = 0;
  for (const entry of entries) {
    const ticket = entry.ticket_number as string | null | undefined;
    if (!ticket || !ticket.startsWith(prefix)) {
      continue;
    }
    const parts = ticket.split("-");
    const number = Number.parseInt(parts[2] || "", 10);
    if (!Number.isNaN(number)) {
      highest = Math.max(highest, number);
    }
  }

  return `${prefix}${String(highest + 1).padStart(6, "0")}`;
}

async function finalizeVerifiedPaymentHelper(ctx: { db: any; storage: { getUrl: (storageId: Id<"_storage">) => Promise<string | null> } }, args: {
  paymentReference: string;
  provider: PaymentProvider;
  providerPaymentId?: string;
  providerStatus?: string;
  providerPayload?: unknown;
  amount?: number;
}) {
  const paymentRecord = await getPaymentRecordByReferenceHelper(ctx, args.paymentReference);
  const amountMatches =
    typeof args.amount === "number"
      ? args.amount.toFixed(2) === Number(paymentRecord.amount).toFixed(2)
      : true;

  if (!amountMatches) {
    throw new Error("Payment amount mismatch");
  }

  if (paymentRecord.status === "completed") {
    return {
      success: true,
      payment_reference: paymentRecord.payment_reference,
      purpose: paymentRecord.purpose,
      competition_success: await buildCompetitionSuccessPayload(ctx, paymentRecord),
    };
  }

  const now = new Date().toISOString();
  await ctx.db.patch(paymentRecord._id, {
    status: "completed",
    provider_payment_id: args.providerPaymentId ?? paymentRecord.provider_payment_id ?? undefined,
    provider_status: args.providerStatus ?? paymentRecord.provider_status ?? undefined,
    provider_payload: args.providerPayload ?? paymentRecord.provider_payload ?? undefined,
    verified_at: now,
    completed_at: now,
    updated_at: now,
  });

  if (paymentRecord.purpose === "donation") {
    if (paymentRecord.donation_id) {
      await ctx.db.patch(paymentRecord.donation_id, {
        payment_method: args.provider,
        status: "completed",
        updated_at: now,
      });
    }

    return {
      success: true,
      payment_reference: paymentRecord.payment_reference,
      purpose: "donation" as const,
      competition_success: null,
    };
  }

  if (!paymentRecord.competition_id) {
    throw new Error("Competition payment record missing competition linkage");
  }

  const competition = await ctx.db.get(paymentRecord.competition_id);
  if (!competition) {
    throw new Error("Competition not found for payment");
  }

  let entryId = paymentRecord.competition_entry_id ?? null;
  let entry = entryId ? await ctx.db.get(entryId) : null;
  const ticketNumber = entry?.ticket_number || (await generateTicketNumber(ctx));

  if (entryId && entry) {
    await ctx.db.patch(entryId, {
      competition_id: paymentRecord.competition_id,
      name: paymentRecord.payer_name,
      full_name: paymentRecord.payer_name,
      email: paymentRecord.payer_email,
      phone: paymentRecord.payer_phone || "",
      ticket_number: ticketNumber,
      payment_method: args.provider,
      payment_reference: paymentRecord.payment_reference,
      payment_status: "completed",
      status: "confirmed",
      ticket_emailed: entry.ticket_emailed ?? false,
      updated_at: now,
    });
  } else {
    entryId = await ctx.db.insert("competition_entries", {
      competition_id: paymentRecord.competition_id,
      name: paymentRecord.payer_name,
      full_name: paymentRecord.payer_name,
      email: paymentRecord.payer_email,
      phone: paymentRecord.payer_phone || "",
      ticket_number: ticketNumber,
      payment_method: args.provider,
      payment_reference: paymentRecord.payment_reference,
      payment_status: "completed",
      status: "confirmed",
      ticket_emailed: false,
      created_at: now,
      updated_at: now,
    });
    entry = await ctx.db.get(entryId);
    await ctx.db.patch(paymentRecord._id, {
      competition_entry_id: entryId,
      updated_at: now,
    });
  }

  const drawDate = new Date(competition.end_date);
  drawDate.setDate(drawDate.getDate() + 1);

  const startDate = new Date(competition.start_date);
  const competitionPeriod = `${startDate.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })} - ${new Date(competition.end_date).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;

  return {
    success: true,
    payment_reference: paymentRecord.payment_reference,
    purpose: "competition_entry" as const,
    competition_success: {
      ticket_number: ticketNumber,
      reference: paymentRecord.payment_reference,
      participant_name: paymentRecord.payer_name,
      email: paymentRecord.payer_email,
      participant_phone: paymentRecord.payer_phone || "",
      competition_title: competition.title,
      prize: competition.prize || competition.title,
      entry_price: Number(competition.ticket_price || competition.entry_fee || paymentRecord.amount),
      competition_period: competitionPeriod,
      draw_date: drawDate.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      entry_date: new Date(entry?.created_at || now).toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      ticket_download_url: null,
      ticket_emailed: Boolean(entry?.ticket_emailed),
    },
    competitionEmail: {
      participantName: paymentRecord.payer_name,
      participantPhone: paymentRecord.payer_phone || "",
      email: paymentRecord.payer_email,
      ticketNumber,
      paymentReference: paymentRecord.payment_reference,
      competitionTitle: competition.title,
      prize: competition.prize || competition.title,
      entryPrice: competition.ticket_price || competition.entry_fee || paymentRecord.amount,
      competitionPeriod,
      competitionStartDate: startDate.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      competitionEndDate: new Date(competition.end_date).toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      drawDate: drawDate.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      entryDate: new Date(entry?.created_at || now).toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      supportLine: competition.subtitle || "Support childhood cancer survivors",
      websiteUrl: "www.sellosakafoundation.org",
      foundationEmail: "support@sellosakafoundation.org",
      entryId,
      ticketPdfStorageId: entry?.ticket_pdf_storage_id ?? null,
    },
  };
}

async function recordGatewayStatusHelper(ctx: { db: any }, args: {
  paymentReference: string;
  providerPaymentId?: string;
  providerStatus?: string;
  providerPayload?: unknown;
  status: string;
  amount?: number;
}) {
  const paymentRecord = await getPaymentRecordByReferenceHelper(ctx, args.paymentReference);
  const amountMatches =
    typeof args.amount === "number"
      ? args.amount.toFixed(2) === Number(paymentRecord.amount).toFixed(2)
      : true;

  if (!amountMatches) {
    throw new Error("Payment amount mismatch");
  }

  const now = new Date().toISOString();
  await ctx.db.patch(paymentRecord._id, {
    status: args.status,
    provider_payment_id: args.providerPaymentId ?? paymentRecord.provider_payment_id ?? undefined,
    provider_status: args.providerStatus ?? paymentRecord.provider_status ?? undefined,
    provider_payload: args.providerPayload ?? paymentRecord.provider_payload ?? undefined,
    verified_at: now,
    updated_at: now,
  });

  if (paymentRecord.purpose === "donation" && paymentRecord.donation_id) {
    await ctx.db.patch(paymentRecord.donation_id, {
      status: args.status,
      payment_method: paymentRecord.provider,
      updated_at: now,
    });
  }

  if (paymentRecord.purpose === "competition_entry" && paymentRecord.competition_entry_id) {
    await ctx.db.patch(paymentRecord.competition_entry_id, {
      payment_status: args.status,
      status: args.status === "cancelled" ? "cancelled" : "pending",
      updated_at: now,
    });
  }

  return {
    success: true,
    payment_reference: paymentRecord.payment_reference,
    status: args.status,
    purpose: paymentRecord.purpose,
  };
}

export const initializePaymentRecord = internalMutation({
  args: {
    idempotencyKey: v.string(),
    purpose: v.union(v.literal("donation"), v.literal("competition_entry")),
    provider: v.union(v.literal("payfast"), v.literal("paystack")),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    amount: v.optional(v.number()),
    donation_type: v.optional(v.string()),
    competition_id: v.optional(v.id("competitions")),
    site_url: v.string(),
  },
  handler: async (ctx, args) => {
    const existingPaymentRecord = await getPaymentRecordByIdempotencyKeyHelper(ctx, args.idempotencyKey);
    if (existingPaymentRecord) {
      if (existingPaymentRecord.status === "pending" || existingPaymentRecord.status === "processing") {
        return await buildInitializedPaymentResponseFromRecord(ctx, existingPaymentRecord);
      }

      if (existingPaymentRecord.status === "completed") {
        throw new Error("This payment attempt has already been completed. Start a new payment attempt.");
      }

      throw new Error("This payment attempt is no longer reusable. Start a new payment attempt.");
    }

    const paymentReference = generatePaymentReference();
    const now = new Date().toISOString();
    const siteUrl = getSiteUrl(args.site_url);
    const returnUrl = `${siteUrl}/payfast-return?payment_reference=${encodeURIComponent(paymentReference)}`;
    const cancelUrl = `${siteUrl}/payfast-return?payment_reference=${encodeURIComponent(paymentReference)}&cancelled=1`;
    let paymentAmount = Number(args.amount || 0);
    let donationId: string | null = null;
    let competitionEntryId: string | null = null;
    let linkedCompetitionId: string | null = null;
    let purposeContext: string | null = null;
    let itemName = "Donation";

    if (args.purpose === "donation") {
      if (!paymentAmount || paymentAmount <= 0) {
        throw new Error("Invalid donation amount");
      }

      purposeContext = args.donation_type || "once";

      donationId = await ctx.db.insert("donations", {
        name: args.name,
        email: args.email,
        phone: args.phone || undefined,
        amount: paymentAmount,
        donation_type: args.donation_type || "once",
        payment_method: args.provider,
        status: "pending",
        created_at: now,
        updated_at: now,
      });
    } else {
      if (!args.competition_id) {
        throw new Error("Missing competition_id");
      }

      const competition = await ctx.db.get(args.competition_id);
      if (!competition) {
        throw new Error("Competition not found");
      }

      paymentAmount = Number(competition.ticket_price || competition.entry_fee || 0);
      itemName = competition.title ? `Competition Entry - ${competition.title}` : "Competition Entry";
      competitionEntryId = await ctx.db.insert("competition_entries", {
        competition_id: args.competition_id,
        name: args.name,
        full_name: args.name,
        email: args.email,
        phone: args.phone || "",
        payment_method: args.provider,
        payment_reference: paymentReference,
        payment_status: "pending",
        status: "pending",
        created_at: now,
        updated_at: now,
      });
      linkedCompetitionId = String(args.competition_id);
      purposeContext = linkedCompetitionId;
    }

    await ctx.db.insert("payment_records", {
      payment_reference: paymentReference,
      idempotency_key: args.idempotencyKey,
      provider: args.provider,
      status: "pending",
      purpose: args.purpose,
      purpose_context: purposeContext || undefined,
      amount: paymentAmount,
      currency: "ZAR",
      payer_name: args.name,
      payer_email: args.email,
      payer_phone: args.phone || undefined,
      donation_id: donationId ? (donationId as any) : undefined,
      competition_entry_id: competitionEntryId ? (competitionEntryId as any) : undefined,
      competition_id: linkedCompetitionId ? (linkedCompetitionId as any) : undefined,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      created_at: now,
      updated_at: now,
    });

    return {
      provider: args.provider,
      purpose: args.purpose,
      payment_reference: paymentReference,
      amount: paymentAmount,
      email: args.email,
      payer_name: args.name,
      payer_email: args.email,
      payer_phone: args.phone || "",
      return_url: returnUrl,
      cancel_url: cancelUrl,
      item_name: itemName,
      metadata: {
        payment_reference: paymentReference,
        purpose: args.purpose,
        purpose_context: purposeContext,
        competition_id: linkedCompetitionId,
        name: args.name,
        phone: args.phone,
        donation_type: args.donation_type,
      },
    };
  },
});

export const getPaymentStatus = query({
  args: {
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    let paymentRecord: PaymentRecord | null = null;
    try {
      paymentRecord = await getPaymentRecordByReferenceHelper(ctx, args.paymentReference);
    } catch {
      return null;
    }

    const competitionSuccess =
      paymentRecord.purpose === "competition_entry" && paymentRecord.status === "completed"
        ? await buildCompetitionSuccessPayload(ctx, paymentRecord)
        : null;

    return {
      payment_reference: paymentRecord.payment_reference,
      status: paymentRecord.status,
      purpose: paymentRecord.purpose,
      provider: paymentRecord.provider,
      provider_status: paymentRecord.provider_status ?? null,
      completed_at: paymentRecord.completed_at ?? null,
      competition_success: competitionSuccess,
    };
  },
});

export const finalizeVerifiedPayment = internalMutation({
  args: {
    paymentReference: v.string(),
    provider: v.union(v.literal("payfast"), v.literal("paystack")),
    providerPaymentId: v.optional(v.string()),
    providerStatus: v.optional(v.string()),
    providerPayload: v.optional(v.any()),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await finalizeVerifiedPaymentHelper(ctx, args);
  },
});

export const recordGatewayStatus = internalMutation({
  args: {
    paymentReference: v.string(),
    providerPaymentId: v.optional(v.string()),
    providerStatus: v.optional(v.string()),
    providerPayload: v.optional(v.any()),
    status: v.string(),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await recordGatewayStatusHelper(ctx, args);
  },
});

export const markTicketEmailed = internalMutation({
  args: {
    entryId: v.id("competition_entries"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.entryId, {
      ticket_emailed: true,
      updated_at: new Date().toISOString(),
    });
  },
});

export const attachTicketPdf = internalMutation({
  args: {
    entryId: v.id("competition_entries"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.entryId, {
      ticket_pdf_storage_id: args.storageId,
      updated_at: new Date().toISOString(),
    });
  },
});

export const getPaymentRecordByReference = internalQuery({
  args: {
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    return await getPaymentRecordByReferenceHelper(ctx, args.paymentReference);
  },
});

export const getCompetitionTicketEmailData = internalQuery({
  args: {
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    const paymentRecord = await getPaymentRecordByReferenceHelper(ctx, args.paymentReference);
    if (
      paymentRecord.purpose !== "competition_entry" ||
      paymentRecord.status !== "completed" ||
      !paymentRecord.competition_entry_id ||
      !paymentRecord.competition_id
    ) {
      return null;
    }

    const entry = await ctx.db.get(paymentRecord.competition_entry_id);
    const competition = await ctx.db.get(paymentRecord.competition_id);
    if (!entry || !competition || !entry.ticket_number) {
      return null;
    }

    const drawDate = new Date(competition.end_date);
    drawDate.setDate(drawDate.getDate() + 1);

    const startDate = new Date(competition.start_date);
    const endDate = new Date(competition.end_date);

    return {
      participantName: paymentRecord.payer_name,
      participantPhone: paymentRecord.payer_phone || "",
      email: paymentRecord.payer_email,
      ticketNumber: entry.ticket_number,
      paymentReference: paymentRecord.payment_reference,
      competitionTitle: competition.title,
      prize: competition.prize || competition.title,
      entryPrice: Number(competition.ticket_price || competition.entry_fee || paymentRecord.amount),
      competitionPeriod: `${startDate.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} - ${endDate.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`,
      competitionStartDate: startDate.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      competitionEndDate: endDate.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      drawDate: drawDate.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      entryDate: new Date(entry.created_at || paymentRecord.completed_at || Date.now()).toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      supportLine: competition.subtitle || "Support childhood cancer survivors",
      websiteUrl: "www.sellosakafoundation.org",
      foundationEmail: "support@sellosakafoundation.org",
      entryId: paymentRecord.competition_entry_id,
      ticketPdfStorageId: entry.ticket_pdf_storage_id ?? null,
    };
  },
});
