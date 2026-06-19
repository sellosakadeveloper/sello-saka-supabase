import type { Handler, HandlerEvent } from "@netlify/functions";
import {
  createAdminClient,
  fetchPaymentRecord,
  finalizeCompetitionPayment,
  finalizeDonationPayment,
  getCompetitionSuccessPayload,
} from "./utils/payment-service";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const handler: Handler = async (event: HandlerEvent) => {
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
    const { reference, payment_reference } = JSON.parse(event.body || "{}");

    if (!reference) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing payment provider reference" }),
      };
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      throw new Error("Missing PAYSTACK_SECRET_KEY");
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
      },
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
    const metadata = paymentData.metadata || {};
    const internalReference = metadata.payment_reference || payment_reference;

    if (!internalReference) {
      throw new Error("Missing internal payment reference");
    }

    const supabase = createAdminClient();
    const paymentRecord = await fetchPaymentRecord(supabase, internalReference);

    if (paymentRecord.status === "completed") {
      const competitionSuccess =
        paymentRecord.purpose === "competition_entry"
          ? await getCompetitionSuccessPayload(supabase, paymentRecord)
          : null;

      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          payment_reference: internalReference,
          purpose: paymentRecord.purpose,
          ...(competitionSuccess || {}),
        }),
      };
    }

    const amountPaid = Number(paymentData.amount) / 100;
    if (amountPaid.toFixed(2) !== Number(paymentRecord.amount).toFixed(2)) {
      throw new Error("Payment amount mismatch");
    }

    await supabase
      .from("payment_records")
      .update({
        provider_payment_id: reference,
        provider_status: paymentData.status,
        provider_payload: paymentData,
        verified_at: new Date().toISOString(),
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", paymentRecord.id);

    if (paymentRecord.purpose === "donation") {
      await finalizeDonationPayment(supabase, paymentRecord);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          payment_reference: internalReference,
          purpose: "donation",
        }),
      };
    }

    await finalizeCompetitionPayment(supabase, paymentRecord);
    const competitionSuccess = await getCompetitionSuccessPayload(supabase, paymentRecord);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        payment_reference: internalReference,
        purpose: "competition_entry",
        ...(competitionSuccess || {}),
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
