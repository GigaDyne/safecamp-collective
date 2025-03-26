
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  )

  try {
    // Get the request body
    const { subscription_id } = await req.json();
    
    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Cancel the subscription in Stripe
    const cancelledSubscription = await stripe.subscriptions.cancel(subscription_id);

    // Update the subscription status in our database
    await supabaseClient
      .from('user_subscriptions')
      .update({ 
        status: 'cancelled', 
        current_period_end: new Date(cancelledSubscription.current_period_end * 1000).toISOString() 
      })
      .eq('stripe_subscription_id', subscription_id);

    return new Response(
      JSON.stringify({ 
        cancelled: true,
        message: 'Subscription successfully cancelled' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return new Response(
      JSON.stringify({ 
        cancelled: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Using 200 to handle errors gracefully on the frontend
      }
    );
  }
});
