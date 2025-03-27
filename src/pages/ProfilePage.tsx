
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/providers/AuthProvider";
import { LogOut, User, CreditCard, MessageSquare, DollarSign, ArrowLeft } from "lucide-react";
import { getUserProfile, getCreatorSubscriptionPlans, getUserSubscriptions, getSubscribersForCreator, getProfileComments } from "@/lib/community/api";
import { UserProfile, SubscriptionPlan, UserSubscription, ProfileComment } from "@/lib/community/types";
import { useToast } from "@/hooks/use-toast";

// Import our new components
import ProfileTab from "@/components/profile/ProfileTab";
import MonetizationTab from "@/components/profile/MonetizationTab";
import SubscriptionsTab from "@/components/profile/SubscriptionsTab";
import ProfileComments from "@/components/profile/ProfileComments";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isEmailVerified, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  const [isCreator, setIsCreator] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [subscribers, setSubscribers] = useState<UserSubscription[]>([]);
  
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  
  const [comments, setComments] = useState<ProfileComment[]>([]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };
  
  useEffect(() => {
    if (user?.id) {
      const loadUserData = async () => {
        setIsProfileLoading(true);
        try {
          console.log("Loading profile for user:", user.id);
          const profile = await getUserProfile(user.id);
          console.log("Profile loaded:", profile);
          
          if (profile) {
            setUserProfile(profile);
            setIsCreator(profile.is_creator || false);
            
            if (profile.is_creator) {
              const plans = await getCreatorSubscriptionPlans(user.id);
              setSubscriptionPlans(plans);
              
              const subs = await getSubscribersForCreator(user.id);
              setSubscribers(subs);
            }
            
            const userSubs = await getUserSubscriptions(user.id);
            setSubscriptions(userSubs);
            
            const profileComments = await getProfileComments(user.id);
            setComments(profileComments);
          } else {
            // If profile is null, we need to create one
            console.log("No profile found, attempting to create one");
            toast({
              title: "Profile not found",
              description: "We need to create a profile for you.",
            });
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          toast({
            title: "Error loading profile",
            description: "There was a problem loading your profile data. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsProfileLoading(false);
        }
      };
      
      loadUserData();
    }
  }, [user?.id, toast]);

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

  if (isProfileLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="xl" className="mb-4" />
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleBackToHome}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">My Profile</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="monetization" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Monetization
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <ProfileTab 
            userProfile={userProfile} 
            isEditing={isEditing} 
            setIsEditing={setIsEditing}
            isCreator={isCreator}
          />
          
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full mt-4"
          >
            {isLoggingOut ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Signing out...
              </>
            ) : (
              <>
                Sign Out
                <LogOut className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </TabsContent>
        
        <TabsContent value="monetization">
          <MonetizationTab 
            isCreator={isCreator}
            setIsCreator={setIsCreator}
            subscriptionPlans={subscriptionPlans}
            setSubscriptionPlans={setSubscriptionPlans}
            subscribers={subscribers}
          />
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <SubscriptionsTab subscriptions={subscriptions} />
        </TabsContent>
        
        <TabsContent value="comments">
          <ProfileComments 
            profileId={user?.id || ""}
            comments={comments}
            onCommentAdded={handleCommentAdded}
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
