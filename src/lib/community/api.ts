
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, SubscriptionPlan, UserSubscription, HelpRequest, PremiumCampsite, Donation, Message, Conversation, ProfileComment } from "./types";

// User Profile Functions
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('Fetching profile for user ID:', userId);
    
    if (!userId) {
      console.error('Error fetching user profile: Missing user ID');
      return null;
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found, create one
        console.log('No profile found, creating one for user ID:', userId);
        return createDefaultUserProfile(userId);
      }
      
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No profile found, creating one for user ID:', userId);
      return createDefaultUserProfile(userId);
    }
    
    console.log('Profile data retrieved:', data);
    return data;
  } catch (error) {
    console.error('Exception in getUserProfile:', error);
    return null;
  }
}

// Create a default user profile if none exists
async function createDefaultUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // Get user email to use as display name
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email || 'Anonymous User';
    const displayName = email.split('@')[0]; // Use first part of email as display name
    
    const newProfile: Omit<UserProfile, 'created_at' | 'updated_at'> = {
      id: userId,
      display_name: displayName,
      bio: '',
      avatar_url: '',
      is_creator: false,
    };
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(newProfile)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating default user profile:', error);
      throw error;
    }
    
    console.log('Created default profile:', data);
    return data;
  } catch (error) {
    console.error('Error in createDefaultUserProfile:', error);
    return null;
  }
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
  if (!profile.id) {
    console.error('Error updating user profile: Missing user ID');
    return null;
  }

  console.log('🔍 UPDATING PROFILE - Starting update with data:', profile);
  
  // Get current auth session to verify authentication
  const { data: authData, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error('❌ Auth error:', authError);
    throw authError;
  }
  
  console.log('🔑 Auth check - Current user:', authData?.user?.id);

  if (!authData?.user) {
    console.error('❌ Auth error - User not authenticated');
    throw new Error('User not authenticated');
  }

  if (authData.user.id !== profile.id) {
    console.error(`❌ Auth mismatch - Logged in user (${authData.user.id}) doesn't match profile ID (${profile.id})`);
    throw new Error('User ID mismatch');
  }

  try {
    console.log('📡 Sending update request to Supabase...');
    
    // Don't update created_at/updated_at fields directly
    const { created_at, updated_at, ...updateData } = profile as any;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', profile.id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error updating user profile:', error);
      throw error;
    }
    
    console.log('✅ Profile update successful, received data:', data);
    return data;
  } catch (error) {
    console.error('❌ Exception updating user profile:', error);
    throw error;
  }
}

// Subscription Plan Functions
export async function getCreatorSubscriptionPlans(creatorId: string): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('creator_id', creatorId) as any;
  
  if (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
  
  return data || [];
}

export async function createSubscriptionPlan(plan: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>): Promise<SubscriptionPlan | null> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .insert(plan)
    .select('*')
    .single() as any;
  
  if (error) {
    console.error('Error creating subscription plan:', error);
    return null;
  }
  
  return data;
}

export async function updateSubscriptionPlan(planId: string, updates: Partial<Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>>): Promise<SubscriptionPlan | null> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .update(updates)
    .eq('id', planId)
    .select('*')
    .single() as any;
  
  if (error) {
    console.error('Error updating subscription plan:', error);
    return null;
  }
  
  return data;
}

export async function deleteSubscriptionPlan(planId: string): Promise<boolean> {
  const { error } = await supabase
    .from('subscription_plans')
    .delete()
    .eq('id', planId);
  
  if (error) {
    console.error('Error deleting subscription plan:', error);
    return false;
  }
  
  return true;
}

// User Subscriptions Functions
export async function getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plan:plan_id(*)
    `)
    .eq('subscriber_id', userId) as any;
  
  if (error) {
    console.error('Error fetching user subscriptions:', error);
    return [];
  }
  
  return data || [];
}

export async function getSubscribersForCreator(creatorId: string): Promise<UserSubscription[]> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plan:plan_id(*)
    `)
    .eq('creator_id', creatorId) as any;
  
  if (error) {
    console.error('Error fetching creator subscribers:', error);
    return [];
  }
  
  return data || [];
}

export async function checkUserSubscribedToCreator(userId: string, creatorId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('subscriber_id', userId)
    .eq('creator_id', creatorId)
    .eq('status', 'active')
    .single() as any;
  
  if (error) {
    if (error.code !== 'PGRST116') { // Not found error
      console.error('Error checking subscription:', error);
    }
    return false;
  }
  
  return !!data;
}

// Help Request Functions
export async function getHelpRequests(limit = 10, isActive = true): Promise<HelpRequest[]> {
  const { data, error } = await supabase
    .from('help_requests')
    .select('*')
    .eq('is_active', isActive)
    .order('created_at', { ascending: false })
    .limit(limit) as any;
  
  if (error) {
    console.error('Error fetching help requests:', error);
    return [];
  }
  
  return data || [];
}

export async function createHelpRequest(request: Omit<HelpRequest, 'id' | 'amount_received' | 'is_active' | 'created_at' | 'updated_at'>): Promise<HelpRequest | null> {
  const { data, error } = await supabase
    .from('help_requests')
    .insert(request)
    .select('*')
    .single() as any;
  
  if (error) {
    console.error('Error creating help request:', error);
    return null;
  }
  
  return data;
}

export async function getUserHelpRequests(userId: string): Promise<HelpRequest[]> {
  const { data, error } = await supabase
    .from('help_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }) as any;
  
  if (error) {
    console.error('Error fetching user help requests:', error);
    return [];
  }
  
  return data || [];
}

export async function updateHelpRequest(requestId: string, updates: Partial<HelpRequest>): Promise<HelpRequest | null> {
  const { data, error } = await supabase
    .from('help_requests')
    .update(updates)
    .eq('id', requestId)
    .select('*')
    .single() as any;
  
  if (error) {
    console.error('Error updating help request:', error);
    return null;
  }
  
  return data;
}

// Premium Campsite Functions
export async function getPremiumCampsites(userId: string): Promise<PremiumCampsite[]> {
  const { data, error } = await supabase
    .from('premium_campsites')
    .select('*')
    .eq('user_id', userId) as any;
  
  if (error) {
    console.error('Error fetching premium campsites:', error);
    return [];
  }
  
  return data || [];
}

// Donations Functions
export async function getDonationsMade(userId: string): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('donor_id', userId) as any;
  
  if (error) {
    console.error('Error fetching donations made:', error);
    return [];
  }
  
  return data || [];
}

export async function getDonationsReceived(userId: string): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('recipient_id', userId) as any;
  
  if (error) {
    console.error('Error fetching donations received:', error);
    return [];
  }
  
  return data || [];
}

export async function getHelpRequestDonations(helpRequestId: string): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('help_request_id', helpRequestId)
    .order('created_at', { ascending: false }) as any;
  
  if (error) {
    console.error('Error fetching help request donations:', error);
    return [];
  }
  
  return data || [];
}

// Messaging Functions
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false }) as any;
  
  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
  
  return data || [];
}

export async function getMessages(conversationId: string, limit = 50): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit) as any;
  
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  
  return data || [];
}

// Profile Comments Functions
export async function getProfileComments(profileId: string): Promise<ProfileComment[]> {
  const { data, error } = await supabase
    .from('profile_comments')
    .select(`
      *,
      commenter:commenter_id(id, display_name, avatar_url)
    `)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false }) as any;
  
  if (error) {
    console.error('Error fetching profile comments:', error);
    return [];
  }
  
  return data || [];
}

export async function addProfileComment(comment: { profile_id: string, commenter_id: string, content: string }): Promise<ProfileComment | null> {
  const { data, error } = await supabase
    .from('profile_comments')
    .insert(comment)
    .select(`
      *,
      commenter:commenter_id(id, display_name, avatar_url)
    `)
    .single() as any;
  
  if (error) {
    console.error('Error adding profile comment:', error);
    return null;
  }
  
  return data;
}

export async function updateProfileComment(commentId: string, updates: { content: string }): Promise<ProfileComment | null> {
  const { data, error } = await supabase
    .from('profile_comments')
    .update(updates)
    .eq('id', commentId)
    .select(`
      *,
      commenter:commenter_id(id, display_name, avatar_url)
    `)
    .single() as any;
  
  if (error) {
    console.error('Error updating profile comment:', error);
    return null;
  }
  
  return data;
}

export async function deleteProfileComment(commentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('profile_comments')
    .delete()
    .eq('id', commentId);
  
  if (error) {
    console.error('Error deleting profile comment:', error);
    return false;
  }
  
  return true;
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: {
        subscription_id: subscriptionId
      }
    });

    if (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }

    return data.cancelled;
  } catch (error) {
    console.error('Unexpected error cancelling subscription:', error);
    return false;
  }
}

export async function reactivateSubscription(
  planId: string, 
  creatorId: string
): Promise<string | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return null;
    }

    const { data, error } = await supabase.functions.invoke('reactivate-subscription', {
      body: {
        plan_id: planId,
        creator_id: creatorId,
        subscriber_id: user.user.id
      }
    });

    if (error) {
      console.error('Error reactivating subscription:', error);
      return null;
    }

    return data.url;
  } catch (error) {
    console.error('Unexpected error reactivating subscription:', error);
    return null;
  }
}
