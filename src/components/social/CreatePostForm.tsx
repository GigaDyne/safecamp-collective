
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, Shield, User2, Users, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VisibilityType } from "@/lib/social/types";
import { useAuth } from "@/providers/AuthProvider";
import { getUserProfile } from "@/lib/community/api";
import { useCreatePost } from "@/hooks/useSocialFeed";

interface CreatePostFormProps {
  onSuccess?: () => void;
}

const CreatePostForm = ({ onSuccess }: CreatePostFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<VisibilityType>("public");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const createPostMutation = useCreatePost();

  React.useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      getUserProfile(user.id)
        .then(profile => {
          setUserProfile(profile);
        })
        .catch(err => {
          console.error("Failed to load user profile", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user?.id]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    createPostMutation.mutate({
      type: "text",
      content,
      visibility,
      latitude: null,
      longitude: null,
      location_name: null,
      linked_campsite_id: null
    }, {
      onSuccess: () => {
        setContent("");
        onSuccess?.();
      }
    });
  };
  
  const getVisibilityIcon = (visibility: VisibilityType) => {
    switch (visibility) {
      case "private":
        return <Shield className="h-4 w-4" />;
      case "friends":
        return <User2 className="h-4 w-4" />;
      case "friends_of_friends":
        return <Users className="h-4 w-4" />;
      case "public":
        return <Globe className="h-4 w-4" />;
    }
  };
  
  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProfile?.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                className="resize-none min-h-[100px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center border-t pt-3">
          <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            Add Location
          </Button>
          
          <div className="flex items-center gap-2">
            <Select
              value={visibility}
              onValueChange={(value) => setVisibility(value as VisibilityType)}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public" className="flex items-center">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>Public</span>
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center">
                    <User2 className="h-4 w-4 mr-2" />
                    <span>Friends</span>
                  </div>
                </SelectItem>
                <SelectItem value="friends_of_friends">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Friends of Friends</span>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Only Me</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              type="submit" 
              disabled={!content.trim() || createPostMutation.isPending}
              size="sm"
            >
              Post
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePostForm;
