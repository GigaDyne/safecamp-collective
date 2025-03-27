
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MapPin, MessageSquare, Heart, Share, MoreVertical, User, Tent, AlertTriangle, HelpCircle, Sparkles } from "lucide-react";
import { SocialPost } from "@/lib/social/types";
import { useToggleLike } from "@/hooks/useSocialFeed";
import { Link } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";

interface SocialPostCardProps {
  post: SocialPost;
  onCommentClick?: () => void;
  onDeleteClick?: () => void;
  onShareClick?: () => void;
}

const SocialPostCard = ({ 
  post, 
  onCommentClick, 
  onDeleteClick,
  onShareClick
}: SocialPostCardProps) => {
  const { user } = useAuth();
  const toggleLikeMutation = useToggleLike();
  const [liked, setLiked] = useState(post.user_has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  
  const isOwnPost = user?.id === post.user_id;
  
  const handleLikeClick = () => {
    // Optimistically update UI
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    
    // Perform mutation
    toggleLikeMutation.mutate(post.id, {
      onError: () => {
        // Revert on error
        setLiked(liked);
        setLikesCount(prev => liked ? prev + 1 : prev - 1);
      }
    });
  };
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center space-y-0 gap-3">
        <Link to={`/creator/${post.user_id}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user?.avatar_url || undefined} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Link to={`/creator/${post.user_id}`} className="font-medium hover:underline">
              {post.user?.display_name || "Anonymous"}
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwnPost && (
                    <>
                      <DropdownMenuItem onClick={onDeleteClick} className="text-destructive">
                        Delete post
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={onShareClick}>Share</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {post.type !== 'text' && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {post.type === 'checkin' && (
                <>
                  <MapPin className="h-3 w-3" />
                  <span>Checked in at </span>
                  {post.linked_campsite ? (
                    <Link 
                      to={`/site/${post.linked_campsite.id}`} 
                      className="text-primary hover:underline"
                    >
                      {post.location_name || 'a campsite'}
                    </Link>
                  ) : (
                    <span>{post.location_name || 'a location'}</span>
                  )}
                </>
              )}
              
              {post.type === 'help' && (
                <>
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  <span className="text-yellow-500 font-medium">Requesting help</span>
                </>
              )}
              
              {post.type === 'discovery' && (
                <>
                  <Sparkles className="h-3 w-3 text-blue-500" />
                  <span className="text-blue-500 font-medium">Discovered a new spot</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-3">
        <p className="text-sm whitespace-pre-line">{post.content}</p>
        
        {post.linked_campsite && (
          <Link to={`/site/${post.linked_campsite.id}`}>
            <div className="mt-3 flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border">
              <Tent className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{post.linked_campsite.name}</p>
                <p className="text-xs text-muted-foreground">{post.linked_campsite.location}</p>
              </div>
            </div>
          </Link>
        )}
        
        {post.visibility !== 'public' && (
          <div className="mt-3">
            <Badge variant="outline" className="text-xs">
              {post.visibility === 'private' && 'Only you can see this'}
              {post.visibility === 'friends' && 'Visible to friends'}
              {post.visibility === 'friends_of_friends' && 'Visible to friends of friends'}
            </Badge>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-3 py-2 border-t flex justify-between">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 h-8 ${liked ? 'text-red-500' : ''}`}
            onClick={handleLikeClick}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-red-500' : ''}`} />
            <span className="text-xs">{likesCount > 0 ? likesCount : ''}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 h-8"
            onClick={onCommentClick}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">{post.comments_count || ''}</span>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={onShareClick}
        >
          <Share className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SocialPostCard;
