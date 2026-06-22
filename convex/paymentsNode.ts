import { action, httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
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

function normalizeEnvValue(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return normalizeEnvValue(value);
}

function getOptionalEnv(name: string): string {
  const value = process.env[name];
  return value ? normalizeEnvValue(value) : "";
}

function getTicketFromAddress(): string {
  return (
    getOptionalEnv("TICKETS_EMAIL_FROM") ||
    getOptionalEnv("AUTH_EMAIL_FROM") ||
    "Sello Saka Foundation Tickets <tickets@mail.sellosakafoundation.org>"
  );
}

function isPayFastSandbox(): boolean {
  return getOptionalEnv("PAYFAST_SANDBOX")
    ? getOptionalEnv("PAYFAST_SANDBOX").toLowerCase() === "true"
    : true;
}

function getPayFastBaseUrl(): string {
  return isPayFastSandbox() ? "https://sandbox.payfast.co.za" : "https://www.payfast.co.za";
}

function getPayFastProcessUrl(): string {
  return `${getPayFastBaseUrl()}/eng/process`;
}

function getPayFastValidateUrl(): string {
  return `${getPayFastBaseUrl()}/eng/query/validate`;
}

const PAYFAST_VALID_HOSTS = [
  "www.payfast.co.za",
  "sandbox.payfast.co.za",
  "w1w.payfast.co.za",
  "w2w.payfast.co.za",
];

class PayFastValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayFastValidationError";
  }
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

function normalizeIpAddress(value: string): string {
  const normalized = value.trim();
  return normalized.startsWith("::ffff:") ? normalized.slice(7) : normalized;
}

function getForwardedRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return normalizeIpAddress(forwardedFor.split(",")[0] || "");
  }

  const fallbackHeaders = ["x-real-ip", "cf-connecting-ip", "fly-client-ip"];
  for (const header of fallbackHeaders) {
    const value = request.headers.get(header);
    if (value) {
      return normalizeIpAddress(value);
    }
  }

  return null;
}

async function resolvePayFastHostIps(hostname: string): Promise<string[]> {
  const recordTypes = ["A", "AAAA"];
  const responses = await Promise.all(
    recordTypes.map(async (recordType) => {
      const response = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=${recordType}`,
      );
      if (!response.ok) {
        throw new Error(`DNS lookup failed for ${hostname} (${recordType})`);
      }
      return response.json();
    }),
  );

  return responses.flatMap((payload) =>
    Array.isArray(payload.Answer)
      ? payload.Answer.map((answer: { data?: string }) => answer.data).filter(
          (value: string | undefined): value is string => typeof value === "string" && value.length > 0,
        )
      : [],
  );
}

async function warnIfPayFastSourceUnrecognized(request: Request): Promise<void> {
  const requestIp = getForwardedRequestIp(request);
  if (!requestIp) {
    console.warn("PayFast webhook arrived without a forwarded client IP header");
    return;
  }

  const resolvedIpSets = await Promise.allSettled(PAYFAST_VALID_HOSTS.map((hostname) => resolvePayFastHostIps(hostname)));
  const allowedIps = new Set<string>();

  for (const result of resolvedIpSets) {
    if (result.status === "fulfilled") {
      for (const ip of result.value) {
        allowedIps.add(normalizeIpAddress(ip));
      }
    }
  }

  if (allowedIps.size === 0) {
    console.warn("Unable to resolve PayFast validation host IP addresses; continuing with server confirmation");
    return;
  }

  if (!allowedIps.has(requestIp)) {
    console.warn(`PayFast webhook source IP ${requestIp} is not in the resolved PayFast host list; continuing with server confirmation`);
  }
}

async function assertPayFastServerConfirmation(payload: Record<string, string>): Promise<void> {
  const response = await fetch(getPayFastValidateUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: buildPayFastQueryString(payload),
  });

  if (!response.ok) {
    throw new Error(`PayFast server confirmation failed with status ${response.status}`);
  }

  const confirmation = (await response.text()).trim().toUpperCase();
  if (confirmation !== "VALID") {
    throw new PayFastValidationError(`PayFast server confirmation returned ${confirmation || "EMPTY"}`);
  }
}

function toFixedAmount(value?: string): string | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed.toFixed(2);
}

function buildPayFastFormFields(initialized: {
  return_url?: string;
  cancel_url?: string;
  payer_name: string;
  payer_email: string;
  payer_phone?: string;
  payment_reference: string;
  amount: number;
  item_name: string;
  purpose: string;
  metadata?: {
    purpose_context?: string | null;
  };
}, notifyUrl: string): Record<string, string> {
  const merchantId = getRequiredEnv("PAYFAST_MERCHANT_ID");
  const merchantKey = getRequiredEnv("PAYFAST_MERCHANT_KEY");

  return {
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
    custom_str2: initialized.metadata?.purpose_context || "",
    custom_str3: initialized.payer_phone || "",
  };
}

function assertPayFastPaymentContext(
  payload: Record<string, string>,
  paymentRecord: {
    provider?: string;
    purpose?: string;
    purpose_context?: string | null;
    amount?: number;
  },
): void {
  if (paymentRecord.provider !== "payfast") {
    throw new PayFastValidationError("Payment record provider does not match PayFast");
  }

  if ((payload.custom_str1 || "") !== (paymentRecord.purpose || "")) {
    throw new PayFastValidationError("Payment purpose mismatch");
  }

  const expectedContext = paymentRecord.purpose_context;
  if (typeof expectedContext === "string" && (payload.custom_str2 || "") !== expectedContext) {
    throw new PayFastValidationError("Payment context mismatch");
  }

  const expectedAmount = Number(paymentRecord.amount || 0).toFixed(2);
  const grossAmount = toFixedAmount(payload.amount_gross) || toFixedAmount(payload.amount);
  if (grossAmount && grossAmount !== expectedAmount) {
    throw new PayFastValidationError("Payment amount mismatch");
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(value: number): string {
  return `R${Number(value || 0).toFixed(2)}`;
}

function buildCompetitionTicketEmailHtml(details: {
  participantName: string;
  participantPhone: string;
  email: string;
  ticketNumber: string;
  paymentReference: string;
  competitionTitle: string;
  prize: string;
  entryPrice: number;
  competitionPeriod: string;
  competitionStartDate: string;
  competitionEndDate: string;
  drawDate: string;
  entryDate: string;
  supportLine: string;
  websiteUrl: string;
  foundationEmail: string;
}) {
  return `
    <div style="background:#f5f7fb;padding:24px 12px;font-family:Arial,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:980px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;">
        <tr>
          <td style="padding:0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td valign="top" style="width:64%;padding:36px 40px 28px 40px;background:#ffffff;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="font-size:0;line-height:0;padding-bottom:28px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td valign="middle" style="width:44px;">
                              <div style="width:36px;height:36px;border:1px solid #c9a44c;border-radius:999px;color:#c9a44c;font-size:13px;font-weight:700;line-height:36px;text-align:center;">SS</div>
                            </td>
                            <td valign="middle" style="font-size:18px;font-weight:700;color:#122033;letter-spacing:0.2px;">Sello Saka Foundation</td>
                            <td valign="middle" align="right" style="font-size:12px;line-height:1.5;color:#6e7b8a;font-weight:700;letter-spacing:3px;text-transform:uppercase;">
                              Official<br/>Fundraising Ticket
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:14px;color:#324253;font-size:18px;font-family:Times,serif;font-style:italic;">${escapeHtml(details.supportLine)}</td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:28px;color:#122033;font-size:34px;line-height:1.05;font-weight:800;text-transform:uppercase;">${escapeHtml(details.competitionTitle)}</td>
                    </tr>
                    <tr>
                      <td>
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td valign="top" style="width:33%;padding-right:16px;">
                              <div style="font-size:12px;color:#6e7b8a;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding-bottom:8px;">Competition Period</div>
                              <div style="font-size:16px;line-height:1.45;color:#122033;font-weight:700;">${escapeHtml(details.competitionStartDate)} - ${escapeHtml(details.competitionEndDate)}</div>
                            </td>
                            <td valign="top" style="width:23%;padding-right:16px;">
                              <div style="font-size:12px;color:#6e7b8a;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding-bottom:8px;">Draw Date</div>
                              <div style="font-size:17px;line-height:1.45;color:#122033;font-weight:700;">${escapeHtml(details.drawDate)}</div>
                            </td>
                            <td valign="top" style="width:22%;padding-right:16px;">
                              <div style="font-size:12px;color:#6e7b8a;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding-bottom:8px;">Entry Price</div>
                              <div style="font-size:22px;line-height:1.2;color:#2b5164;font-weight:800;">${formatCurrency(details.entryPrice)}</div>
                            </td>
                            <td valign="top" style="width:22%;">
                              <div style="font-size:12px;color:#6e7b8a;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding-bottom:8px;">Entry Day</div>
                              <div style="font-size:16px;line-height:1.45;color:#122033;font-weight:700;">${escapeHtml(details.entryDate)}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
                <td valign="top" style="width:36%;background:#2f4d5c;color:#ffffff;padding:28px 28px 24px 28px;">
                  <div style="font-size:12px;line-height:1.5;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding-bottom:14px;">Participant Stub</div>
                  <div style="font-size:18px;font-weight:700;padding-bottom:20px;">REF-${escapeHtml(details.ticketNumber)}</div>
                  <div style="border-top:1px solid rgba(255,255,255,0.22);padding-top:20px;margin-top:6px;">
                    <div style="font-size:12px;color:#d4dde5;letter-spacing:1px;padding-bottom:6px;">Participant Name</div>
                    <div style="font-size:16px;color:#ffffff;padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.22);">${escapeHtml(details.participantName)}</div>
                    <div style="font-size:12px;color:#d4dde5;letter-spacing:1px;padding:18px 0 6px;">Phone Number</div>
                    <div style="font-size:16px;color:#ffffff;padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.22);">${escapeHtml(details.participantPhone || "-")}</div>
                    <div style="font-size:12px;color:#d4dde5;letter-spacing:1px;padding:18px 0 6px;">Email Address</div>
                    <div style="font-size:16px;color:#ffffff;padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.22);word-break:break-word;">${escapeHtml(details.email)}</div>
                  </div>
                  <div style="padding-top:34px;text-align:center;">
                    <div style="font-size:22px;font-weight:800;letter-spacing:0.5px;">${escapeHtml(details.ticketNumber)}</div>
                    <div style="font-size:13px;color:#d4dde5;padding-top:8px;">${escapeHtml(details.foundationEmail)}</div>
                    <div style="font-size:13px;color:#d4dde5;padding-top:4px;">${escapeHtml(details.websiteUrl)}</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <div style="max-width:980px;margin:14px auto 0;color:#667085;font-size:12px;line-height:1.5;padding:0 8px;">
        Payment reference: ${escapeHtml(details.paymentReference)}<br/>
        Prize: ${escapeHtml(details.prize)}<br/>
        Competition period: ${escapeHtml(details.competitionPeriod)}
      </div>
    </div>
  `;
}

async function generateCompetitionTicketPdf(details: {
  participantName: string;
  participantPhone: string;
  email: string;
  ticketNumber: string;
  paymentReference: string;
  competitionTitle: string;
  prize: string;
  entryPrice: number;
  competitionPeriod: string;
  competitionStartDate: string;
  competitionEndDate: string;
  drawDate: string;
  entryDate: string;
  supportLine: string;
  websiteUrl: string;
  foundationEmail: string;
}): Promise<ArrayBuffer> {
  const { jsPDF } = await import("jspdf");
  const pageWidth = 720;
  const pageHeight = 405;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: [pageWidth, pageHeight] });
  const stubX = 455;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 18, 18, "F");
  doc.setDrawColor(224, 229, 235);
  doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 18, 18, "S");

  doc.setFillColor(47, 77, 92);
  doc.roundedRect(stubX, 10, pageWidth - stubX - 10, pageHeight - 20, 0, 0, "F");
  doc.setFillColor(255, 255, 255);
  doc.circle(stubX, pageHeight / 2, 12, "F");

  doc.setDrawColor(201, 164, 76);
  doc.circle(48, 58, 18, "S");
  doc.setTextColor(18, 32, 51);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SS", 41, 63);
  doc.setFontSize(18);
  doc.text("Sello Saka Foundation", 82, 64);

  doc.setFontSize(12);
  doc.setTextColor(110, 123, 138);
  doc.text(["OFFICIAL", "FUNDRAISING TICKET"], 360, 46, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(18);
  doc.setTextColor(50, 66, 83);
  doc.text(details.supportLine, 40, 128);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(31);
  doc.setTextColor(18, 32, 51);
  const titleLines = doc.splitTextToSize(details.competitionTitle.toUpperCase(), 360);
  doc.text(titleLines, 40, 165);

  const bottomY = 323;
  doc.setFontSize(11);
  doc.setTextColor(110, 123, 138);
  doc.text("COMPETITION PERIOD", 40, bottomY);
  doc.text("DRAW DATE", 228, bottomY);
  doc.text("ENTRY PRICE", 412, bottomY);
  doc.text("ENTRY DAY", 545, bottomY);

  doc.setFontSize(16);
  doc.setTextColor(18, 32, 51);
  doc.text([details.competitionStartDate, details.competitionEndDate], 40, bottomY + 22);
  doc.text(details.drawDate, 228, bottomY + 22);
  doc.setFontSize(22);
  doc.setTextColor(43, 81, 100);
  doc.text(formatCurrency(details.entryPrice), 412, bottomY + 24);
  doc.setFontSize(16);
  doc.setTextColor(18, 32, 51);
  doc.text(details.entryDate, 545, bottomY + 22);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PARTICIPANT STUB", stubX + 22, 42);
  doc.setFontSize(18);
  doc.text(`REF-${details.ticketNumber}`, stubX + 22, 72);
  doc.setDrawColor(130, 152, 164);
  doc.line(stubX + 22, 88, pageWidth - 32, 88);

  const stubFields = [
    { label: "Participant Name", value: details.participantName },
    { label: "Phone Number", value: details.participantPhone || "-" },
    { label: "Email Address", value: details.email },
  ];
  let stubY = 124;
  for (const field of stubFields) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(212, 221, 229);
    doc.text(field.label, stubX + 22, stubY);
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    const lines = doc.splitTextToSize(field.value, 205);
    doc.text(lines, stubX + 22, stubY + 20);
    const lineCount = Array.isArray(lines) ? lines.length : 1;
    stubY += 36 + (lineCount - 1) * 13;
    doc.setDrawColor(130, 152, 164);
    doc.line(stubX + 22, stubY, pageWidth - 32, stubY);
    stubY += 18;
  }

  const footerTop = Math.max(stubY + 18, pageHeight - 76);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(details.ticketNumber, stubX + 112, footerTop, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(212, 221, 229);
  doc.text(details.foundationEmail, stubX + 112, footerTop + 16, { align: "center" });
  doc.text(details.websiteUrl, stubX + 112, footerTop + 30, { align: "center" });

  return doc.output("arraybuffer");
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function ensureCompetitionTicketPdf(
  ctx: any,
  details: {
    participantName: string;
    participantPhone: string;
    email: string;
    ticketNumber: string;
    paymentReference: string;
    competitionTitle: string;
    prize: string;
    entryPrice: number;
    competitionPeriod: string;
    competitionStartDate: string;
    competitionEndDate: string;
    drawDate: string;
    entryDate: string;
    supportLine: string;
    websiteUrl: string;
    foundationEmail: string;
    entryId: Id<"competition_entries"> | null;
    ticketPdfStorageId: Id<"_storage"> | null;
  },
  forceRegenerate = false,
): Promise<{ storageId: Id<"_storage">; downloadUrl: string | null; base64: string }> {
  if (!forceRegenerate && details.ticketPdfStorageId) {
    const existingBlob = await ctx.storage.get(details.ticketPdfStorageId);
    const existingBase64 = existingBlob ? arrayBufferToBase64(await existingBlob.arrayBuffer()) : "";
    const existingDownloadUrl = await ctx.storage.getUrl(details.ticketPdfStorageId);
    if (existingBase64) {
      return {
        storageId: details.ticketPdfStorageId,
        downloadUrl: existingDownloadUrl,
        base64: existingBase64,
      };
    }
  }

  const pdfBuffer = await generateCompetitionTicketPdf(details);
  const storageId = await ctx.storage.store(new Blob([pdfBuffer], { type: "application/pdf" }));
  if (details.entryId) {
    await ctx.runMutation(internal.payments.attachTicketPdf, {
      entryId: details.entryId,
      storageId,
    });
  }
  const downloadUrl = await ctx.storage.getUrl(storageId);

  return {
    storageId,
    downloadUrl,
    base64: arrayBufferToBase64(pdfBuffer),
  };
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
  competitionStartDate: string;
  competitionEndDate: string;
  drawDate: string;
  entryDate: string;
  supportLine: string;
  websiteUrl: string;
  foundationEmail: string;
  ticketPdfBase64: string;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !details.email) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getTicketFromAddress(),
      to: [details.email],
      subject: `Your Competition Ticket - ${details.ticketNumber}`,
      html: buildCompetitionTicketEmailHtml(details),
      attachments: [
        {
          filename: `${details.ticketNumber}.pdf`,
          content: details.ticketPdfBase64,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send ticket email: ${errorText}`);
  }

  return true;
}

async function maybeSendCompetitionTicketEmail(
  ctx: any,
  finalized: any,
): Promise<any> {
  if (finalized.purpose !== "competition_entry" || !finalized.competitionEmail) {
    return finalized;
  }

  const ticketDocument = await ensureCompetitionTicketPdf(ctx, finalized.competitionEmail);

  let emailSent = false;
  try {
    emailSent = await sendCompetitionTicketEmail({
      ...finalized.competitionEmail,
      ticketPdfBase64: ticketDocument.base64,
    });
  } catch (error) {
    console.error("Ticket email delivery failed:", error);
  }

  if (emailSent && finalized.competitionEmail.entryId) {
    await ctx.runMutation(internal.payments.markTicketEmailed, {
      entryId: finalized.competitionEmail.entryId,
    });
  }

  return {
    ...finalized,
    competition_success: finalized.competition_success
      ? {
          ...finalized.competition_success,
          ticket_download_url: ticketDocument.downloadUrl,
          ticket_emailed: Boolean(emailSent),
        }
      : finalized.competition_success,
  };
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
      const passphrase = getOptionalEnv("PAYFAST_PASSPHRASE");
      const notifyUrl = `${getConvexSiteUrl()}/payfast-webhook`;
      const formFields = buildPayFastFormFields(initialized, notifyUrl);

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

    return await maybeSendCompetitionTicketEmail(ctx, finalized);
  },
});

export const confirmSandboxPayfastReturn = action({
  args: {
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isPayFastSandbox()) {
      throw new Error("Sandbox PayFast confirmation is disabled outside sandbox mode");
    }

    const paymentRecord: any = await ctx.runQuery(internal.payments.getPaymentRecordByReference, {
      paymentReference: args.paymentReference,
    });

    if (paymentRecord.provider !== "payfast") {
      throw new Error("Payment is not a PayFast payment");
    }

    const finalized: any = await ctx.runMutation(internal.payments.finalizeVerifiedPayment, {
      paymentReference: args.paymentReference,
      provider: "payfast",
      providerStatus: "sandbox_return_confirmed",
      providerPayload: {
        source: "sandbox_return_confirmed",
        confirmedAt: new Date().toISOString(),
      },
      amount: Number(paymentRecord.amount),
    });

    return await maybeSendCompetitionTicketEmail(ctx, finalized);
  },
});

export const ensureCompetitionTicketDownload = action({
  args: {
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    const details = await ctx.runQuery(internal.payments.getCompetitionTicketEmailData, {
      paymentReference: args.paymentReference,
    });

    if (!details) {
      throw new Error("Competition ticket not found for that payment reference");
    }

    const ticketDocument = await ensureCompetitionTicketPdf(ctx, details, true);
    return {
      ticketDownloadUrl: ticketDocument.downloadUrl,
    };
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

    const expectedSignature = generatePayFastSignature(payload, getOptionalEnv("PAYFAST_PASSPHRASE"));
    if (expectedSignature !== signature) {
      throw new PayFastValidationError("Invalid PayFast signature");
    }

    if (payload.merchant_id !== process.env.PAYFAST_MERCHANT_ID) {
      throw new PayFastValidationError("Merchant ID mismatch");
    }

    assertPayFastPaymentContext(payload, paymentRecord);
    await warnIfPayFastSourceUnrecognized(request);
    await assertPayFastServerConfirmation(payload);

    const mappedStatus = mapPayFastStatus(payload.payment_status);
    const amountGross = Number(payload.amount_gross || payload.amount || 0);
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

    await maybeSendCompetitionTicketEmail(ctx, finalized);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("PayFast webhook error:", error);
    if (error instanceof PayFastValidationError) {
      return new Response("OK", { status: 200 });
    }
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

    await maybeSendCompetitionTicketEmail(ctx, finalized);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return new Response("OK", { status: 200 });
  }
});
