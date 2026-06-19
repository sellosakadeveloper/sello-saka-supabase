import type { Handler } from "@netlify/functions";
import {
  buildPayFastPayload,
  createAdminClient,
  fetchPaymentRecord,
} from "./utils/payment-service";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { payment_reference } = JSON.parse(event.body || "{}");

    if (!payment_reference) {
      throw new Error("Missing payment_reference");
    }

    const supabase = createAdminClient();
    const paymentRecord = await fetchPaymentRecord(supabase, payment_reference);
    const payload = await buildPayFastPayload(supabase, paymentRecord);

    await supabase
      .from("payment_records")
      .update({
        return_url: payload.returnUrl,
        cancel_url: payload.cancelUrl,
      })
      .eq("id", paymentRecord.id);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_reference,
        process_url: payload.processUrl,
        form_fields: payload.fields,
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
