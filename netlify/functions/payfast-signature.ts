import { Handler } from "@netlify/functions";
import crypto from 'crypto';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY;
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE;

function generateSignature(data: Record<string, string>, passPhrase: string | null = null): string {
    // Create parameter string
    let pfOutput = "";
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            if (data[key] !== "") {
                pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`;
            }
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);
    if (passPhrase !== null && passPhrase !== '') {
        getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }

    return crypto.createHash("md5").update(getString).digest("hex");
}

export const handler: Handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        if (!event.body) {
            throw new Error('Mission request body');
        }

        const reqData = JSON.parse(event.body);
        const { amount, item_name, custom_str1, custom_str2, custom_str3, custom_str4 } = reqData;

        if (!PAYFAST_MERCHANT_ID || !PAYFAST_MERCHANT_KEY) {
            throw new Error('PayFast credentials not configured');
        }

        const data: Record<string, string> = {
            merchant_id: PAYFAST_MERCHANT_ID,
            merchant_key: PAYFAST_MERCHANT_KEY,
            return_url: `${process.env.URL || 'http://localhost:8888'}/payfast-return`,
            cancel_url: `${process.env.URL || 'http://localhost:8888'}/active-competition`,
            notify_url: `${process.env.URL || 'http://localhost:8888'}/.netlify/functions/payfast-webhook`,
            amount: amount.toString(),
            item_name: item_name,
        };

        if (custom_str1) data.custom_str1 = custom_str1;
        if (custom_str2) data.custom_str2 = custom_str2;
        if (custom_str3) data.custom_str3 = custom_str3;
        if (custom_str4) data.custom_str4 = custom_str4;

        const signature = generateSignature(data, PAYFAST_PASSPHRASE || null);

        return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ signature, ...data }),
        };
    } catch (error: any) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
