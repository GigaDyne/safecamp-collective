
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFriends, getPendingFriendRequests, sendFriendRequest, respondToFriendRequest, checkFriendship } from "@/lib/social/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { FriendStatus } from "@/lib/social/types";

export function useFriends() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['friends', 'accepted'],
    queryFn: () => getFriends('accepted'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user,
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error loading friends",
          description: "Could not load your friends list. Please try again.",
          variant: "destructive",
        });
        console.error('Error in useFriends query:', error);
      }
    }
  });
}

export function usePendingFriendRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['friendRequests', 'pending'],
    queryFn: getPendingFriendRequests,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user,
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error loading friend requests",
          description: "Could not load your friend requests. Please try again.",
          variant: "destructive",
        });
        console.error('Error in usePendingFriendRequests query:', error);
      }
    }
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (friendId: string) => sendFriendRequest(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error sending friend request",
        description: "Could not send the friend request. Please try again.",
        variant: "destructive",
      });
      console.error('Error sending friend request:', error);
    }
  });
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ requestId, accept }: { requestId: string; accept: boolean }) => 
      respondToFriendRequest(requestId, accept),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      
      toast({
        title: variables.accept ? "Friend request accepted" : "Friend request rejected",
        description: variables.accept 
          ? "You're now friends! You can see each other's posts and send messages."
          : "The friend request has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error responding to friend request",
        description: "Could not process the friend request. Please try again.",
        variant: "destructive",
      });
      console.error('Error responding to friend request:', error);
    }
  });
}

export function useCheckFriendship(userId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friendship', userId],
    queryFn: () => checkFriendship(userId || ''),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user && !!userId && userId !== user.id,
  });
}
