
import { useState } from "react";
import { User, Trash, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { ProfileComment } from "@/lib/community/types";
import { addProfileComment, deleteProfileComment, updateProfileComment } from "@/lib/community/api";

interface ProfileCommentsProps {
  profileId: string;
  comments: ProfileComment[];
  onCommentAdded?: (comment: ProfileComment) => void;
  onCommentUpdated?: (comment: ProfileComment) => void;
  onCommentDeleted?: (commentId: string) => void;
}

export default function ProfileComments({
  profileId,
  comments,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted
}: ProfileCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!user?.id) return;
    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const comment = await addProfileComment({
        profile_id: profileId,
        commenter_id: user.id,
        content: newComment
      });
      
      if (comment) {
        setNewComment("");
        if (onCommentAdded) onCommentAdded(comment);
        
        toast({
          title: "Comment added",
          description: "Your comment has been added to the profile.",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment: ProfileComment) => {
    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent("");
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editedContent.trim()) {
      toast({
        title: "Empty comment",
        description: "Comment cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedComment = await updateProfileComment(commentId, {
        content: editedContent
      });
      
      if (updatedComment) {
        setEditingCommentId(null);
        if (onCommentUpdated) onCommentUpdated(updatedComment);
        
        toast({
          title: "Comment updated",
          description: "Your comment has been updated.",
        });
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      setIsSubmitting(true);
      try {
        const success = await deleteProfileComment(commentId);
        
        if (success) {
          if (onCommentDeleted) onCommentDeleted(commentId);
          
          toast({
            title: "Comment deleted",
            description: "The comment has been deleted.",
          });
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        toast({
          title: "Error",
          description: "Failed to delete comment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const canModifyComment = (comment: ProfileComment) => {
    if (!user) return false;
    return user.id === comment.commenter_id || user.id === profileId;
  };

  return (
    <div className="space-y-6">
      {user && (
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium mb-2">Add a Comment</h3>
          <Textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
          />
          <Button 
            className="mt-2"
            onClick={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-medium mb-4">Comments</h3>
        
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-md p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {comment.commenter?.avatar_url ? (
                      <img 
                        src={comment.commenter.avatar_url} 
                        alt={comment.commenter.display_name || "User"} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">
                        {comment.commenter?.display_name || "User"}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {editingCommentId === comment.id ? (
                      <div className="mt-2">
                        <Textarea 
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          rows={2}
                          className="mb-2"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={isSubmitting}
                          >
                            <Save className="h-4 w-4 mr-1" /> Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm mt-1">{comment.content}</p>
                    )}
                    
                    {canModifyComment(comment) && !editingCommentId && (
                      <div className="flex gap-2 mt-2">
                        {comment.commenter_id === user?.id && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEditComment(comment)}
                            className="h-8"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-destructive hover:text-destructive h-8"
                        >
                          <Trash className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
