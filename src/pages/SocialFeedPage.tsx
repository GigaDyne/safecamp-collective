
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useSocialFeed, useDeletePost } from "@/hooks/useSocialFeed";
import { useAuth } from "@/providers/AuthProvider";
import CreatePostForm from "@/components/social/CreatePostForm";
import SocialPostCard from "@/components/social/SocialPostCard";
import PostDetailsDialog from "@/components/social/PostDetailsDialog";
import FriendRequestsButton from "@/components/social/FriendRequestsButton";
import { SocialPost } from "@/lib/social/types";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const SocialFeedPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: posts, isLoading, refetch, isRefetching } = useSocialFeed();
  const deletePostMutation = useDeletePost();
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handlePostClick = (post: SocialPost) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };
  
  const handleDeletePost = (postId: string) => {
    deletePostMutation.mutate(postId);
  };
  
  const handleSharePost = (post: SocialPost) => {
    // For demonstration, just copy a URL to clipboard
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
  
  if (!user) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">SafeCamp Social</h1>
          <p className="mb-6">Please log in to view the social feed and connect with other campers.</p>
          <Link to="/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Social Feed | SafeCamp</title>
      </Helmet>
      
      <div className="container max-w-md mx-auto py-4 px-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">SafeCamp Social</h1>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCcw className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
            
            <Link to="/friends">
              <Button variant="ghost" size="icon">
                <Users className="h-5 w-5" />
              </Button>
            </Link>
            
            <FriendRequestsButton />
          </div>
        </div>
        
        <CreatePostForm onSuccess={() => refetch()} />
        
        {isLoading ? (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts && posts.length > 0 ? (
          <div>
            {posts.map(post => (
              <SocialPostCard 
                key={post.id} 
                post={post} 
                onCommentClick={() => handlePostClick(post)}
                onDeleteClick={() => handleDeletePost(post.id)}
                onShareClick={() => handleSharePost(post)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md">
            <p className="text-muted-foreground mb-4">No posts yet</p>
            <p className="text-sm text-muted-foreground">
              Start posting or adding friends to see content here
            </p>
          </div>
        )}
      </div>
      
      <PostDetailsDialog 
        post={selectedPost}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
};

const PostSkeleton = () => (
  <div className="border rounded-md p-4 mb-4">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div>
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="h-16 w-full mb-4" />
    <div className="flex justify-between">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-8" />
    </div>
  </div>
);

export default SocialFeedPage;
