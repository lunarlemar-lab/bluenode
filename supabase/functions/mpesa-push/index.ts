import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { phone, amount } = await req.json()
    
    // --- 1. CLEAN PHONE ---
    let formattedPhone = phone.toString().replace(/\D/g, ''); 
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1); 
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      formattedPhone = '254' + formattedPhone; 
    }
    
    // --- 2. SETUP CLIENT ---
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // --- 3. MPESA AUTH ---
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')
    const shortCode = Deno.env.get('MPESA_SHORTCODE')
    const passkey = Deno.env.get('MPESA_PASSKEY')
    const auth = btoa(`${consumerKey}:${consumerSecret}`)
    const tokenRes = await fetch("https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` }
    })
    const { access_token } = await tokenRes.json()

    // --- 4. MPESA PUSH ---
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = btoa(`${shortCode}${passkey}${timestamp}`)

    const res = await fetch("https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'Origin': 'https://developer.safaricom.co.ke'
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

    // --- 5. THE FIX: CREATE THE PENDING ROW ---
    if (data.CheckoutRequestID) {
      await supabase
        .from('mpesa_payments')
        .insert([{
          checkout_request_id: data.CheckoutRequestID,
          phone: formattedPhone,
          amount: amount.toString(), // Fills the 'amount' column from your screenshot
          status: 'pending'
        }]);
    }
    
    return new Response(JSON.stringify(data), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, headers: corsHeaders 
    })
  }
})