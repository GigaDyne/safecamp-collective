
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SocialPostCard from "./SocialPostCard";
import PostCommentsList from "./PostCommentsList";
import { SocialPost } from "@/lib/social/types";
import { useDeletePost } from "@/hooks/useSocialFeed";
import { useToast } from "@/hooks/use-toast";

interface PostDetailsDialogProps {
  post: SocialPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PostDetailsDialog = ({ post, open, onOpenChange }: PostDetailsDialogProps) => {
  const { toast } = useToast();
  const deletePostMutation = useDeletePost();
  
  if (!post) return null;
  
  const handleDeleteClick = () => {
    deletePostMutation.mutate(post.id, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };
  
  const handleShareClick = () => {
    // For demonstration, just copy a URL to clipboard
    // In a real app, we'd have a proper sharing mechanism
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Post link copied to clipboard",
        });
      })
      .catch(err => {
        console.error("Failed to copy link", err);
        toast({
          title: "Failed to copy link",
          description: "Please try again",
          variant: "destructive",
        });
      });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[95vh] max-h-[800px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Post</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <SocialPostCard 
            post={post} 
            onDeleteClick={handleDeleteClick}
            onShareClick={handleShareClick}
          />
          
          <PostCommentsList postId={post.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailsDialog;
