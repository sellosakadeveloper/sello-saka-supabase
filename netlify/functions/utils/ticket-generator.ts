import { createClient } from "@supabase/supabase-js";

// Generate unique ticket number: SSKF-YYYY-NNNNNN
export async function generateTicketNumber(
    supabase: ReturnType<typeof createClient>
): Promise<string> {
    const year = new Date().getFullYear();

    // Get the current max ticket number for this year
    const { data, error } = await supabase
        .from("competition_entries")
        .select("ticket_number")
        .like("ticket_number", `SSKF-${year}-%`)
        .order("ticket_number", { ascending: false })
        .limit(1);

    let nextNum = 1;
    if (!error && data && data.length > 0) {
        const lastNum = parseInt(data[0].ticket_number.split("-")[2], 10);
        nextNum = lastNum + 1;
    }

    return `SSKF-${year}-${String(nextNum).padStart(6, "0")}`;
}

// Generate purchase reference
export function generateReference(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let ref = "REF-";
    for (let i = 0; i < 7; i++) {
        ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
}

// Build ticket HTML for email (table-based layout for email client compatibility)
export function buildTicketHtml(ticketData: {
    ticketNumber: string;
    reference: string;
    participantName: string;
    phone: string;
    email: string;
    prize: string;
    entryPrice: number;
    competitionPeriod: string;
    drawDate: string;
}): string {
    return `
<!--[if mso]>
<style>table{border-collapse:collapse;}td{font-family:Arial,sans-serif;}</style>
<![endif]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;">
<tr><td align="center" style="padding:20px 10px;">

  <!-- Outer ticket container -->
  <table width="700" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <tr>
    <!-- LEFT: Main ticket area (white) -->
    <td width="420" valign="top" style="background-color:#FFFFFF;padding:32px 36px;border-right:2px dashed #CBD5E1;">

      <!-- Header row: Logo + Official label -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#121F2B;letter-spacing:0.5px;">
          Sello Saka Foundation
        </td>
        <td align="right" valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#64748B;font-weight:700;line-height:1.5;">
          Official<br>Fundraising Ticket
        </td>
      </tr>
      </table>

      <!-- Tagline -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:6px;">
      <tr>
        <td style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:16px;color:#2D4958;">
          Support childhood cancer survivors
        </td>
      </tr>
      </table>

      <!-- Prize title -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:30px;font-weight:800;color:#121F2B;line-height:1.15;letter-spacing:-0.5px;text-transform:uppercase;">
          ${ticketData.prize}
        </td>
      </tr>
      </table>

      <!-- Details row: Competition Period | Draw Date | Entry Price -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td width="40%" valign="top" style="padding-right:12px;">
          <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#64748B;font-weight:700;padding-bottom:6px;">
              Competition Period
            </td>
          </tr>
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#121F2B;">
              ${ticketData.competitionPeriod}
            </td>
          </tr>
          </table>
        </td>
        <td width="30%" valign="top" style="padding-right:12px;">
          <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#64748B;font-weight:700;padding-bottom:6px;">
              Draw Date
            </td>
          </tr>
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#121F2B;">
              ${ticketData.drawDate}
            </td>
          </tr>
          </table>
        </td>
        <td width="30%" valign="top" align="right">
          <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#64748B;font-weight:700;padding-bottom:6px;">
              Entry Price
            </td>
          </tr>
          <tr>
            <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:800;color:#2D4958;">
              R${ticketData.entryPrice.toFixed(2)}
            </td>
          </tr>
          </table>
        </td>
      </tr>
      </table>

      <!-- Ticket number -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#64748B;font-weight:700;padding-bottom:6px;">
          Ticket Number
        </td>
      </tr>
      <tr>
        <td>
          <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:#F1F5F9;padding:6px 14px;border-radius:6px;border:1px solid #E2E8F0;font-family:'Courier New',Courier,monospace;font-size:14px;font-weight:700;color:#2D4958;">
              ${ticketData.ticketNumber}
            </td>
          </tr>
          </table>
        </td>
      </tr>
      </table>

      <!-- Terms -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="border-top:1px solid #F1F5F9;padding-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:8px;color:#94A3B8;line-height:1.5;">
          <strong>TERMS:</strong> Each ticket equals one entry. Multiple entries allowed. Winner selected via live random draw. Ticket valid only if purchased through authorised Sello Saka Foundation channels.
        </td>
      </tr>
      </table>

    </td>

    <!-- RIGHT: Participant stub (dark blue) -->
    <td width="280" valign="top" style="background-color:#2D4958;padding:32px 28px;">

      <!-- Stub title -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.85);font-weight:700;padding-bottom:10px;">
          Participant Stub
        </td>
      </tr>
      <tr>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.2);">
          ${ticketData.reference}
        </td>
      </tr>
      </table>

      <!-- Participant Name -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:rgba(255,255,255,0.65);letter-spacing:0.5px;padding-bottom:4px;">
          Participant Name
        </td>
      </tr>
      <tr>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#FFFFFF;border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:8px;">
          ${ticketData.participantName}
        </td>
      </tr>
      </table>

      <!-- Phone Number -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:rgba(255,255,255,0.65);letter-spacing:0.5px;padding-bottom:4px;">
          Phone Number
        </td>
      </tr>
      <tr>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#FFFFFF;border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:8px;">
          ${ticketData.phone}
        </td>
      </tr>
      </table>

      <!-- Email Address -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:rgba(255,255,255,0.65);letter-spacing:0.5px;padding-bottom:4px;">
          Email Address
        </td>
      </tr>
      <tr>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#FFFFFF;border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:8px;">
          ${ticketData.email}
        </td>
      </tr>
      </table>

      <!-- Footer -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#FFFFFF;padding-bottom:4px;">
          ${ticketData.ticketNumber}
        </td>
      </tr>
      <tr>
        <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:rgba(255,255,255,0.65);line-height:1.6;">
          support@sellosakafoundation.org<br>
          www.sellosakafoundation.org
        </td>
      </tr>
      </table>

    </td>
  </tr>
  </table>

</td></tr>
</table>
`;
}

export async function processAndEmailTicket({
    supabase,
    RESEND_API_KEY,
    competition,
    participantName,
    participantPhone,
    email,
    paymentMethod,
    paymentReference,
}: {
    supabase: ReturnType<typeof createClient>;
    RESEND_API_KEY: string | undefined;
    competition: any;
    participantName: string;
    participantPhone: string;
    email: string;
    paymentMethod: string;
    paymentReference: string;
}): Promise<{
    success: boolean;
    ticketNumber?: string;
    purchaseRef?: string;
    error?: string;
}> {
    try {
        const ticketNumber = await generateTicketNumber(supabase);
        const purchaseRef = paymentReference || generateReference();

        // Insert competition entry
        const { data: entry, error: insertError } = await supabase
            .from("competition_entries")
            .insert([
                {
                    competition_id: competition.id,
                    name: participantName,
                    email: email,
                    phone: participantPhone,
                    ticket_number: ticketNumber,
                    payment_method: paymentMethod,
                    payment_reference: purchaseRef,
                    payment_status: "success",
                    status: "confirmed",
                },
            ])
            .select()
            .single();

        if (insertError) {
            console.error("Insert error:", insertError);
            return { success: false, error: insertError.message };
        }

        // Format dates for ticket
        const startDate = new Date(competition.start_date);
        const endDate = new Date(competition.end_date);
        const drawDate = new Date(endDate);
        drawDate.setDate(drawDate.getDate() + 1);

        const formatDate = (d: Date) =>
            d.toLocaleDateString("en-ZA", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });

        const competitionPeriod = `${formatDate(startDate)} – ${formatDate(endDate)}`;
        const drawDateStr = formatDate(drawDate);

        // Build ticket HTML
        const ticketHtml = buildTicketHtml({
            ticketNumber,
            reference: purchaseRef,
            participantName: participantName,
            phone: participantPhone,
            email: email,
            prize: competition.prize || competition.title,
            entryPrice: competition.ticket_price || competition.entry_fee,
            competitionPeriod,
            drawDate: drawDateStr,
        });

        // Send ticket via email (Resend)
        if (RESEND_API_KEY && email) {
            try {
                const emailResponse = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${RESEND_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        from: "Sello Saka Foundation Tickets <onboarding@resend.dev>",
                        to: [email],
                        subject: `Your Competition Ticket - ${ticketNumber}`,
                        html: `
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #121F2B; font-size: 24px;">Thank You for Your Entry! 🎉</h1>
                <p style="color: #64748B; font-size: 16px;">
                  Hi ${participantName}, your competition entry has been confirmed!
                </p>
                <div style="background: #F1F5F9; border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0 0 8px 0;"><strong>Ticket Number:</strong> <code style="background: #E2E8F0; padding: 4px 8px; border-radius: 4px;">${ticketNumber}</code></p>
                  <p style="margin: 0 0 8px 0;"><strong>Competition:</strong> ${competition.title}</p>
                  <p style="margin: 0 0 8px 0;"><strong>Prize:</strong> ${competition.prize || competition.title}</p>
                  <p style="margin: 0;"><strong>Draw Date:</strong> ${drawDateStr}</p>
                </div>
                <p style="color: #64748B; font-size: 14px;">
                  Your ticket is displayed below. Save this email for your records.
                </p>
                <p style="color: #64748B; font-size: 14px;">
                  Good luck! 🍀
                </p>
                <hr style="border: 1px solid #E2E8F0; margin: 20px 0;">
                ${ticketHtml}
                <hr style="border: 1px solid #E2E8F0; margin: 20px 0;">
                <p style="color: #94A3B8; font-size: 12px; text-align: center;">
                  Sello Saka Foundation | sellosaka.care@gmail.com | www.sellosakafoundation.org
                </p>
              </div>
            `,
                    }),
                });

                if (emailResponse.ok && entry && (entry as any).id) {
                    // Update ticket_emailed status
                    // @ts-ignore - Supabase type inference issue with ticket_emailed
                    await supabase
                        .from("competition_entries")
                        .update({ ticket_emailed: true })
                        .eq("id", (entry as any).id);
                } else {
                    const emailError = await emailResponse.text();
                    console.error("Email send error:", emailError);
                }
            } catch (emailErr) {
                console.error("Email error:", emailErr);
                // Don't fail the whole request if email fails
            }
        }

        return {
            success: true,
            ticketNumber,
            purchaseRef,
        };
    } catch (error: any) {
        console.error("Process and email ticket error:", error);
        return { success: false, error: error.message };
    }
}
