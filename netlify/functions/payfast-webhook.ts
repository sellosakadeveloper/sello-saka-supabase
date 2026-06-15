import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { processAndEmailTicket } from "./utils/ticket-generator";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const handler: Handler = async (event) => {
    // Only accept POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        console.log("PayFast ITN received:", event.body);

        // Parse the url-encoded body (PayFast sends application/x-www-form-urlencoded)
        const params = new URLSearchParams(event.body || "");
        const itnData: Record<string, string> = {};
        params.forEach((value, key) => {
            itnData[key] = value;
        });

        // 1. Basic validation (in a real app, you MUST also validate the signature again here)
        // and ideally make a call back to PayFast to verify the validity of the ITN
        // For this implementation, we will check payment_status
        const paymentStatus = itnData.payment_status;
        const pfPaymentId = itnData.pf_payment_id;

        // We use custom_str1 for competitionId and custom_str2 for email
        const competitionId = itnData.custom_str1;
        const email = itnData.custom_str2;
        const participantName = itnData.custom_str3 || "Supporter";
        const participantPhone = itnData.custom_str4 || "";

        if (paymentStatus !== "COMPLETE") {
            console.log(`Payment not complete. Status: ${paymentStatus}`);
            return { statusCode: 200, body: "OK - ignored" };
        }

        if (!competitionId || !email) {
            console.error("Missing required custom strings (competitionId or email)");
            return { statusCode: 400, body: "Bad Request" };
        }

        // Check if we already processed this payment
        const { data: existingEntry } = await supabase
            .from("competition_entries")
            .select("id")
            .eq("payment_reference", pfPaymentId)
            .single();

        if (existingEntry) {
            console.log("Payment already processed:", pfPaymentId);
            return { statusCode: 200, body: "OK - already processed" };
        }

        // Fetch competition details to ensure it exists and get dates
        const { data: competition, error: compError } = await supabase
            .from("competitions")
            .select("*")
            .eq("id", competitionId)
            .single();

        if (compError || !competition) {
            console.error("Competition not found:", competitionId);
            return { statusCode: 404, body: "Competition not found" };
        }

        // Process ticket and send email using our shared utility
        const result = await processAndEmailTicket({
            supabase,
            RESEND_API_KEY,
            competition,
            participantName,
            participantPhone,
            email,
            paymentMethod: "payfast",
            paymentReference: pfPaymentId,
        });

        if (!result.success) {
            console.error("Failed to process ticket:", result.error);
            return { statusCode: 500, body: "Internal Server Error" };
        }

        // Must return 200 OK so PayFast knows we received it
        return { statusCode: 200, body: "OK" };

    } catch (error: any) {
        console.error("ITN Error:", error);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};
