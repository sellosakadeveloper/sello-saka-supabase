import type { Handler } from "@netlify/functions";
import {
  buildPayFastPayload,
  createAdminClient,
  generatePaymentReference,
  getSiteUrl,
} from "./utils/payment-service";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler: Handler = async (event) => {
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
    const {
      purpose,
      provider,
      name,
      email,
      phone,
      amount,
      donation_type,
      competition_id,
    } = JSON.parse(event.body || "{}");

    if (!purpose || !provider || !name || !email) {
      throw new Error("Missing required payment fields");
    }

    const supabase = createAdminClient();
    const paymentReference = generatePaymentReference();
    const siteUrl = getSiteUrl();
    let paymentAmount = Number(amount || 0);
    let donationId: string | null = null;
    let competitionEntryId: string | null = null;
    let linkedCompetitionId: string | null = null;

    if (purpose === "donation") {
      if (!paymentAmount || paymentAmount <= 0) {
        throw new Error("Invalid donation amount");
      }

      const { data: donation, error: donationError } = await supabase
        .from("donations")
        .insert({
          name,
          email,
          phone: phone || null,
          amount: paymentAmount,
          donation_type: donation_type || "once",
          payment_method: provider,
          status: "pending",
        })
        .select("id")
        .single();

      if (donationError || !donation) {
        throw new Error(donationError?.message || "Failed to create donation");
      }

      donationId = donation.id;
    } else if (purpose === "competition_entry") {
      if (!competition_id) {
        throw new Error("Missing competition_id");
      }

      const { data: competition, error: competitionError } = await supabase
        .from("competitions")
        .select("*")
        .eq("id", competition_id)
        .single();

      if (competitionError || !competition) {
        throw new Error("Competition not found");
      }

      paymentAmount = Number(competition.ticket_price || competition.entry_fee || 0);

      const { data: entry, error: entryError } = await supabase
        .from("competition_entries")
        .insert({
          competition_id,
          name,
          full_name: name,
          email,
          phone,
          payment_method: provider,
          payment_reference: paymentReference,
          payment_status: "pending",
          status: "pending",
        })
        .select("id")
        .single();

      if (entryError || !entry) {
        throw new Error(entryError?.message || "Failed to create competition entry");
      }

      competitionEntryId = entry.id;
      linkedCompetitionId = competition_id;
    } else {
      throw new Error("Unsupported payment purpose");
    }

    const { data: paymentRecord, error: paymentError } = await supabase
      .from("payment_records")
      .insert({
        payment_reference: paymentReference,
        provider,
        status: "pending",
        purpose,
        amount: paymentAmount,
        currency: "ZAR",
        payer_name: name,
        payer_email: email,
        payer_phone: phone || null,
        donation_id: donationId,
        competition_entry_id: competitionEntryId,
        competition_id: linkedCompetitionId,
        return_url: `${siteUrl}/payfast-return?payment_reference=${encodeURIComponent(paymentReference)}`,
        cancel_url: `${siteUrl}/payfast-return?payment_reference=${encodeURIComponent(paymentReference)}&cancelled=1`,
      })
      .select("*")
      .single();

    if (paymentError || !paymentRecord) {
      throw new Error(paymentError?.message || "Failed to create payment record");
    }

    if (provider === "payfast") {
      const payload = await buildPayFastPayload(supabase, paymentRecord as any);
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          purpose,
          payment_reference: paymentReference,
          process_url: payload.processUrl,
          form_fields: payload.fields,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider,
        purpose,
        payment_reference: paymentReference,
        amount: paymentAmount,
        email,
        metadata: {
          payment_reference: paymentReference,
          purpose,
          competition_id: linkedCompetitionId,
          name,
          phone,
        },
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
