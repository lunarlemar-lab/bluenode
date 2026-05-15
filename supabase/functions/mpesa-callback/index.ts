import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json();
    const result = body.Body.stkCallback;
    
    const checkoutID = result.CheckoutRequestID;
    const resultCode = result.ResultCode; 
    
    let status = 'failed';
    let metadata: any = {};

    // If payment is successful (ResultCode 0)
    if (resultCode === 0) {
      status = 'success';
      // Extract specific data from the CallbackMetadata array safely
      const items = result.CallbackMetadata?.Item || [];
      items.forEach((item: any) => {
        if (item.Name === 'MpesaReceiptNumber') metadata.receipt = item.Value;
        if (item.Name === 'Amount') metadata.amount = item.Value;
        if (item.Name === 'PhoneNumber') metadata.phone = item.Value;
      });
    } else if (resultCode === 1032) {
      status = 'cancelled';
    }

    console.log(`STK Callback: ID ${checkoutID} Status: ${status} Receipt: ${metadata.receipt || 'N/A'}`);

    // Update the record including the new columns
    const { error } = await supabase
      .from('mpesa_payments')
      .update({ 
        status: status,
        mpesa_receipt: metadata.receipt,
        amount_paid: metadata.amount,
        time_paid: new Date().toISOString(), // This fills your new column
        updated_at: new Date().toISOString()
      })
      .eq('checkout_request_id', checkoutID);

    if (error) throw error;

    return new Response(JSON.stringify({ message: "Success" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Callback Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
})