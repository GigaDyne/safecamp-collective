
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { User, Send, MoreVertical, Trash } from "lucide-react";
import { usePostComments, useAddComment, useDeleteComment } from "@/hooks/usePostComments";
import { useAuth } from "@/providers/AuthProvider";
import { Link } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface PostCommentsListProps {
  postId: string;
}

const PostCommentsList = ({ postId }: PostCommentsListProps) => {
  const { user } = useAuth();
  const { data: comments, isLoading } = usePostComments(postId);
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();
  const [newComment, setNewComment] = useState("");
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate({
      postId,
      content: newComment
    }, {
      onSuccess: () => {
        setNewComment("");
      }
    });
  };
  
  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate({
      commentId,
      postId
    });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );
  }
  
  return (
    <div className="space-y-4 mt-4">
      {comments && comments.length > 0 ? (
        comments.map(comment => (
          <div key={comment.id} className="flex gap-3 group">
            <Link to={`/creator/${comment.user_id}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user?.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Link>
            
            <div className="flex-1">
              <div className="bg-muted rounded-lg p-3 relative">
                <Link to={`/creator/${comment.user_id}`} className="font-medium text-sm hover:underline">
                  {comment.user?.display_name || "Anonymous"}
                </Link>
                <p className="text-sm mt-1">{comment.content}</p>
                
                {comment.user_id === user?.id && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleDeleteComment(comment.id)} 
                          className="text-destructive"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1 ml-3">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      )}
      
      {user && (
        <form onSubmit={handleSubmitComment} className="flex gap-3 mt-6">
          <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              className="resize-none min-h-[40px] flex-1"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            
            <Button
              type="submit"
              size="icon"
              disabled={!newComment.trim() || addCommentMutation.isPending}
              className="h-10 w-10 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

const CommentSkeleton = () => (
  <div className="flex gap-3">
    <Skeleton className="h-8 w-8 rounded-full" />
    <div className="flex-1">
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-3 w-16 mt-1 ml-3" />
    </div>
  </div>
);

export default PostCommentsList;
