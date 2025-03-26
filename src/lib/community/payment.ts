
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { getUserProfile, updateUserProfile } from "./api";

export type PaymentType = 'subscription' | 'premium_campsite' | 'donation';

export async function createCheckoutSession(
  priceId: string, 
  type: PaymentType, 
  itemId?: string,
  creatorId?: string,
  donationAmount?: number,
  message?: string
): Promise<string | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      toast({
        title: 'Authentication required',
        description: 'Please login to continue with the payment process.',
        variant: 'destructive',
      });
      return null;
    }
    
    // Get user profile to check if they already have a Stripe customer ID
    const userProfile = await getUserProfile(user.user.id);
    
    // If we have a Stripe customer ID stored, include it in the request
    const stripeCustomerId = userProfile?.stripe_customer_id || null;
    
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        price_id: priceId,
        type,
        item_id: itemId,
        creator_id: creatorId,
        stripe_customer_id: stripeCustomerId,
        user_email: user.user.email,
        donation_amount: donationAmount,
        message
      },
    });

    if (error) {
      console.error('Checkout session error:', error);
      toast({
        title: 'Error creating checkout session',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }

    // If Stripe returned a customer ID and it's different from what we have stored
    if (data.customer_id && (!userProfile?.stripe_customer_id || userProfile.stripe_customer_id !== data.customer_id)) {
      // Update the user profile with the Stripe customer ID
      await updateUserProfile({
        id: user.user.id,
        stripe_customer_id: data.customer_id
      });
    }

    return data.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    toast({
      title: 'Payment error',
      description: 'Could not process your payment. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
}

export async function checkSubscription(creatorId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('check-subscription', {
      body: {
        creator_id: creatorId
      },
    });

    if (error) {
      console.error('Error checking subscription:', error);
      return false;
    }

    return data.subscribed;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

export async function processDonation(
  amount: number,
  recipientId: string,
  helpRequestId?: string,
  message?: string
): Promise<string | null> {
  try {
    // Create a price ID for one-time payment in test mode
    // This will be a dynamic price created on the server
    const priceId = `price_donation_${amount}`;
    
    const url = await createCheckoutSession(
      priceId,
      'donation',
      helpRequestId,
      recipientId,
      amount,
      message
    );
    
    return url;
  } catch (error) {
    console.error('Error processing donation:', error);
    toast({
      title: 'Donation error',
      description: 'Could not process your donation. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
}

// Verify if a payment was successful (can be used after redirect)
export async function verifyPaymentSuccess(sessionId: string): Promise<{
  success: boolean;
  type?: PaymentType;
  amount?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('verify-payment-session', {
      body: {
        session_id: sessionId
      },
    });

    if (error) {
      console.error('Error verifying payment:', error);
      return { success: false };
    }

    return {
      success: true,
      type: data.type,
      amount: data.amount
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { success: false };
  }
}
