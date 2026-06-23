import { chromium } from "playwright";

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(value) {
  return `R${Number(value || 0).toFixed(2)}`;
}

const NLC_SCHEME_NUMBER = "00539/01";
const NLC_COMPLIANCE_URL = "https://www.nlcsa.org.za/regulatory-compliance/";

function buildTicketMarkup(details) {
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
                              <div style="padding-top:12px;font-size:10px;line-height:1.4;color:#8a96a3;font-weight:600;letter-spacing:1px;text-transform:none;">
                                NLC: Scheme No: ${NLC_SCHEME_NUMBER}
                              </div>
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
                    <div style="font-size:12px;color:#d4dde5;padding-top:10px;">NPC | NLC: Scheme No: ${NLC_SCHEME_NUMBER}</div>
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
        Competition period: ${escapeHtml(details.competitionPeriod)}<br/>
        NPC | NLC: Scheme No: ${NLC_SCHEME_NUMBER}<br/>
        Regulatory information: <a href="${NLC_COMPLIANCE_URL}" style="color:#2b5164;">National Lotteries Commission</a>
      </div>
    </div>
  `;
}

function buildCompetitionTicketPdfDocumentHtml(details) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(details.ticketNumber)}</title>
    <style>
      @page {
        size: 980px 560px;
        margin: 0;
      }
      html, body {
        margin: 0;
        padding: 0;
        width: 980px;
        min-height: 560px;
        background: #f5f7fb;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      body {
        display: block;
      }
      * {
        box-sizing: border-box;
      }
    </style>
  </head>
  <body>
    ${buildTicketMarkup(details)}
  </body>
</html>`;
}

function getConvexSiteUrl() {
  const siteUrl = process.env.CONVEX_SITE_URL || process.env.VITE_CONVEX_SITE_URL;
  if (!siteUrl) {
    throw new Error("Missing CONVEX_SITE_URL");
  }
  return siteUrl.replace(/\/$/, "");
}

async function fetchTicketData(paymentReference) {
  const response = await fetch(
    `${getConvexSiteUrl()}/competition-ticket-data?payment_reference=${encodeURIComponent(paymentReference)}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to load ticket data: ${response.status} ${await response.text()}`);
  }

  return await response.json();
}

async function renderPdfBytes(details) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 980, height: 560 },
      deviceScaleFactor: 1,
    });
    await page.setContent(buildCompetitionTicketPdfDocumentHtml(details), {
      waitUntil: "load",
    });
    await page.emulateMedia({ media: "screen" });
    const pdf = await page.pdf({
      width: "980px",
      height: "560px",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      printBackground: true,
      preferCSSPageSize: true,
    });
    return pdf;
  } finally {
    await browser.close();
  }
}

export const handler = async (event) => {
  try {
    let ticket = null;

    if (event.httpMethod === "POST") {
      const parsed = JSON.parse(event.body || "{}");
      ticket = parsed.ticket ?? null;
    } else if (event.httpMethod === "GET") {
      const paymentReference = event.queryStringParameters?.payment_reference;
      if (!paymentReference) {
        return {
          statusCode: 400,
          body: "Missing payment_reference",
        };
      }
      ticket = await fetchTicketData(paymentReference);
    } else {
      return {
        statusCode: 405,
        body: "Method Not Allowed",
      };
    }

    if (!ticket) {
      return {
        statusCode: 400,
        body: "Missing ticket payload",
      };
    }

    const pdf = await renderPdfBytes(ticket);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${ticket.ticketNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
      isBase64Encoded: true,
      body: Buffer.from(pdf).toString("base64"),
    };
  } catch (error) {
    console.error("competition-ticket-pdf error:", error);
    return {
      statusCode: 500,
      body: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
};
