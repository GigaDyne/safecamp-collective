
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

serve(async (req) => {
  // Get the stripe signature from the request headers
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    console.error('No Stripe signature found');
    return new Response('No signature', { status: 400 });
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return new Response('Webhook secret missing', { status: 500 });
  }

  // Retrieve Stripe secret key from environment
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeSecretKey) {
    console.error('Stripe secret key not configured');
    return new Response('Stripe secret key missing', { status: 500 });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  });

  try {
    // Get the raw body as text
    const body = await req.text();
    
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log(`Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Get the metadata to determine what type of payment this is
        const paymentType = session.metadata?.type;
        
        if (paymentType === 'subscription') {
          // Handle subscription payment
          const creatorId = session.metadata?.creator_id;
          const planId = session.metadata?.plan_id;
          const userId = session.metadata?.user_id;
          
          if (creatorId && userId) {
            // Get subscription data from Stripe
            const subscriptionId = session.subscription as string;
            if (subscriptionId) {
              const subscription = await stripe.subscriptions.retrieve(subscriptionId);
              
              // Update user subscription in database
              await supabaseClient.from('user_subscriptions').upsert({
                subscriber_id: userId,
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
          // Handle donation payment
          const recipientId = session.metadata?.recipient_id;
          const donorId = session.metadata?.user_id;
          const helpRequestId = session.metadata?.help_request_id;
          const message = session.metadata?.message;
          
          if (recipientId && donorId) {
            // Record the donation
            await supabaseClient.from('donations').insert({
              donor_id: donorId,
              recipient_id: recipientId,
              help_request_id: helpRequestId || null,
              amount: session.amount_total ? session.amount_total / 100 : 0,
              stripe_payment_id: session.payment_intent as string || session.id,
              message: message || null
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
          // Handle premium campsite purchase
          const campsiteId = session.metadata?.campsite_id;
          const userId = session.metadata?.user_id;
          
          if (campsiteId && userId) {
            // Record the purchase to grant access
            console.log(`User ${userId} purchased premium campsite ${campsiteId}`);
            // We would implement the specific logic here
          }
        }
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Find the user subscription to update
          const { data: userSubs } = await supabaseClient
            .from('user_subscriptions')
            .select('*')
            .eq('stripe_subscription_id', subscriptionId);
            
          if (userSubs && userSubs.length > 0) {
            await supabaseClient
              .from('user_subscriptions')
              .update({
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
              })
              .eq('stripe_subscription_id', subscriptionId);
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        
        // Update the subscription status in the database
        await supabaseClient
          .from('user_subscriptions')
          .update({
            status: 'cancelled'
          })
          .eq('stripe_subscription_id', subscriptionId);
        
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
