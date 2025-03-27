
export interface UserProfile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  is_creator?: boolean;
  created_at?: string;
  updated_at?: string;
  stripe_customer_id?: string;
  stripe_account_id?: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  last_message_at: string;
  user1?: UserProfile[];
  user2?: UserProfile[];
  other_user?: UserProfile;
  last_message?: Message;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface SubscriptionPlan {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
  stripe_price_id?: string;
}

export interface UserSubscription {
  id: string;
  subscriber_id: string;
  creator_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'cancelled' | 'incomplete' | 'past_due';
  stripe_subscription_id: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface HelpRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location?: string;
  amount_requested: number;
  amount_received: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PremiumCampsite {
  id: string;
  user_id: string;
  campsite_id: string;
  title: string;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  recipient_id: string;
  amount: number;
  message?: string;
  help_request_id?: string;
  stripe_payment_id: string;
  created_at: string;
}

export interface ProfileComment {
  id: string;
  profile_id: string;
  commenter_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  commenter?: UserProfile;
}
