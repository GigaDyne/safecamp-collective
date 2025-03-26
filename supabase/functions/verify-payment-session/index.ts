
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
    // Get the session ID from the request body
    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error('No session ID provided');
    }
    
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

    // Retrieve the checkout session to verify its status
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.status !== 'complete') {
      throw new Error('Payment not completed');
    }

    // Get payment details from the session
    const paymentType = session.metadata?.type || 'payment';
    let amount = '$0.00';
    
    if (session.amount_total) {
      amount = `$${(session.amount_total / 100).toFixed(2)}`;
    }
    
    // Handle different payment types
    if (paymentType === 'subscription') {
      // For subscription, create or update entry in user_subscriptions table
      const creatorId = session.metadata?.creator_id;
      const planId = session.metadata?.plan_id;
      
      if (creatorId) {
        // Check if subscription exists in Stripe
        const subscriptionId = session.subscription as string;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Create or update the subscription in our database
          await supabaseClient.from('user_subscriptions').upsert({
            subscriber_id: user.id,
            creator_id: creatorId,
            plan_id: planId || null,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          }, {
            onConflict: 'subscriber_id,creator_id'
          });
        }
      }
    } else if (paymentType === 'donation') {
      // For donation, record the donation in the donations table
      const recipientId = session.metadata?.recipient_id;
      const helpRequestId = session.metadata?.help_request_id;
      
      if (recipientId) {
        await supabaseClient.from('donations').insert({
          donor_id: user.id,
          recipient_id: recipientId,
          help_request_id: helpRequestId || null,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          stripe_payment_id: session.payment_intent as string || session.id
        });
        
        // If this was for a help request, update the amount received
        if (helpRequestId) {
          const { data: helpRequest } = await supabaseClient
            .from('help_requests')
            .select('amount_received')
            .eq('id', helpRequestId)
            .single();
            
          if (helpRequest) {
            const newAmountReceived = (helpRequest.amount_received || 0) + (session.amount_total ? session.amount_total / 100 : 0);
            
            await supabaseClient
              .from('help_requests')
              .update({ amount_received: newAmountReceived })
              .eq('id', helpRequestId);
          }
        }
      }
    } else if (paymentType === 'premium_campsite') {
      // Handle premium campsite purchase by adding an entry to purchasers
      const campsiteId = session.metadata?.campsite_id;
      if (campsiteId) {
        // Assuming we add a user_purchases table in the future
        // This would record the purchase to grant access
        console.log(`User ${user.id} purchased premium campsite ${campsiteId}`);
      }
    }
    
    // Return success response with payment details
    return new Response(
      JSON.stringify({
        success: true,
        type: paymentType,
        amount: amount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error verifying payment session:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Using 200 even for errors to handle gracefully in the frontend
      }
    );
  }
});
