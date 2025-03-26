
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export type PaymentType = 'subscription' | 'premium_campsite' | 'donation';

export async function createCheckoutSession(
  priceId: string, 
  type: PaymentType, 
  itemId?: string,
  creatorId?: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        price_id: priceId,
        type,
        item_id: itemId,
        creator_id: creatorId
      },
    });

    if (error) {
      toast({
        title: 'Error creating checkout session',
        description: error.message,
        variant: 'destructive',
      });
      return null;
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
    // Create a price ID for one-time payment
    // This will be a dynamic price created on the server
    const priceId = `price_donation_${amount}`;
    
    const url = await createCheckoutSession(
      priceId,
      'donation',
      helpRequestId,
      recipientId
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
