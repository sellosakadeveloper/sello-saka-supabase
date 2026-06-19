import { action, httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const textEncoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function md5RotateLeft(value: number, shift: number): number {
  return (value << shift) | (value >>> (32 - shift));
}

function md5Add(x: number, y: number): number {
  const lsw = (x & 0xffff) + (y & 0xffff);
  const msw = (x >>> 16) + (y >>> 16) + (lsw >>> 16);
  return (msw << 16) | (lsw & 0xffff);
}

function md5Transform(
  fn: (b: number, c: number, d: number) => number,
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  s: number,
  ac: number,
): number {
  return md5Add(md5RotateLeft(md5Add(md5Add(a, fn(b, c, d)), md5Add(x, ac)), s), b);
}

function md5ToWordArray(value: string): number[] {
  const bytes = textEncoder.encode(value);
  const words: number[] = [];

  for (let index = 0; index < bytes.length; index += 1) {
    const wordIndex = index >>> 2;
    words[wordIndex] = words[wordIndex] || 0;
    words[wordIndex] |= bytes[index] << ((index % 4) * 8);
  }

  const bitLength = bytes.length * 8;
  const finalWordIndex = bytes.length >>> 2;
  words[finalWordIndex] = words[finalWordIndex] || 0;
  words[finalWordIndex] |= 0x80 << ((bytes.length % 4) * 8);
  words[(((bytes.length + 8) >>> 6) << 4) + 14] = bitLength;

  return words;
}

function md5WordToHex(value: number): string {
  let output = "";
  for (let index = 0; index < 4; index += 1) {
    output += ((value >>> (index * 8)) & 0xff).toString(16).padStart(2, "0");
  }
  return output;
}

// PayFast signs requests with MD5, so keep a local implementation instead of relying on Node's crypto module.
function md5Hex(value: string): string {
  const words = md5ToWordArray(value);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const ff = (aa: number, bb: number, cc: number, dd: number, x: number, s: number, ac: number) =>
    md5Transform((x1, y1, z1) => (x1 & y1) | (~x1 & z1), aa, bb, cc, dd, x, s, ac);
  const gg = (aa: number, bb: number, cc: number, dd: number, x: number, s: number, ac: number) =>
    md5Transform((x1, y1, z1) => (x1 & z1) | (y1 & ~z1), aa, bb, cc, dd, x, s, ac);
  const hh = (aa: number, bb: number, cc: number, dd: number, x: number, s: number, ac: number) =>
    md5Transform((x1, y1, z1) => x1 ^ y1 ^ z1, aa, bb, cc, dd, x, s, ac);
  const ii = (aa: number, bb: number, cc: number, dd: number, x: number, s: number, ac: number) =>
    md5Transform((x1, y1, z1) => y1 ^ (x1 | ~z1), aa, bb, cc, dd, x, s, ac);

  for (let index = 0; index < words.length; index += 16) {
    const originalA = a;
    const originalB = b;
    const originalC = c;
    const originalD = d;

    a = ff(a, b, c, d, words[index + 0] || 0, 7, 0xd76aa478);
    d = ff(d, a, b, c, words[index + 1] || 0, 12, 0xe8c7b756);
    c = ff(c, d, a, b, words[index + 2] || 0, 17, 0x242070db);
    b = ff(b, c, d, a, words[index + 3] || 0, 22, 0xc1bdceee);
    a = ff(a, b, c, d, words[index + 4] || 0, 7, 0xf57c0faf);
    d = ff(d, a, b, c, words[index + 5] || 0, 12, 0x4787c62a);
    c = ff(c, d, a, b, words[index + 6] || 0, 17, 0xa8304613);
    b = ff(b, c, d, a, words[index + 7] || 0, 22, 0xfd469501);
    a = ff(a, b, c, d, words[index + 8] || 0, 7, 0x698098d8);
    d = ff(d, a, b, c, words[index + 9] || 0, 12, 0x8b44f7af);
    c = ff(c, d, a, b, words[index + 10] || 0, 17, 0xffff5bb1);
    b = ff(b, c, d, a, words[index + 11] || 0, 22, 0x895cd7be);
    a = ff(a, b, c, d, words[index + 12] || 0, 7, 0x6b901122);
    d = ff(d, a, b, c, words[index + 13] || 0, 12, 0xfd987193);
    c = ff(c, d, a, b, words[index + 14] || 0, 17, 0xa679438e);
    b = ff(b, c, d, a, words[index + 15] || 0, 22, 0x49b40821);

    a = gg(a, b, c, d, words[index + 1] || 0, 5, 0xf61e2562);
    d = gg(d, a, b, c, words[index + 6] || 0, 9, 0xc040b340);
    c = gg(c, d, a, b, words[index + 11] || 0, 14, 0x265e5a51);
    b = gg(b, c, d, a, words[index + 0] || 0, 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, words[index + 5] || 0, 5, 0xd62f105d);
    d = gg(d, a, b, c, words[index + 10] || 0, 9, 0x02441453);
    c = gg(c, d, a, b, words[index + 15] || 0, 14, 0xd8a1e681);
    b = gg(b, c, d, a, words[index + 4] || 0, 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, words[index + 9] || 0, 5, 0x21e1cde6);
    d = gg(d, a, b, c, words[index + 14] || 0, 9, 0xc33707d6);
    c = gg(c, d, a, b, words[index + 3] || 0, 14, 0xf4d50d87);
    b = gg(b, c, d, a, words[index + 8] || 0, 20, 0x455a14ed);
    a = gg(a, b, c, d, words[index + 13] || 0, 5, 0xa9e3e905);
    d = gg(d, a, b, c, words[index + 2] || 0, 9, 0xfcefa3f8);
    c = gg(c, d, a, b, words[index + 7] || 0, 14, 0x676f02d9);
    b = gg(b, c, d, a, words[index + 12] || 0, 20, 0x8d2a4c8a);

    a = hh(a, b, c, d, words[index + 5] || 0, 4, 0xfffa3942);
    d = hh(d, a, b, c, words[index + 8] || 0, 11, 0x8771f681);
    c = hh(c, d, a, b, words[index + 11] || 0, 16, 0x6d9d6122);
    b = hh(b, c, d, a, words[index + 14] || 0, 23, 0xfde5380c);
    a = hh(a, b, c, d, words[index + 1] || 0, 4, 0xa4beea44);
    d = hh(d, a, b, c, words[index + 4] || 0, 11, 0x4bdecfa9);
    c = hh(c, d, a, b, words[index + 7] || 0, 16, 0xf6bb4b60);
    b = hh(b, c, d, a, words[index + 10] || 0, 23, 0xbebfbc70);
    a = hh(a, b, c, d, words[index + 13] || 0, 4, 0x289b7ec6);
    d = hh(d, a, b, c, words[index + 0] || 0, 11, 0xeaa127fa);
    c = hh(c, d, a, b, words[index + 3] || 0, 16, 0xd4ef3085);
    b = hh(b, c, d, a, words[index + 6] || 0, 23, 0x04881d05);
    a = hh(a, b, c, d, words[index + 9] || 0, 4, 0xd9d4d039);
    d = hh(d, a, b, c, words[index + 12] || 0, 11, 0xe6db99e5);
    c = hh(c, d, a, b, words[index + 15] || 0, 16, 0x1fa27cf8);
    b = hh(b, c, d, a, words[index + 2] || 0, 23, 0xc4ac5665);

    a = ii(a, b, c, d, words[index + 0] || 0, 6, 0xf4292244);
    d = ii(d, a, b, c, words[index + 7] || 0, 10, 0x432aff97);
    c = ii(c, d, a, b, words[index + 14] || 0, 15, 0xab9423a7);
    b = ii(b, c, d, a, words[index + 5] || 0, 21, 0xfc93a039);
    a = ii(a, b, c, d, words[index + 12] || 0, 6, 0x655b59c3);
    d = ii(d, a, b, c, words[index + 3] || 0, 10, 0x8f0ccc92);
    c = ii(c, d, a, b, words[index + 10] || 0, 15, 0xffeff47d);
    b = ii(b, c, d, a, words[index + 1] || 0, 21, 0x85845dd1);
    a = ii(a, b, c, d, words[index + 8] || 0, 6, 0x6fa87e4f);
    d = ii(d, a, b, c, words[index + 15] || 0, 10, 0xfe2ce6e0);
    c = ii(c, d, a, b, words[index + 6] || 0, 15, 0xa3014314);
    b = ii(b, c, d, a, words[index + 13] || 0, 21, 0x4e0811a1);
    a = ii(a, b, c, d, words[index + 4] || 0, 6, 0xf7537e82);
    d = ii(d, a, b, c, words[index + 11] || 0, 10, 0xbd3af235);
    c = ii(c, d, a, b, words[index + 2] || 0, 15, 0x2ad7d2bb);
    b = ii(b, c, d, a, words[index + 9] || 0, 21, 0xeb86d391);

    a = md5Add(a, originalA);
    b = md5Add(b, originalB);
    c = md5Add(c, originalC);
    d = md5Add(d, originalD);
  }

  return `${md5WordToHex(a)}${md5WordToHex(b)}${md5WordToHex(c)}${md5WordToHex(d)}`;
}

async function hmacSha512Hex(secret: string, value: string): Promise<string> {
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, textEncoder.encode(value));
  return toHex(signature);
}

function getConvexSiteUrl(): string {
  const siteUrl = process.env.CONVEX_SITE_URL || process.env.VITE_CONVEX_SITE_URL;
  if (!siteUrl) {
    throw new Error("Missing CONVEX_SITE_URL");
  }
  return siteUrl.replace(/\/$/, "");
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function isPayFastSandbox(): boolean {
  return (process.env.PAYFAST_SANDBOX || "true").toLowerCase() === "true";
}

function getPayFastBaseUrl(): string {
  return isPayFastSandbox() ? "https://sandbox.payfast.co.za" : "https://www.payfast.co.za";
}

function getPayFastProcessUrl(): string {
  return `${getPayFastBaseUrl()}/eng/process`;
}

function buildPayFastQueryString(data: Record<string, string>, passphrase?: string): string {
  const segments: string[] = [];

  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (key === "signature" || value === undefined || value === null || value === "") {
      return;
    }
    segments.push(`${key}=${encodeURIComponent(String(value).trim()).replace(/%20/g, "+")}`);
  });

  if (passphrase) {
    segments.push(`passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`);
  }

  return segments.join("&");
}

function generatePayFastSignature(data: Record<string, string>, passphrase?: string): string {
  return md5Hex(buildPayFastQueryString(data, passphrase));
}

function mapPayFastStatus(paymentStatus?: string): string {
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

async function sendCompetitionTicketEmail(details: {
  participantName: string;
  participantPhone: string;
  email: string;
  ticketNumber: string;
  paymentReference: string;
  competitionTitle: string;
  prize: string;
  entryPrice: number;
  competitionPeriod: string;
  drawDate: string;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !details.email) {
    return false;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #1f2937;">
      <h1 style="font-size: 24px; color: #111827; margin-bottom: 16px;">Your competition ticket is confirmed</h1>
      <p style="margin-bottom: 8px;">Name: ${details.participantName}</p>
      <p style="margin-bottom: 8px;">Ticket: <strong>${details.ticketNumber}</strong></p>
      <p style="margin-bottom: 8px;">Reference: ${details.paymentReference}</p>
      <p style="margin-bottom: 8px;">Competition: ${details.competitionTitle}</p>
      <p style="margin-bottom: 8px;">Prize: ${details.prize}</p>
      <p style="margin-bottom: 8px;">Entry price: R${details.entryPrice.toFixed(2)}</p>
      <p style="margin-bottom: 8px;">Competition period: ${details.competitionPeriod}</p>
      <p style="margin-bottom: 16px;">Draw date: ${details.drawDate}</p>
      <p style="margin-bottom: 0;">Phone: ${details.participantPhone || "-"}</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Sello Saka Foundation Tickets <onboarding@resend.dev>",
      to: [details.email],
      subject: `Your Competition Ticket - ${details.ticketNumber}`,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send ticket email: ${errorText}`);
  }

  return true;
}

export const createPayment = action({
  args: {
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
    const initialized: any = await ctx.runMutation(internal.payments.initializePaymentRecord, args);

    if (args.provider === "payfast") {
      const merchantId = getRequiredEnv("PAYFAST_MERCHANT_ID");
      const merchantKey = getRequiredEnv("PAYFAST_MERCHANT_KEY");
      const passphrase = process.env.PAYFAST_PASSPHRASE || "";
      const notifyUrl = `${getConvexSiteUrl()}/payfast-webhook`;

      const formFields: Record<string, string> = {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: initialized.return_url || "",
        cancel_url: initialized.cancel_url || "",
        notify_url: notifyUrl,
        name_first: initialized.payer_name,
        email_address: initialized.payer_email,
        m_payment_id: initialized.payment_reference,
        amount: Number(initialized.amount).toFixed(2),
        item_name: initialized.item_name,
        custom_str1: initialized.purpose,
        custom_str2: initialized.metadata?.competition_id || "",
        custom_str3: initialized.payer_phone || "",
      };

      return {
        provider: initialized.provider,
        purpose: initialized.purpose,
        payment_reference: initialized.payment_reference,
        process_url: getPayFastProcessUrl(),
        form_fields: {
          ...formFields,
          signature: generatePayFastSignature(formFields, passphrase),
        },
      };
    }

    return {
      provider: initialized.provider,
      purpose: initialized.purpose,
      payment_reference: initialized.payment_reference,
      amount: initialized.amount,
      email: initialized.email,
      metadata: initialized.metadata,
    };
  },
});

export const verifyPayment = action({
  args: {
    reference: v.string(),
    payment_reference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      throw new Error("Missing PAYSTACK_SECRET_KEY");
    }

    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${args.reference}`, {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data?.status !== "success") {
      throw new Error(verifyData.message || "Payment verification failed");
    }

    const paymentData = verifyData.data;
    const metadata = paymentData.metadata || {};
    const internalReference = metadata.payment_reference || args.payment_reference;

    if (!internalReference) {
      throw new Error("Missing internal payment reference");
    }

    const finalized: any = await ctx.runMutation(internal.payments.finalizeVerifiedPayment, {
      paymentReference: internalReference,
      provider: "paystack",
      providerPaymentId: args.reference,
      providerStatus: paymentData.status,
      providerPayload: paymentData,
      amount: Number(paymentData.amount) / 100,
    });

    if (finalized.purpose === "competition_entry" && finalized.competition_success && finalized.competitionEmail) {
      await sendCompetitionTicketEmail(finalized.competitionEmail);
      if (finalized.competitionEmail.entryId) {
        await ctx.runMutation(internal.payments.markTicketEmailed, {
          entryId: finalized.competitionEmail.entryId,
        });
      }
    }

    return finalized;
  },
});

export const payfastWebhook = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    getRequiredEnv("PAYFAST_MERCHANT_ID");

    const body = await request.text();
    const params = new URLSearchParams(body);
    const payload: Record<string, string> = {};
    let signature = "";

    params.forEach((value, key) => {
      if (key === "signature") {
        signature = value;
      } else {
        payload[key] = value;
      }
    });

    const paymentReference = payload.m_payment_id;
    if (!paymentReference) {
      return new Response("Missing m_payment_id", { status: 400 });
    }

    const paymentRecord: any = await ctx.runQuery(internal.payments.getPaymentRecordByReference, {
      paymentReference,
    });

    const expectedSignature = generatePayFastSignature(payload, process.env.PAYFAST_PASSPHRASE || "");
    if (expectedSignature !== signature) {
      throw new Error("Invalid PayFast signature");
    }

    if (payload.merchant_id !== process.env.PAYFAST_MERCHANT_ID) {
      throw new Error("Merchant ID mismatch");
    }

    const amountGross = Number(payload.amount_gross || payload.amount_fee || payload.amount || 0);
    if (amountGross && amountGross.toFixed(2) !== Number(paymentRecord.amount).toFixed(2)) {
      throw new Error("Payment amount mismatch");
    }

    const mappedStatus = mapPayFastStatus(payload.payment_status);
    if (mappedStatus !== "completed") {
      await ctx.runMutation(internal.payments.recordGatewayStatus, {
        paymentReference,
        providerPaymentId: payload.pf_payment_id || undefined,
        providerStatus: payload.payment_status || undefined,
        providerPayload: payload,
        status: mappedStatus,
        amount: amountGross || undefined,
      });
      return new Response("OK", { status: 200 });
    }

    const finalized: any = await ctx.runMutation(internal.payments.finalizeVerifiedPayment, {
      paymentReference,
      provider: "payfast",
      providerPaymentId: payload.pf_payment_id || undefined,
      providerStatus: payload.payment_status || undefined,
      providerPayload: payload,
      amount: amountGross || undefined,
    });

    if (finalized.purpose === "competition_entry" && finalized.competitionEmail) {
      await sendCompetitionTicketEmail(finalized.competitionEmail);
      if (finalized.competitionEmail.entryId) {
        await ctx.runMutation(internal.payments.markTicketEmailed, {
          entryId: finalized.competitionEmail.entryId,
        });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("PayFast webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

export const paystackWebhook = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return new Response("Server config error", { status: 500 });
    }

    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";
    const hash = await hmacSha512Hex(secret, body);

    if (hash !== signature) {
      return new Response("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(body);
    if (payload.event !== "charge.success") {
      return new Response("OK", { status: 200 });
    }

    const { reference, metadata } = payload.data;
    const paymentReference = metadata?.payment_reference;
    if (!paymentReference) {
      return new Response("Missing payment reference", { status: 400 });
    }

    const finalized: any = await ctx.runMutation(internal.payments.finalizeVerifiedPayment, {
      paymentReference,
      provider: "paystack",
      providerPaymentId: reference,
      providerStatus: payload.data.status,
      providerPayload: payload.data,
      amount: Number(payload.data.amount) / 100,
    });

    if (finalized.purpose === "competition_entry" && finalized.competitionEmail) {
      await sendCompetitionTicketEmail(finalized.competitionEmail);
      if (finalized.competitionEmail.entryId) {
        await ctx.runMutation(internal.payments.markTicketEmailed, {
          entryId: finalized.competitionEmail.entryId,
        });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return new Response("OK", { status: 200 });
  }
});
