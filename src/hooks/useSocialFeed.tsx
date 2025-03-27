
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeedPosts, getUserPosts, createPost, deletePost, toggleLike } from "@/lib/social/api";
import { SocialPost } from "@/lib/social/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

export function useSocialFeed(limit = 20, page = 0) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['socialFeed', limit, page],
    queryFn: () => getFeedPosts(limit, page),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user,
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error loading feed",
          description: "Could not load the social feed. Please try again.",
          variant: "destructive",
        });
        console.error('Error in useSocialFeed query:', error);
      }
    }
  });
}

export function useUserPosts(userId: string, limit = 20, page = 0) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['userPosts', userId, limit, page],
    queryFn: () => getUserPosts(userId, limit, page),
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error loading posts",
          description: "Could not load the user's posts. Please try again.",
          variant: "destructive",
        });
        console.error('Error in useUserPosts query:', error);
      }
    }
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (newPost: Omit<SocialPost, 'id' | 'user_id' | 'created_at' | 'user'>) => createPost(newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialFeed'] });
      toast({
        title: "Post created",
        description: "Your post has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating post",
        description: "Could not create the post. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating post:', error);
    }
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialFeed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting post",
        description: "Could not delete the post. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting post:', error);
    }
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: string) => toggleLike(postId),
    onSuccess: (isLiked, postId) => {
      queryClient.invalidateQueries({ queryKey: ['socialFeed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
    }
  });
}
