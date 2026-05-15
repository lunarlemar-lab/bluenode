import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { phone, amount } = await req.json()
    
    // --- STEP 1: PHONE SANITIZATION ---
    let formattedPhone = phone.toString().replace(/\D/g, ''); 
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1); 
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      formattedPhone = '254' + formattedPhone; 
    }
    
    console.log(`Starting STK Push for: ${formattedPhone}, Amount: ${amount}`);

    // --- STEP 2: FETCH SECRETS ---
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')
    const shortCode = Deno.env.get('MPESA_SHORTCODE')
    const passkey = Deno.env.get('MPESA_PASSKEY')

    if (!consumerKey || !consumerSecret || !shortCode || !passkey) {
      throw new Error("Missing M-Pesa Configuration in Supabase Secrets");
    }

    // --- STEP 3: GENERATE ACCESS TOKEN ---
    const auth = btoa(`${consumerKey}:${consumerSecret}`)
    const tokenRes = await fetch("https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` }
    })
    
    if (!tokenRes.ok) {
      throw new Error(`Auth Failed: ${tokenRes.status}`);
    }

    const { access_token } = await tokenRes.json()

    // --- STEP 4: GENERATE PASSWORD ---
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = btoa(`${shortCode}${passkey}${timestamp}`)

    // --- STEP 5: INITIATE STK PUSH (With Production Origin Header) ---
    const res = await fetch("https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'Origin': 'https://developer.safaricom.co.ke' // Strategic header for Production
      },
      body: JSON.stringify({
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline", 
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: "https://nkfjedmowntrngqkgpqs.supabase.co/functions/v1/mpesa-callback",
        AccountReference: "BlueNode",
        TransactionDesc: "Infrastructure Uplink"
      })
    })

    const data = await res.json()
    console.log("Safaricom STK Response:", JSON.stringify(data));
    
    return new Response(JSON.stringify(data), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, headers: corsHeaders 
    })
  }
})