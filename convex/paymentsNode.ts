import { action, httpAction, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import {
  buildCompetitionTicketEmailHtml,
  type CompetitionTicketTemplateData,
} from "../src/integrations/tickets/template";

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

function headersToObject(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
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

function buildPayFastItnSignatureString(data: Record<string, string>, passphrase?: string): string {
  const segments: string[] = [];

  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (key === "signature" || value === undefined || value === null) {
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

function generatePayFastItnSignature(data: Record<string, string>, passphrase?: string): {
  signature: string;
  input: string;
} {
  const input = buildPayFastItnSignatureString(data, passphrase);
  return {
    signature: md5Hex(input),
    input,
  };
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

async function validatePayFastServerConfirmation(payload: Record<string, string>): Promise<{
  requestUrl: string;
  requestBody: string;
  responseStatus: number;
  responseBody: string;
  valid: boolean;
}> {
  const requestUrl = getPayFastValidateUrl();
  const requestBody = buildPayFastQueryString(payload);
  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: requestBody,
  });

  const responseBody = await response.text();
  if (!response.ok) {
    return {
      requestUrl,
      requestBody,
      responseStatus: response.status,
      responseBody,
      valid: false,
    };
  }

  const confirmation = responseBody.trim().toUpperCase();
  return {
    requestUrl,
    requestBody,
    responseStatus: response.status,
    responseBody,
    valid: confirmation === "VALID",
  };
}

async function assertPayFastServerConfirmation(payload: Record<string, string>): Promise<{
  requestUrl: string;
  requestBody: string;
  responseStatus: number;
  responseBody: string;
}> {
  const result = await validatePayFastServerConfirmation(payload);
  if (!result.valid) {
    throw new PayFastValidationError(
      result.responseStatus >= 400
        ? `PayFast server confirmation failed with status ${result.responseStatus}`
        : `PayFast server confirmation returned ${result.responseBody.trim().toUpperCase() || "EMPTY"}`,
    );
  }
  return result;
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

function getTicketPdfRenderUrl(): string {
  const explicit = getOptionalEnv("TICKET_PDF_RENDER_URL");
  if (explicit) {
    return isPublicTicketRenderUrl(explicit) ? explicit.replace(/\/$/, "") : "";
  }
  const siteUrl =
    getOptionalEnv("SITE_URL") ||
    getOptionalEnv("DEPLOY_PRIME_URL") ||
    getOptionalEnv("URL") ||
    getOptionalEnv("DEPLOY_URL");
  if (!siteUrl || !/^https?:\/\//i.test(siteUrl)) {
    return "";
  }
  if (!isPublicTicketRenderUrl(siteUrl)) {
    return "";
  }
  return `${siteUrl.replace(/\/$/, "")}/.netlify/functions/competition-ticket-pdf`;
}

function isPublicTicketRenderUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return false;
    }
    if (
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    ) {
      return false;
    }
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

async function renderCompetitionTicketPdf(
  details: CompetitionTicketTemplateData,
): Promise<string | null> {
  const renderUrl = getTicketPdfRenderUrl();
  if (!renderUrl) {
    return null;
  }

  const response = await fetch(renderUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ticket: details }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ticket PDF render failed: ${response.status} ${errorText}`);
  }

  return arrayBufferToBase64(await response.arrayBuffer());
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
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !details.email) {
    return false;
  }

  let attachment: { filename: string; content: string } | null = null;
  try {
    const renderedPdfBase64 = await renderCompetitionTicketPdf(details);
    if (renderedPdfBase64) {
      attachment = {
        filename: `${details.ticketNumber}.pdf`,
        content: renderedPdfBase64,
      };
    }
  } catch (error) {
    console.error("Ticket PDF render failed for email attachment:", error);
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
      attachments: attachment ? [attachment] : [],
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

  let emailSent = false;
  try {
    emailSent = await sendCompetitionTicketEmail(finalized.competitionEmail);
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
          ticket_emailed: Boolean(emailSent),
        }
      : finalized.competition_success,
  };
}

async function processPayFastControlPayload(
  ctx: any,
  args: {
    channel: "webhook" | "manual_recovery" | "internal_retry";
    payload: Record<string, string>;
    signature: string;
    rawInboundBody?: string;
    rawInboundHeaders?: Record<string, string>;
  },
): Promise<any> {
  const paymentReference = args.payload.m_payment_id;
  if (!paymentReference) {
    await ctx.runMutation(internal.payments.appendReconciliationEvent, {
      provider: "payfast",
      channel: args.channel,
      eventType: "payment_match_failed",
      paymentReference: "",
      providerPaymentId: args.payload.pf_payment_id || undefined,
      rawInboundBody: args.rawInboundBody,
      rawInboundHeaders: args.rawInboundHeaders,
      parsedProviderStatus: args.payload.payment_status || undefined,
      processingResult: "missing_payment_reference",
      errorMessage: "Missing m_payment_id",
    });
    throw new PayFastValidationError("Missing m_payment_id");
  }

  if (args.channel === "webhook") {
    await ctx.runMutation(internal.payments.appendReconciliationEvent, {
      provider: "payfast",
      channel: args.channel,
      eventType: "webhook_received",
      paymentReference,
      providerPaymentId: args.payload.pf_payment_id || undefined,
      rawInboundBody: args.rawInboundBody,
      rawInboundHeaders: args.rawInboundHeaders,
      parsedProviderStatus: args.payload.payment_status || undefined,
      processingResult: "received",
    });
  }

  let paymentRecord: any;
  try {
    paymentRecord = await ctx.runQuery(internal.payments.getPaymentRecordByReference, {
      paymentReference,
    });
  } catch (error) {
    await ctx.runMutation(internal.payments.appendReconciliationEvent, {
      provider: "payfast",
      channel: args.channel,
      eventType: "payment_match_failed",
      paymentReference,
      providerPaymentId: args.payload.pf_payment_id || undefined,
      rawInboundBody: args.rawInboundBody,
      rawInboundHeaders: args.rawInboundHeaders,
      parsedProviderStatus: args.payload.payment_status || undefined,
      processingResult: "payment_record_not_found",
      errorMessage: error instanceof Error ? error.message : "Payment record not found",
    });
    throw error;
  }

  await ctx.runMutation(internal.payments.appendReconciliationEvent, {
    provider: "payfast",
    channel: args.channel,
    eventType: "payment_matched",
    paymentReference,
    providerPaymentId: args.payload.pf_payment_id || undefined,
    paymentRecordId: paymentRecord._id,
    statusBefore: paymentRecord.status,
    parsedProviderStatus: args.payload.payment_status || undefined,
    processingResult: "matched_payment_record",
  });

  const expectedSignature = generatePayFastItnSignature(args.payload, getOptionalEnv("PAYFAST_PASSPHRASE"));
  if (expectedSignature.signature !== args.signature) {
    await ctx.runMutation(internal.payments.appendReconciliationEvent, {
      provider: "payfast",
      channel: args.channel,
      eventType: "webhook_signature_failed",
      paymentReference,
      providerPaymentId: args.payload.pf_payment_id || undefined,
      paymentRecordId: paymentRecord._id,
      statusBefore: paymentRecord.status,
      parsedProviderStatus: args.payload.payment_status || undefined,
      signatureValid: false,
      signatureInput: expectedSignature.input,
      signatureExpected: expectedSignature.signature,
      signatureReceived: args.signature,
      processingResult: "invalid_signature",
      errorMessage: "Invalid PayFast signature",
    });
    throw new PayFastValidationError("Invalid PayFast signature");
  }

  await ctx.runMutation(internal.payments.appendReconciliationEvent, {
    provider: "payfast",
    channel: args.channel,
    eventType: "webhook_signature_verified",
    paymentReference,
    providerPaymentId: args.payload.pf_payment_id || undefined,
    paymentRecordId: paymentRecord._id,
    statusBefore: paymentRecord.status,
    parsedProviderStatus: args.payload.payment_status || undefined,
    signatureValid: true,
    signatureInput: expectedSignature.input,
    signatureExpected: expectedSignature.signature,
    signatureReceived: args.signature,
    processingResult: "signature_valid",
  });

  const merchantMatch = args.payload.merchant_id === process.env.PAYFAST_MERCHANT_ID;
  if (!merchantMatch) {
    await ctx.runMutation(internal.payments.appendReconciliationEvent, {
      provider: "payfast",
      channel: args.channel,
      eventType: "provider_validation_failed",
      paymentReference,
      providerPaymentId: args.payload.pf_payment_id || undefined,
      paymentRecordId: paymentRecord._id,
      statusBefore: paymentRecord.status,
      parsedProviderStatus: args.payload.payment_status || undefined,
      merchantMatch: false,
      processingResult: "merchant_id_mismatch",
      errorMessage: "Merchant ID mismatch",
    });
    throw new PayFastValidationError("Merchant ID mismatch");
  }

  try {
    assertPayFastPaymentContext(args.payload, paymentRecord);
  } catch (error) {
    await ctx.runMutation(internal.payments.appendReconciliationEvent, {
      provider: "payfast",
      channel: args.channel,
      eventType: "provider_validation_failed",
      paymentReference,
      providerPaymentId: args.payload.pf_payment_id || undefined,
      paymentRecordId: paymentRecord._id,
      statusBefore: paymentRecord.status,
      parsedProviderStatus: args.payload.payment_status || undefined,
      merchantMatch: true,
      amountMatch: false,
      processingResult: "payment_context_mismatch",
      errorMessage: error instanceof Error ? error.message : "Payment context mismatch",
    });
    throw error;
  }

  const validationRequestBody = buildPayFastQueryString(args.payload);
  const validationUrl = getPayFastValidateUrl();
  await ctx.runMutation(internal.payments.appendReconciliationEvent, {
    provider: "payfast",
    channel: args.channel,
    eventType: "provider_validation_requested",
    paymentReference,
    providerPaymentId: args.payload.pf_payment_id || undefined,
    paymentRecordId: paymentRecord._id,
    statusBefore: paymentRecord.status,
    parsedProviderStatus: args.payload.payment_status || undefined,
    signatureValid: true,
    merchantMatch: true,
    amountMatch: true,
    rawOutboundUrl: validationUrl,
    rawOutboundMethod: "POST",
    rawOutboundBody: validationRequestBody,
    processingResult: "validation_requested",
  });

  const validationResult = await validatePayFastServerConfirmation(args.payload);
  if (!validationResult.valid) {
    const validationError =
      validationResult.responseStatus >= 400
        ? `PayFast server confirmation failed with status ${validationResult.responseStatus}`
        : `PayFast server confirmation returned ${validationResult.responseBody.trim().toUpperCase() || "EMPTY"}`;
    await ctx.runMutation(internal.payments.appendReconciliationEvent, {
      provider: "payfast",
      channel: args.channel,
      eventType: "provider_validation_failed",
      paymentReference,
      providerPaymentId: args.payload.pf_payment_id || undefined,
      paymentRecordId: paymentRecord._id,
      statusBefore: paymentRecord.status,
      parsedProviderStatus: args.payload.payment_status || undefined,
      signatureValid: true,
      merchantMatch: true,
      amountMatch: true,
      rawOutboundUrl: validationResult.requestUrl,
      rawOutboundMethod: "POST",
      rawOutboundBody: validationResult.requestBody,
      rawResponseStatus: validationResult.responseStatus,
      rawResponseBody: validationResult.responseBody,
      processingResult: "validation_failed",
      errorMessage: validationError,
    });
    throw new PayFastValidationError(validationError);
  }

  await ctx.runMutation(internal.payments.appendReconciliationEvent, {
    provider: "payfast",
    channel: args.channel,
    eventType: "provider_validation_succeeded",
    paymentReference,
    providerPaymentId: args.payload.pf_payment_id || undefined,
    paymentRecordId: paymentRecord._id,
    statusBefore: paymentRecord.status,
    parsedProviderStatus: args.payload.payment_status || undefined,
    signatureValid: true,
    merchantMatch: true,
    amountMatch: true,
    rawOutboundUrl: validationResult.requestUrl,
    rawOutboundMethod: "POST",
    rawOutboundBody: validationResult.requestBody,
    rawResponseStatus: validationResult.responseStatus,
    rawResponseBody: validationResult.responseBody,
    processingResult: "validation_succeeded",
  });

  const mappedStatus = mapPayFastStatus(args.payload.payment_status);
  const amountGross = Number(args.payload.amount_gross || args.payload.amount || 0);
  if (mappedStatus !== "completed") {
    await ctx.runMutation(internal.payments.recordGatewayStatus, {
      paymentReference,
      providerPaymentId: args.payload.pf_payment_id || undefined,
      providerStatus: args.payload.payment_status || undefined,
      providerPayload: args.payload,
      status: mappedStatus,
      amount: amountGross || undefined,
    });
    return { success: true, pending: true, paymentReference, mappedStatus };
  }

  const finalized: any = await ctx.runMutation(internal.payments.finalizeVerifiedPayment, {
    paymentReference,
    provider: "payfast",
    providerPaymentId: args.payload.pf_payment_id || undefined,
    providerStatus: args.payload.payment_status || undefined,
    providerPayload: args.payload,
    amount: amountGross || undefined,
  });

  await ctx.runMutation(internal.payments.appendReconciliationEvent, {
    provider: "payfast",
    channel: args.channel,
    eventType: paymentRecord.status === "completed" ? "payment_finalize_skipped_duplicate" : "payment_finalized",
    paymentReference,
    providerPaymentId: args.payload.pf_payment_id || undefined,
    paymentRecordId: paymentRecord._id,
    statusBefore: paymentRecord.status,
    statusAfter: "completed",
    parsedProviderStatus: args.payload.payment_status || undefined,
    duplicateDetected: paymentRecord.status === "completed",
    processingResult: paymentRecord.status === "completed" ? "duplicate_ignored" : "payment_completed",
  });

  return await maybeSendCompetitionTicketEmail(ctx, finalized);
}

export const createPayment = action({
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

export const competitionTicketData = httpAction(async (ctx, request) => {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const url = new URL(request.url);
  const paymentReference = url.searchParams.get("payment_reference");
  if (!paymentReference) {
    return new Response("Missing payment_reference", { status: 400 });
  }

  const details = await ctx.runQuery(internal.payments.getCompetitionTicketEmailData, {
    paymentReference,
  });

  if (!details) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(JSON.stringify(details), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
});

export const payfastWebhook = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    getRequiredEnv("PAYFAST_MERCHANT_ID");

    const body = await request.text();
    const inboundHeaders = headersToObject(request.headers);
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
    await warnIfPayFastSourceUnrecognized(request);
    await processPayFastControlPayload(ctx, {
      channel: "webhook",
      payload,
      signature,
      rawInboundBody: body,
      rawInboundHeaders: inboundHeaders,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("PayFast webhook error:", error);
    if (error instanceof PayFastValidationError) {
      return new Response("OK", { status: 200 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
});

async function replayStoredPayfastWebhook(
  ctx: any,
  args: {
    paymentReference: string;
    channel: "manual_recovery" | "internal_retry";
    requestedEventType: "manual_reconciliation_requested" | "internal_retry_requested";
    succeededEventType: "manual_reconciliation_succeeded" | "internal_retry_succeeded";
    failedEventType: "manual_reconciliation_failed" | "internal_retry_failed";
    browserObservedPending?: boolean;
    throwOnFailure?: boolean;
  },
) {
  await ctx.runMutation(internal.payments.appendReconciliationEvent, {
    provider: "payfast",
    channel: args.channel,
    eventType: args.requestedEventType,
    paymentReference: args.paymentReference,
    processingResult: args.requestedEventType,
  });

  const paymentRecord: any = await ctx.runQuery(internal.payments.getPaymentRecordByReference, {
    paymentReference: args.paymentReference,
  });

  if (args.browserObservedPending) {
    await ctx.runMutation(internal.payments.appendReconciliationEvent, {
      provider: "payfast",
      channel: "browser_return",
      eventType: paymentRecord.status === "completed" ? "return_page_observed_completed" : "return_page_observed_pending",
      paymentReference: args.paymentReference,
      paymentRecordId: paymentRecord._id,
      statusBefore: paymentRecord.status,
      processingResult:
        paymentRecord.status === "completed"
          ? "browser_return_observed_completed"
          : "browser_return_observed_pending",
    });
  }

  if (paymentRecord.provider !== "payfast") {
    await ctx.runMutation(internal.payments.appendReconciliationEvent, {
      provider: "payfast",
      channel: args.channel,
      eventType: args.failedEventType,
      paymentReference: args.paymentReference,
      paymentRecordId: paymentRecord._id,
      statusBefore: paymentRecord.status,
      processingResult: "not_payfast_payment",
      errorMessage: "Payment is not a PayFast payment",
    });
    if (args.throwOnFailure) {
      throw new Error("Payment is not a PayFast payment");
    }
    return { success: false, pending: paymentRecord.status !== "completed", reason: "not_payfast_payment" };
  }

  if (paymentRecord.status === "completed") {
    await ctx.runMutation(internal.payments.appendReconciliationEvent, {
      provider: "payfast",
      channel: args.channel,
      eventType: args.succeededEventType,
      paymentReference: args.paymentReference,
      paymentRecordId: paymentRecord._id,
      statusBefore: paymentRecord.status,
      statusAfter: paymentRecord.status,
      duplicateDetected: true,
      processingResult: "already_completed",
    });
    return { success: true, pending: false, reason: "already_completed" };
  }

  const reconciliationEvents: any[] = await ctx.runQuery(
    internal.payments.listReconciliationEventsByPaymentReference,
    { paymentReference: args.paymentReference },
  );
  const webhookReceipt = [...reconciliationEvents]
    .reverse()
    .find((event) => event.event_type === "webhook_received" && typeof event.raw_inbound_body === "string");

  if (!webhookReceipt?.raw_inbound_body) {
    await ctx.runMutation(internal.payments.appendReconciliationEvent, {
      provider: "payfast",
      channel: args.channel,
      eventType: args.failedEventType,
      paymentReference: args.paymentReference,
      paymentRecordId: paymentRecord._id,
      statusBefore: paymentRecord.status,
      processingResult: "missing_webhook_payload",
      errorMessage: "No stored webhook payload available for replay",
    });
    if (args.throwOnFailure) {
      throw new Error("No stored webhook payload available for replay");
    }
    return { success: false, pending: true, reason: "missing_webhook_payload" };
  }

  const params = new URLSearchParams(webhookReceipt.raw_inbound_body);
  const payload: Record<string, string> = {};
  let signature = "";
  params.forEach((value, key) => {
    if (key === "signature") {
      signature = value;
    } else {
      payload[key] = value;
    }
  });

  try {
    const result = await processPayFastControlPayload(ctx, {
      channel: args.channel,
      payload,
      signature,
      rawInboundBody: webhookReceipt.raw_inbound_body,
      rawInboundHeaders: webhookReceipt.raw_inbound_headers ?? undefined,
    });
    await ctx.runMutation(internal.payments.appendReconciliationEvent, {
      provider: "payfast",
      channel: args.channel,
      eventType: args.succeededEventType,
      paymentReference: args.paymentReference,
      paymentRecordId: paymentRecord._id,
      statusBefore: paymentRecord.status,
      statusAfter: result?.success && !result?.pending ? "completed" : paymentRecord.status,
      processingResult:
        result?.pending ? `${args.channel}_pending` : `${args.channel}_completed`,
    });
    return result;
  } catch (error) {
    await ctx.runMutation(internal.payments.appendReconciliationEvent, {
      provider: "payfast",
      channel: args.channel,
      eventType: args.failedEventType,
      paymentReference: args.paymentReference,
      paymentRecordId: paymentRecord._id,
      statusBefore: paymentRecord.status,
      processingResult: `${args.channel}_failed`,
      errorMessage: error instanceof Error ? error.message : "PayFast replay failed",
    });
    if (args.throwOnFailure) {
      throw error;
    }
    return {
      success: false,
      pending: true,
      reason: error instanceof Error ? error.message : "PayFast replay failed",
    };
  }
}

export const manuallyReconcilePayfastPayment = internalAction({
  args: {
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    return await replayStoredPayfastWebhook(ctx, {
      paymentReference: args.paymentReference,
      channel: "manual_recovery",
      requestedEventType: "manual_reconciliation_requested",
      succeededEventType: "manual_reconciliation_succeeded",
      failedEventType: "manual_reconciliation_failed",
      throwOnFailure: true,
    });
  },
});

export const retryPendingPayfastPayment = action({
  args: {
    paymentReference: v.string(),
    source: v.union(v.literal("browser_return"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    return await replayStoredPayfastWebhook(ctx, {
      paymentReference: args.paymentReference,
      channel: "internal_retry",
      requestedEventType: "internal_retry_requested",
      succeededEventType: "internal_retry_succeeded",
      failedEventType: "internal_retry_failed",
      browserObservedPending: args.source === "browser_return",
      throwOnFailure: false,
    });
  },
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
