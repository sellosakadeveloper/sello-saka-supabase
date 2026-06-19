import type { Handler } from "@netlify/functions";
import {
  createAdminClient,
  fetchPaymentRecord,
  finalizeCompetitionPayment,
  finalizeDonationPayment,
  getRequiredEnv,
  mapPayFastStatus,
  validatePayFastITN,
} from "./utils/payment-service";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    getRequiredEnv("PAYFAST_MERCHANT_ID");

    const params = new URLSearchParams(event.body || "");
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
      return { statusCode: 400, body: "Missing m_payment_id" };
    }

    const supabase = createAdminClient();
    const paymentRecord = await fetchPaymentRecord(supabase, paymentReference);

    await validatePayFastITN(payload, signature);

    if (payload.merchant_id !== process.env.PAYFAST_MERCHANT_ID) {
      throw new Error("Merchant ID mismatch");
    }

    const amountGross = Number(payload.amount_gross || payload.amount_fee || payload.amount || 0);
    if (amountGross && amountGross.toFixed(2) !== Number(paymentRecord.amount).toFixed(2)) {
      throw new Error("Payment amount mismatch");
    }

    const mappedStatus = mapPayFastStatus(payload.payment_status);

    await supabase
      .from("payment_records")
      .update({
        provider_payment_id: payload.pf_payment_id || null,
        provider_status: payload.payment_status || null,
        provider_payload: payload,
        verified_at: new Date().toISOString(),
        status: mappedStatus,
      })
      .eq("id", paymentRecord.id);

    if (mappedStatus !== "completed") {
      if (paymentRecord.purpose === "donation" && paymentRecord.donation_id) {
        await supabase
          .from("donations")
          .update({ status: mappedStatus })
          .eq("id", paymentRecord.donation_id);
      }

      if (paymentRecord.purpose === "competition_entry" && paymentRecord.competition_entry_id) {
        await supabase
          .from("competition_entries")
          .update({ payment_status: mappedStatus, status: mappedStatus === "cancelled" ? "cancelled" : "pending" })
          .eq("id", paymentRecord.competition_entry_id);
      }

      return { statusCode: 200, body: "OK" };
    }

    if (paymentRecord.status === "completed") {
      return { statusCode: 200, body: "OK - already processed" };
    }

    if (paymentRecord.purpose === "donation") {
      await finalizeDonationPayment(supabase, paymentRecord);
    } else if (paymentRecord.purpose === "competition_entry") {
      await finalizeCompetitionPayment(supabase, paymentRecord);
    }

    await supabase
      .from("payment_records")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", paymentRecord.id);

    return { statusCode: 200, body: "OK" };
  } catch (error: any) {
    console.error("PayFast ITN error:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
