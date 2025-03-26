
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
    const { creator_id } = await req.json();
    
    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    // Get user profile to check for Stripe customer ID
    const { data: userProfileData } = await supabaseClient
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();
      
    const stripe_customer_id = userProfileData?.stripe_customer_id;
    
    const email = user.email;
    if (!email) {
      throw new Error('No email found')
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // First check if there's an active subscription in our database
    const { data: userSubscriptions } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('subscriber_id', user.id)
      .eq('creator_id', creator_id)
      .eq('status', 'active') as any;

    const isSubscribedInDb = userSubscriptions && userSubscriptions.length > 0;
    
    // If already subscribed in DB, we're good
    if (isSubscribedInDb) {
      return new Response(
        JSON.stringify({ subscribed: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    // If not found in DB, double-check with Stripe directly as a backup
    // This helps with potential sync issues
    if (stripe_customer_id) {
      try {
        // Get subscriptions for the customer from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: stripe_customer_id,
          status: 'active',
        });
        
        // If there are active subscriptions but they're not in our DB, we should sync them
        // This is just a basic check - in a production system you'd want a more robust sync
        if (subscriptions.data.length > 0) {
          // Check if any of the subscriptions have metadata with the creator_id
          const matchingSubscription = subscriptions.data.find(
            sub => sub.metadata && sub.metadata.creator_id === creator_id
          );
          
          if (matchingSubscription) {
            console.log('Found active subscription in Stripe but not in DB, syncing...');
            
            // Store the subscription in the database for future reference
            await supabaseClient.from('user_subscriptions').insert({
              subscriber_id: user.id,
              creator_id: creator_id,
              plan_id: matchingSubscription.metadata.plan_id || null,
              stripe_subscription_id: matchingSubscription.id,
              status: 'active',
              current_period_start: new Date(matchingSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(matchingSubscription.current_period_end * 1000).toISOString()
            });
            
            return new Response(
              JSON.stringify({ subscribed: true }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
              }
            );
          }
        }
      } catch (stripeError) {
        console.error('Error checking Stripe subscriptions:', stripeError);
        // Continue with the flow - we'll return not subscribed
      }
    }

    return new Response(
      JSON.stringify({ subscribed: false }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error checking subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Still return 200 to avoid frontend errors
      }
    );
  }
});
