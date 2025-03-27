
import { CampSite } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export type FriendStatus = 'pending' | 'accepted' | 'rejected';
export type PostType = 'checkin' | 'help' | 'discovery' | 'text';
export type VisibilityType = 'private' | 'friends' | 'friends_of_friends' | 'public';
export type MessagesPermission = 'all' | 'friends' | 'none';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  friend?: UserProfile;
}

export interface SocialPost {
  id: string;
  user_id: string;
  type: PostType;
  content: string | null;
  visibility: VisibilityType;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  linked_campsite_id: string | null;
  created_at: string;
  // Joined data
  user?: UserProfile;
  linked_campsite?: CampSite;
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // Joined data
  user?: UserProfile;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PrivacySettings {
  id: string;
  profile_visibility: VisibilityType | 'private';
  post_visibility: Exclude<VisibilityType, 'private'>;
  checkin_visibility: VisibilityType;
  allow_messages: MessagesPermission;
  show_profile_comments: boolean;
  created_at: string;
  updated_at: string;
}

// Re-exporting UserProfile for convenience
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
