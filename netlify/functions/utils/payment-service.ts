import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { processAndEmailTicket } from "./ticket-generator";

type SupabaseAdminClient = ReturnType<typeof createClient>;

export type PaymentPurpose = "donation" | "competition_entry";
export type PaymentProvider = "payfast" | "paystack";

export interface PaymentRecord {
  id: string;
  payment_reference: string;
  provider: PaymentProvider;
  status: string;
  purpose: PaymentPurpose;
  amount: number;
  currency: string;
  payer_name: string;
  payer_email: string;
  payer_phone: string | null;
  donation_id: string | null;
  competition_entry_id: string | null;
  competition_id: string | null;
  provider_payment_id: string | null;
  provider_status: string | null;
  provider_payload: Record<string, unknown> | null;
  return_url: string | null;
  cancel_url: string | null;
  verified_at: string | null;
  completed_at: string | null;
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
}

export function createAdminClient(): SupabaseAdminClient {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !key) {
    throw new Error("Missing Supabase admin configuration");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSiteUrl(): string {
  return (
    process.env.SITE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.DEPLOY_URL ||
    "http://localhost:8888"
  ).replace(/\/$/, "");
}

export function isPayFastSandbox(): boolean {
  return (process.env.PAYFAST_SANDBOX || "true").toLowerCase() === "true";
}

export function getPayFastBaseUrl(): string {
  return isPayFastSandbox()
    ? "https://sandbox.payfast.co.za"
    : "https://www.payfast.co.za";
}

export function getPayFastProcessUrl(): string {
  return `${getPayFastBaseUrl()}/eng/process`;
}

export function getPayFastValidateUrl(): string {
  return `${getPayFastBaseUrl()}/eng/query/validate`;
}

export function buildPayFastQueryString(
  data: Record<string, string>,
  passphrase?: string,
): string {
  const segments: string[] = [];

  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (key === "signature" || value === undefined || value === null || value === "") {
      return;
    }
    segments.push(
      `${key}=${encodeURIComponent(String(value).trim()).replace(/%20/g, "+")}`,
    );
  });

  if (passphrase) {
    segments.push(
      `passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`,
    );
  }

  return segments.join("&");
}

export function generatePayFastSignature(data: Record<string, string>, passphrase?: string): string {
  return crypto
    .createHash("md5")
    .update(buildPayFastQueryString(data, passphrase))
    .digest("hex");
}

export function generatePaymentReference(): string {
  return `PAY-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

export function mapPayFastStatus(paymentStatus?: string): string {
  switch ((paymentStatus || "").toUpperCase()) {
    case "COMPLETE":
      return "completed";
    case "FAILED":
      return "failed";
    case "CANCELLED":
      return "cancelled";
    default:
      return "processing";
  }
}

export async function fetchPaymentRecord(
  supabase: SupabaseAdminClient,
  paymentReference: string,
) {
  const { data, error } = await supabase
    .from("payment_records")
    .select("*")
    .eq("payment_reference", paymentReference)
    .single();

  if (error || !data) {
    throw new Error("Payment record not found");
  }

  return data as PaymentRecord;
}

export async function buildPayFastPayload(
  supabase: SupabaseAdminClient,
  paymentRecord: PaymentRecord,
) {
  const merchantId = getRequiredEnv("PAYFAST_MERCHANT_ID");
  const merchantKey = getRequiredEnv("PAYFAST_MERCHANT_KEY");
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  const siteUrl = getSiteUrl();

  let itemName = "Donation";

  if (paymentRecord.purpose === "competition_entry" && paymentRecord.competition_id) {
    const { data: competition } = await supabase
      .from("competitions")
      .select("title")
      .eq("id", paymentRecord.competition_id)
      .single();

    itemName = competition?.title
      ? `Competition Entry - ${competition.title}`
      : "Competition Entry";
  }

  const returnUrl = `${siteUrl}/payfast-return?payment_reference=${encodeURIComponent(paymentRecord.payment_reference)}`;
  const cancelUrl = `${siteUrl}/payfast-return?payment_reference=${encodeURIComponent(paymentRecord.payment_reference)}&cancelled=1`;
  const notifyUrl = `${siteUrl}/.netlify/functions/payfast-webhook`;

  const data: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    name_first: paymentRecord.payer_name,
    email_address: paymentRecord.payer_email,
    m_payment_id: paymentRecord.payment_reference,
    amount: formatAmount(paymentRecord.amount),
    item_name: itemName,
    custom_str1: paymentRecord.purpose,
    custom_str2: paymentRecord.competition_id || paymentRecord.donation_id || "",
    custom_str3: paymentRecord.payer_phone || "",
  };

  const signatureBaseString = buildPayFastQueryString(data, passphrase);
  const signature = crypto
    .createHash("md5")
    .update(signatureBaseString)
    .digest("hex");

  console.log("PayFast payload generated", {
    paymentReference: paymentRecord.payment_reference,
    purpose: paymentRecord.purpose,
    processUrl: getPayFastProcessUrl(),
    hasPassphrase: Boolean(passphrase),
    fields: data,
    signatureBaseString,
    signature,
  });

  return {
    processUrl: getPayFastProcessUrl(),
    fields: {
      ...data,
      signature,
    },
    returnUrl,
    cancelUrl,
  };
}

export async function validatePayFastITN(
  payload: Record<string, string>,
  signature: string,
) {
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  const expectedSignature = generatePayFastSignature(payload, passphrase);

  if (expectedSignature !== signature) {
    throw new Error("Invalid PayFast signature");
  }

  const response = await fetch(getPayFastValidateUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: buildPayFastQueryString(payload),
  });

  const text = (await response.text()).trim();

  if (text !== "VALID") {
    throw new Error(`PayFast validation failed: ${text}`);
  }
}

export async function finalizeDonationPayment(
  supabase: SupabaseAdminClient,
  paymentRecord: PaymentRecord,
) {
  if (!paymentRecord.donation_id) {
    throw new Error("Donation payment record missing donation_id");
  }

  await supabase
    .from("donations")
    .update({
      payment_method: paymentRecord.provider,
      status: "completed",
    })
    .eq("id", paymentRecord.donation_id);
}

export async function finalizeCompetitionPayment(
  supabase: SupabaseAdminClient,
  paymentRecord: PaymentRecord,
) {
  if (!paymentRecord.competition_entry_id || !paymentRecord.competition_id) {
    throw new Error("Competition payment record missing entry linkage");
  }

  const { data: competition, error: competitionError } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", paymentRecord.competition_id)
    .single();

  if (competitionError || !competition) {
    throw new Error("Competition not found for payment");
  }

  const result = await processAndEmailTicket({
    supabase,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    competition,
    participantName: paymentRecord.payer_name,
    participantPhone: paymentRecord.payer_phone || "",
    email: paymentRecord.payer_email,
    paymentMethod: paymentRecord.provider,
    paymentReference: paymentRecord.payment_reference,
    entryId: paymentRecord.competition_entry_id,
  });

  if (!result.success) {
    throw new Error(result.error || "Failed to finalize competition payment");
  }

  return result;
}

export async function getCompetitionSuccessPayload(
  supabase: SupabaseAdminClient,
  paymentRecord: PaymentRecord,
) {
  if (!paymentRecord.competition_entry_id || !paymentRecord.competition_id) {
    return null;
  }

  const { data: entry } = await supabase
    .from("competition_entries")
    .select("ticket_number")
    .eq("id", paymentRecord.competition_entry_id)
    .single();

  const { data: competition } = await supabase
    .from("competitions")
    .select("title, prize, end_date")
    .eq("id", paymentRecord.competition_id)
    .single();

  if (!entry?.ticket_number || !competition) {
    return null;
  }

  const drawDate = new Date(competition.end_date);
  drawDate.setDate(drawDate.getDate() + 1);

  return {
    ticket_number: entry.ticket_number,
    reference: paymentRecord.payment_reference,
    participant_name: paymentRecord.payer_name,
    email: paymentRecord.payer_email,
    competition_title: competition.title,
    prize: competition.prize || competition.title,
    draw_date: drawDate.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
}
