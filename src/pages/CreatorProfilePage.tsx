import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/providers/AuthProvider";
import { UserProfile, ProfileComment } from "@/lib/community/types";
import { getUserProfile, getProfileComments } from "@/lib/community/api";
import { ArrowLeft, User, MessageSquare, DollarSign, SparklesIcon, MessageCircle } from "lucide-react";
import CreatorSubscriptions from "@/components/creator/CreatorSubscriptions";
import ProfileComments from "@/components/profile/ProfileComments";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function CreatorProfilePage() {
  const { id: creatorId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [creatorProfile, setCreatorProfile] = useState<UserProfile | null>(null);
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("subscriptions");
  const isOwner = user && creatorId === user.id;
  const [isStartingConversation, setIsStartingConversation] = useState(false);

  useEffect(() => {
    if (creatorId) {
      const loadCreatorProfile = async () => {
        setIsLoading(true);
        try {
          const profile = await getUserProfile(creatorId);
          setCreatorProfile(profile);
          
          // Fetch profile comments
          const profileComments = await getProfileComments(creatorId);
          setComments(profileComments);
        } catch (error) {
          console.error("Error loading creator profile:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadCreatorProfile();
    }
  }, [creatorId]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const startConversation = async () => {
    if (!creatorProfile || !user) {
      // If not logged in, redirect to login
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to message creators",
          variant: "destructive"
        });
        navigate("/auth/login");
        return;
      }
      return;
    }

    setIsStartingConversation(true);
    try {
      // Check if a conversation already exists
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user.id}.and.user2_id.eq.${creatorProfile.id},user1_id.eq.${creatorProfile.id}.and.user2_id.eq.${user.id}`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingConversation) {
        // Navigate to existing conversation
        navigate('/messages');
        return;
      }

      // Create a new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: creatorProfile.id
        })
        .select();

      if (createError) throw createError;

      // Navigate to messages page
      navigate('/messages');
      toast({
        title: "Conversation started",
        description: `You can now message ${creatorProfile.display_name || 'this creator'}`,
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Failed to start conversation",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsStartingConversation(false);
    }
  };

  const handleCommentAdded = (comment: ProfileComment) => {
    setComments([comment, ...comments]);
  };
  
  const handleCommentUpdated = (updatedComment: ProfileComment) => {
    setComments(comments.map(comment => 
      comment.id === updatedComment.id ? updatedComment : comment
    ));
  };
  
  const handleCommentDeleted = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading creator profile...</p>
      </div>
    );
  }

  if (!creatorProfile) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 text-center">
        <h2 className="text-xl font-semibold">Creator not found</h2>
        <p className="mt-2 text-muted-foreground">The creator profile you're looking for doesn't exist or has been removed.</p>
        <Button onClick={handleBackClick} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  // If the profile exists but is not a creator, show an error
  if (!creatorProfile.is_creator) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 text-center">
        <h2 className="text-xl font-semibold">Not a Creator Account</h2>
        <p className="mt-2 text-muted-foreground">This user has not enabled creator features.</p>
        <Button onClick={handleBackClick} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 pb-20">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleBackClick}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Creator Profile</h1>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={creatorProfile.avatar_url || ""} alt={creatorProfile.display_name || "Creator"} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-center">
                {creatorProfile.display_name || "Creator"}
              </CardTitle>
              <CardDescription className="text-center">
                <span className="inline-flex items-center bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  Creator
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {creatorProfile.bio && (
                <p className="text-sm text-muted-foreground mt-2">
                  {creatorProfile.bio}
                </p>
              )}
              <div className="mt-4 flex flex-col gap-2">
                {!isOwner && (
                  <>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={startConversation}
                      disabled={isStartingConversation}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {isStartingConversation ? "Starting chat..." : "Message"}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="subscriptions" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Subscriptions
              </TabsTrigger>
              <TabsTrigger value="premium-content" className="flex items-center">
                <SparklesIcon className="h-4 w-4 mr-1" />
                Premium Content
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                Comments
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscriptions">
              <CreatorSubscriptions 
                creatorId={creatorId!} 
                isOwner={isOwner}
              />
            </TabsContent>
            
            <TabsContent value="premium-content">
              <Card>
                <CardHeader>
                  <CardTitle>Premium Content</CardTitle>
                  <CardDescription>
                    Exclusive resources shared by this creator
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-6">
                    Premium content will be displayed here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Comments</CardTitle>
                  <CardDescription>
                    Comments and interactions from the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileComments 
                    profileId={creatorId!}
                    comments={comments}
                    onCommentAdded={handleCommentAdded}
                    onCommentUpdated={handleCommentUpdated}
                    onCommentDeleted={handleCommentDeleted}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
