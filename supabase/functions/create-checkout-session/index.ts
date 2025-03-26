
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
    const { price_id, type, item_id, creator_id } = await req.json();
    
    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    const email = user.email;
    if (!email) {
      throw new Error('No email found')
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Check if we already have a customer for this email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    let customer_id = undefined;
    if (customers.data.length > 0) {
      customer_id = customers.data[0].id;
      
      // If user is subscribing, check if they're already subscribed
      if (type === 'subscription' && price_id) {
        const subscriptions = await stripe.subscriptions.list({
          customer: customers.data[0].id,
          status: 'active',
          price: price_id,
          limit: 1
        });

        if (subscriptions.data.length > 0) {
          throw new Error("You're already subscribed to this plan");
        }
      }
    }

    const metadata: Record<string, string> = { 
      user_id: user.id 
    };
    
    // Add metadata based on transaction type
    if (type === 'subscription' && creator_id) {
      metadata.creator_id = creator_id;
      metadata.type = 'subscription';
    } else if (type === 'premium_campsite' && item_id) {
      metadata.campsite_id = item_id;
      metadata.type = 'premium_campsite';
    } else if (type === 'donation' && item_id) {
      metadata.help_request_id = item_id;
      metadata.type = 'donation';
    }

    // Create checkout session based on type
    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
      customer_email: customer_id ? undefined : email,
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/payment-cancel`,
      metadata: metadata
    });

    console.log('Payment session created:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
