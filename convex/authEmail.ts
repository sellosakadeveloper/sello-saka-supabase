import { BOOTSTRAP_ADMIN_EMAIL } from "./authHelpers";

function getSiteUrl(): string {
  const siteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL || process.env.PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error("Missing SITE_URL");
  }
  return siteUrl.replace(/\/$/, "");
}

function getResendApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }
  return apiKey;
}

function getFromAddress(): string {
  return process.env.AUTH_EMAIL_FROM || "Sello Saka Foundation <noreply@mail.sellosakafoundation.org>";
}

export async function sendAccountSetupEmail(args: {
  email: string;
  token: string;
  kind: "invite" | "reset";
}) {
  const url = new URL("/auth", getSiteUrl());
  url.searchParams.set("token", args.token);
  url.searchParams.set("email", args.email);

  const subject =
    args.kind === "invite"
      ? "Set up your Sello Saka Foundation account"
      : "Reset your Sello Saka Foundation password";
  const heading =
    args.kind === "invite"
      ? "You have been invited to access the admin system"
      : "Reset your admin account password";
  const copy =
    args.kind === "invite"
      ? "Use the secure link below to create your password and activate your account."
      : "Use the secure link below to choose a new password for your account.";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [args.email],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #111827;">
          <p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #8b7a2b; margin-bottom: 12px;">
            Sello Saka Foundation
          </p>
          <h1 style="font-size: 24px; margin-bottom: 12px;">${heading}</h1>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">${copy}</p>
          <p style="margin-bottom: 24px;">
            <a
              href="${url.toString()}"
              style="display: inline-block; background: #b08919; color: #081a38; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 700;"
            >
              Open secure setup link
            </a>
          </p>
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 8px;">
            If the button does not open, paste this URL into your browser:
          </p>
          <p style="font-size: 14px; line-height: 1.6; word-break: break-all; margin-bottom: 16px;">
            ${url.toString()}
          </p>
          <p style="font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0;">
            This link is intended for ${args.email}. If you were not expecting this email, contact ${BOOTSTRAP_ADMIN_EMAIL}.
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send account email: ${errorText}`);
  }
}
