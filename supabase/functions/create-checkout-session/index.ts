
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
    const { 
      price_id, 
      type, 
      item_id, 
      creator_id, 
      stripe_customer_id,
      user_email,
      donation_amount,
      message
    } = await req.json();
    
    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    const email = user.email || user_email;
    if (!email) {
      throw new Error('No email found')
    }

    // Retrieve Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured in environment variables');
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    console.log(`Creating checkout for: ${email}, type: ${type}`);

    // Check if we already have a customer for this email or use provided customer ID
    let customer_id = stripe_customer_id;
    
    if (!customer_id) {
      const customers = await stripe.customers.list({
        email: email,
        limit: 1
      });

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
    }

    const metadata: Record<string, string> = { 
      user_id: user.id,
      type: type
    };
    
    // Add metadata based on transaction type
    if (type === 'subscription' && creator_id) {
      metadata.creator_id = creator_id;
      if (item_id) metadata.plan_id = item_id;
    } else if (type === 'premium_campsite' && item_id) {
      metadata.campsite_id = item_id;
    } else if (type === 'donation') {
      if (item_id) metadata.help_request_id = item_id;
      if (creator_id) metadata.recipient_id = creator_id;
      if (message) metadata.message = message;
    }

    // Calculate application fee percentage (10%)
    const platformFeePercent = 10;
    
    // Handle donation differently - we need to create a price on the fly
    let lineItems;
    let applicationFeeAmount;
    
    if (type === 'donation') {
      // Use the provided donation amount or extract from price_id format: price_donation_20
      let amount = donation_amount;
      if (!amount) {
        const amountStr = price_id.split('_').pop() || '0';
        amount = parseInt(amountStr, 10);
      }
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid donation amount');
      }

      // Calculate platform fee (10%)
      applicationFeeAmount = Math.round(amount * platformFeePercent / 100) * 100;
      
      // Create the line item for the donation
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Donation',
            description: item_id ? 'Donation for help request' : 'Support donation',
          },
          unit_amount: amount * 100, // Stripe uses cents
        },
        quantity: 1,
      }];
    } else {
      // For subscriptions and premium campsites, use the provided price ID
      lineItems = [{
        price: price_id,
        quantity: 1,
      }];
    }

    console.log(`Creating ${type} checkout session for user ${user.id}...`);
    
    // Get the recipient's Stripe account if available for Connect payments
    let stripeAccountId = null;
    if (creator_id) {
      const { data: creatorProfile } = await supabaseClient
        .from('user_profiles')
        .select('stripe_account_id')
        .eq('id', creator_id)
        .single();
      
      if (creatorProfile?.stripe_account_id) {
        stripeAccountId = creatorProfile.stripe_account_id;
      }
    }
    
    // Create checkout session with Connect parameters if applicable
    const sessionParams: any = {
      customer: customer_id,
      customer_email: customer_id ? undefined : email,
      line_items: lineItems,
      mode: type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/payment-cancel`,
      metadata: metadata
    };
    
    // Add application fee if we have a connected account
    if (stripeAccountId && applicationFeeAmount) {
      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: stripeAccountId,
        },
      };
    }
    
    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('Payment session created:', session.id);
    
    // Check if we need to return the customer ID (for first-time customers)
    const response: any = { url: session.url };
    if (!stripe_customer_id && customer_id) {
      response.customer_id = customer_id;
    }
    
    return new Response(
      JSON.stringify(response),
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
