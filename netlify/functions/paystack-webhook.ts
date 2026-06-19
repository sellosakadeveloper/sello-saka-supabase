import type { Handler, HandlerEvent } from "@netlify/functions";
import { createHmac } from "crypto";

/**
 * Paystack Webhook handler
 * This is a BACKUP to the client-side verify-payment flow.
 * Paystack sends charge.success events here for reliable confirmation.
 * 
 * Set this URL in your Paystack dashboard:
 * https://yourdomain.com/api/paystack-webhook
 */
const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method not allowed" };
    }

    try {
        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

        if (!PAYSTACK_SECRET_KEY) {
            console.error("Missing PAYSTACK_SECRET_KEY");
            return { statusCode: 500, body: "Server config error" };
        }

        // Validate webhook signature
        const hash = createHmac("sha512", PAYSTACK_SECRET_KEY)
            .update(event.body || "")
            .digest("hex");

        const paystackSignature = event.headers["x-paystack-signature"];

        if (hash !== paystackSignature) {
            console.error("Invalid webhook signature");
            return { statusCode: 401, body: "Invalid signature" };
        }

        const payload = JSON.parse(event.body || "{}");

        if (payload.event === "charge.success") {
            const { reference, metadata } = payload.data;

            // Call verify-payment to handle the rest (idempotent)
            // The verify-payment function handles deduplication
            const baseUrl = process.env.URL || process.env.DEPLOY_URL || "";

            if (baseUrl) {
                await fetch(`${baseUrl}/.netlify/functions/verify-payment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        reference,
                        payment_reference: metadata?.payment_reference,
                    }),
                });
            }
        }

        // Always return 200 to acknowledge receipt
        return { statusCode: 200, body: "OK" };
    } catch (error: any) {
        console.error("Webhook error:", error);
        // Still return 200 to prevent Paystack from retrying endlessly
        return { statusCode: 200, body: "OK" };
    }
};

export { handler };
