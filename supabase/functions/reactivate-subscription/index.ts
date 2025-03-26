
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
    const { plan_id, creator_id, subscriber_id } = await req.json();
    
    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    // Get the stripe price ID for the plan
    const { data: planData, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('stripe_price_id')
      .eq('id', plan_id)
      .single();

    if (planError || !planData?.stripe_price_id) {
      throw new Error('Invalid plan or missing Stripe price ID');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get user's Stripe customer ID
    const { data: userProfileData } = await supabaseClient
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', subscriber_id)
      .single();

    const stripeCustomerId = userProfileData?.stripe_customer_id;

    if (!stripeCustomerId) {
      throw new Error('No Stripe customer ID found');
    }

    // Create a new checkout session for resubscription
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [{
        price: planData.stripe_price_id,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/profile`,
      metadata: {
        plan_id,
        creator_id,
        type: 'subscription'
      }
    });

    return new Response(
      JSON.stringify({ 
        url: session.url
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
