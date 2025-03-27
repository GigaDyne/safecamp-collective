
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostComments, addComment, deleteComment } from "@/lib/social/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

export function usePostComments(postId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => getPostComments(postId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!postId && !!user,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => 
      addComment(postId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['postComments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding comment",
        description: "Could not add your comment. Please try again.",
        variant: "destructive",
      });
      console.error('Error adding comment:', error);
    }
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ commentId, postId }: { commentId: string; postId: string }) => 
      deleteComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['postComments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting comment",
        description: "Could not delete your comment. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting comment:', error);
    }
  });
}
