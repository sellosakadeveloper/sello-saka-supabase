import type { Handler } from "@netlify/functions";
import {
  createAdminClient,
  fetchPaymentRecord,
  getCompetitionSuccessPayload,
} from "./utils/payment-service";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (!["GET", "POST"].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const paymentReference =
      event.queryStringParameters?.payment_reference ||
      JSON.parse(event.body || "{}").payment_reference;

    if (!paymentReference) {
      throw new Error("Missing payment_reference");
    }

    const supabase = createAdminClient();
    const paymentRecord = await fetchPaymentRecord(supabase, paymentReference);
    const competitionSuccess =
      paymentRecord.purpose === "competition_entry"
        ? await getCompetitionSuccessPayload(supabase, paymentRecord)
        : null;

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_reference: paymentRecord.payment_reference,
        status: paymentRecord.status,
        purpose: paymentRecord.purpose,
        provider: paymentRecord.provider,
        provider_status: paymentRecord.provider_status,
        completed_at: paymentRecord.completed_at,
        competition_success: competitionSuccess,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
