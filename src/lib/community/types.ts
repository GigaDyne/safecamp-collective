
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_creator: boolean;
  stripe_account_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  price: number;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  subscriber_id: string;
  creator_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
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

export interface HelpRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  amount_requested: number | null;
  amount_received: number;
  is_active: boolean;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  recipient_id: string;
  help_request_id: string | null;
  amount: number;
  stripe_payment_id: string;
  message: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  created_at: string;
  other_user?: UserProfile;
  last_message?: Message;
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
