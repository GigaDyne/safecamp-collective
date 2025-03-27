
import { supabase } from "@/integrations/supabase/client";
import { Friend, SocialPost, PostComment, PostLike, PrivacySettings, FriendStatus, VisibilityType, PostType } from "./types";
import { UserProfile } from "@/lib/community/types";

// Friend requests and friendship management
export async function sendFriendRequest(friendId: string): Promise<Friend | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  try {
    const { data, error } = await supabase
      .from('user_friends')
      .insert({
        user_id: user.user.id,
        friend_id: friendId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending friend request:', error);
    return null;
  }
}

export async function respondToFriendRequest(requestId: string, accept: boolean): Promise<Friend | null> {
  try {
    const { data, error } = await supabase
      .from('user_friends')
      .update({
        status: accept ? 'accepted' : 'rejected'
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error responding to friend request:', error);
    return null;
  }
}

export async function getFriends(status?: FriendStatus): Promise<Friend[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  try {
    let query = supabase
      .from('user_friends')
      .select(`
        *,
        friend:friend_id(id, display_name, avatar_url, bio)
      `)
      .or(`user_id.eq.${user.user.id},friend_id.eq.${user.user.id}`);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Process the data to ensure the friend property contains the other user
    return (data || []).map(item => {
      if (item.user_id === user.user?.id) {
        return item; // Current user is the requester, friend data is correct
      } else {
        // Current user is the receiver, swap the friend data
        return {
          ...item,
          friend: user.user // The original user becomes the friend
        };
      }
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return [];
  }
}

export async function getPendingFriendRequests(): Promise<Friend[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  try {
    const { data, error } = await supabase
      .from('user_friends')
      .select(`
        *,
        friend:user_id(id, display_name, avatar_url, bio)
      `)
      .eq('friend_id', user.user.id)
      .eq('status', 'pending');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending friend requests:', error);
    return [];
  }
}

// Social posts
export async function createPost(post: Omit<SocialPost, 'id' | 'user_id' | 'created_at' | 'user'>): Promise<SocialPost | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  try {
    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        ...post,
        user_id: user.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

export async function getFeedPosts(limit = 20, page = 0): Promise<SocialPost[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;
    
    // Calculate offset based on page and limit
    const offset = page * limit;
    
    const { data, error } = await supabase
      .from('social_posts')
      .select(`
        *,
        user:user_id(id, display_name, avatar_url),
        linked_campsite:linked_campsite_id(id, name, location, latitude, longitude)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    // If user is logged in, get the likes for each post
    if (userId) {
      const posts = data || [];
      
      // For each post, get the likes count
      for (const post of posts) {
        const { count: likesCount } = await supabase
          .from('post_likes')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', post.id);
          
        post.likes_count = likesCount || 0;
        
        // Check if the current user has liked the post
        if (userId) {
          const { data: userLike } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', userId)
            .single();
            
          post.user_has_liked = !!userLike;
        }
        
        // Get comments count
        const { count: commentsCount } = await supabase
          .from('post_comments')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', post.id);
          
        post.comments_count = commentsCount || 0;
      }
      
      return posts;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    return [];
  }
}

export async function getUserPosts(userId: string, limit = 20, page = 0): Promise<SocialPost[]> {
  try {
    const offset = page * limit;
    
    const { data, error } = await supabase
      .from('social_posts')
      .select(`
        *,
        user:user_id(id, display_name, avatar_url),
        linked_campsite:linked_campsite_id(id, name, location, latitude, longitude)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Process the posts to include likes and comments count
    const posts = data || [];
    
    for (const post of posts) {
      const { count: likesCount } = await supabase
        .from('post_likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', post.id);
        
      post.likes_count = likesCount || 0;
      
      // Check if the current user has liked the post
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser.user) {
        const { data: userLike } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', currentUser.user.id)
          .single();
          
        post.user_has_liked = !!userLike;
      }
      
      // Get comments count
      const { count: commentsCount } = await supabase
        .from('post_comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', post.id);
        
      post.comments_count = commentsCount || 0;
    }
    
    return posts;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
}

export async function getPostById(postId: string): Promise<SocialPost | null> {
  try {
    const { data, error } = await supabase
      .from('social_posts')
      .select(`
        *,
        user:user_id(id, display_name, avatar_url),
        linked_campsite:linked_campsite_id(id, name, location, latitude, longitude)
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;
    
    // Get likes count
    const { count: likesCount } = await supabase
      .from('post_likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);
      
    data.likes_count = likesCount || 0;
    
    // Check if the current user has liked the post
    const { data: currentUser } = await supabase.auth.getUser();
    if (currentUser.user) {
      const { data: userLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUser.user.id)
        .maybeSingle();
        
      data.user_has_liked = !!userLike;
    }
    
    // Get comments count
    const { count: commentsCount } = await supabase
      .from('post_comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);
      
    data.comments_count = commentsCount || 0;
    
    return data;
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    return null;
  }
}

export async function deletePost(postId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
}

// Post comments
export async function addComment(postId: string, content: string): Promise<PostComment | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  try {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.user.id,
        content
      })
      .select(`
        *,
        user:user_id(id, display_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
}

export async function getPostComments(postId: string): Promise<PostComment[]> {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        user:user_id(id, display_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching post comments:', error);
    return [];
  }
}

export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
}

// Post likes
export async function toggleLike(postId: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  try {
    // Check if the user has already liked the post
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingLike) {
      // User has already liked the post, so unlike it
      const { error: unlikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);

      if (unlikeError) throw unlikeError;
      return false; // Post is now unliked
    } else {
      // User hasn't liked the post, so like it
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.user.id
        });

      if (likeError) throw likeError;
      return true; // Post is now liked
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return false;
  }
}

export async function getPostLikes(postId: string): Promise<{ count: number; userHasLiked: boolean }> {
  try {
    const { count, error } = await supabase
      .from('post_likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;

    // Check if the current user has liked the post
    const { data: user } = await supabase.auth.getUser();
    let userHasLiked = false;

    if (user.user) {
      const { data: userLike, error: userLikeError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (userLikeError) throw userLikeError;
      userHasLiked = !!userLike;
    }

    return { count: count || 0, userHasLiked };
  } catch (error) {
    console.error('Error getting post likes:', error);
    return { count: 0, userHasLiked: false };
  }
}

// Privacy settings
export async function getPrivacySettings(): Promise<PrivacySettings | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  try {
    const { data, error } = await supabase
      .from('user_privacy_settings')
      .select('*')
      .eq('id', user.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found error
        // Create default privacy settings if not found
        return createDefaultPrivacySettings(user.user.id);
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return null;
  }
}

export async function updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  try {
    const { data, error } = await supabase
      .from('user_privacy_settings')
      .update(settings)
      .eq('id', user.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return null;
  }
}

async function createDefaultPrivacySettings(userId: string): Promise<PrivacySettings | null> {
  try {
    const defaultSettings = {
      id: userId,
      profile_visibility: 'public',
      post_visibility: 'public',
      checkin_visibility: 'friends',
      allow_messages: 'friends',
      show_profile_comments: true
    };

    const { data, error } = await supabase
      .from('user_privacy_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating default privacy settings:', error);
    return null;
  }
}

// Helper function to check if two users are friends
export async function checkFriendship(userId: string): Promise<FriendStatus | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  try {
    const { data, error } = await supabase
      .from('user_friends')
      .select('status')
      .or(`user_id.eq.${user.user.id}.and.friend_id.eq.${userId},user_id.eq.${userId}.and.friend_id.eq.${user.user.id}`)
      .maybeSingle();

    if (error) throw error;
    return data ? data.status as FriendStatus : null;
  } catch (error) {
    console.error('Error checking friendship:', error);
    return null;
  }
}

// Create a check-in post at a campsite
export async function createCheckin(
  campsiteId: string, 
  content: string, 
  visibility: VisibilityType = 'friends'
): Promise<SocialPost | null> {
  const { data: campsite, error: campsiteError } = await supabase
    .from('campsites')
    .select('name, latitude, longitude, location')
    .eq('id', campsiteId)
    .single();
    
  if (campsiteError) {
    console.error('Error getting campsite data:', campsiteError);
    return null;
  }
  
  try {
    return await createPost({
      type: 'checkin',
      content,
      visibility,
      latitude: campsite.latitude,
      longitude: campsite.longitude,
      location_name: campsite.location,
      linked_campsite_id: campsiteId
    });
  } catch (error) {
    console.error('Error creating check-in:', error);
    return null;
  }
}
