import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { processAndEmailTicket } from "./utils/ticket-generator";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const handler: Handler = async (event: HandlerEvent) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { reference, name, phone, competition_id } = JSON.parse(
      event.body || "{}"
    );

    if (!reference) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing payment reference" }),
      };
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!PAYSTACK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error("Missing environment variables");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Server configuration error" }),
      };
    }

    // 1. Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data?.status !== "success") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Payment verification failed",
          details: verifyData.message,
        }),
      };
    }

    const paymentData = verifyData.data;
    const email = paymentData.customer?.email;
    const amountPaid = paymentData.amount / 100; // Convert from kobo to ZAR
    const metadata = paymentData.metadata || {};

    // Use metadata or fallback to provided params
    const participantName = metadata.name || name || "Unknown";
    const participantPhone = metadata.phone || phone || "";
    const compId = metadata.competition_id || competition_id;

    // 2. Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 3. Check if this reference was already processed (idempotency)
    const { data: existingEntry } = await supabase
      .from("competition_entries")
      .select("id, ticket_number")
      .eq("payment_reference", reference)
      .single();

    if (existingEntry) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          ticket_number: existingEntry.ticket_number,
          message: "Ticket already generated for this payment",
        }),
      };
    }

    // 4. Fetch competition details
    const { data: competition, error: compError } = await supabase
      .from("competitions")
      .select("*")
      .eq("id", compId)
      .single();

    if (compError || !competition) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Competition not found" }),
      };
    }

    // 5. Use shared utility to generate ticket, save to DB, and send email
    const result = await processAndEmailTicket({
      supabase,
      RESEND_API_KEY,
      competition,
      participantName,
      participantPhone,
      email,
      paymentMethod: "paystack",
      paymentReference: reference,
    });

    if (!result.success) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Failed to create ticket entry",
          details: result.error,
        }),
      };
    }

    const endDate = new Date(competition.end_date);
    const drawDate = new Date(endDate);
    drawDate.setDate(drawDate.getDate() + 1);
    const drawDateStr = drawDate.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // 10. Return success
    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        ticket_number: result.ticketNumber,
        reference: result.purchaseRef,
        participant_name: participantName,
        email,
        competition_title: competition.title,
        prize: competition.prize,
        draw_date: drawDateStr,
      }),
    };
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export { handler };
