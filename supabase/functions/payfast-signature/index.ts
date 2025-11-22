import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { amount, item_name, name, email } = await req.json()

        // PayFast Sandbox Credentials
        const merchant_id = '10000100'
        const merchant_key = '46f0cd694581a'
        const passphrase = 'jt7NOE43FZPn'

        // Construct data object
        const data: Record<string, string> = {
            merchant_id,
            merchant_key,
            return_url: `${req.headers.get('origin')}/donate?status=success`,
            cancel_url: `${req.headers.get('origin')}/donate?status=cancel`,
            notify_url: `${req.headers.get('origin')}/api/payfast/notify`, // We might not implement this yet, but good to have
            name_first: name || 'Anonymous',
            email_address: email || 'no-reply@sellosaka.co.za',
            m_payment_id: `DONATION-${Date.now()}`,
            amount: parseFloat(amount).toFixed(2),
            item_name: item_name || 'Donation',
        }

        // Create parameter string
        let pfOutput = ""
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (data[key] !== "") {
                    pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`
                }
            }
        }

        // Remove last ampersand
        let getString = pfOutput.slice(0, -1)

        if (passphrase) {
            getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
        }

        // Generate MD5 signature
        // Using a simple MD5 implementation or Web Crypto if available. 
        // Deno's crypto.subtle.digest('MD5', ...) is available.
        const encoder = new TextEncoder()
        const dataBuffer = encoder.encode(getString)
        const hashBuffer = await crypto.subtle.digest('MD5', dataBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

        return new Response(
            JSON.stringify({ signature, data }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
