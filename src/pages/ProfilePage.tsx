import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/providers/AuthProvider";
import { LogOut, Mail, Shield, AlertTriangle, ArrowLeft, User, CreditCard, MessageSquare, DollarSign, Heart, Edit, Save, Upload, X } from "lucide-react";
import { getUserProfile, updateUserProfile, getCreatorSubscriptionPlans, createSubscriptionPlan, getUserSubscriptions, getSubscribersForCreator, getProfileComments, addProfileComment } from "@/lib/community/api";
import { UserProfile, SubscriptionPlan, UserSubscription, ProfileComment } from "@/lib/community/types";
import { createCheckoutSession } from "@/lib/community/payment";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isEmailVerified, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile states
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Creator states
  const [isCreator, setIsCreator] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [subscribers, setSubscribers] = useState<UserSubscription[]>([]);
  
  // Subscriber states
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  
  // Comments states
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [newComment, setNewComment] = useState("");
  
  // Creator form states
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDescription, setNewPlanDescription] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");
  const [showNewPlanForm, setShowNewPlanForm] = useState(false);

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

  // Format the user created date
  const formatCreatedDate = () => {
    if (!user?.created_at) {
      return "Unknown";
    }
    
    return new Date(user.created_at).toLocaleDateString();
  };
  
  // Load user profile
  useEffect(() => {
    if (user?.id) {
      const loadUserData = async () => {
        setIsProfileLoading(true);
        try {
          const profile = await getUserProfile(user.id);
          if (profile) {
            setUserProfile(profile);
            setDisplayName(profile.display_name || "");
            setBio(profile.bio || "");
            setAvatarUrl(profile.avatar_url);
            setIsCreator(profile.is_creator);
            
            // If user is creator, load their subscription plans and subscribers
            if (profile.is_creator) {
              const plans = await getCreatorSubscriptionPlans(user.id);
              setSubscriptionPlans(plans);
              
              const subs = await getSubscribersForCreator(user.id);
              setSubscribers(subs);
            }
            
            // Load user's subscriptions
            const userSubs = await getUserSubscriptions(user.id);
            setSubscriptions(userSubs);
            
            // Load comments
            const profileComments = await getProfileComments(user.id);
            setComments(profileComments);
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

  // Handle avatar file change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setAvatarFile(file);
      // Create temp preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };

  // Handle uploading avatar to storage
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user?.id) return avatarUrl;
    
    setUploadingAvatar(true);
    try {
      // Create a unique file path for the avatar
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, avatarFile, {
          upsert: true,
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your avatar",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    setAvatarFile(null);
  };
  
  // Handle profile update
  const saveProfile = async () => {
    if (!user?.id || !userProfile) return;
    
    setIsSaving(true);
    try {
      // Upload avatar if there's a new file
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar();
        if (!newAvatarUrl) {
          setIsSaving(false);
          return; // Upload failed
        }
      }
      
      const updatedProfile = await updateUserProfile({
        id: user.id,
        display_name: displayName,
        bio: bio,
        avatar_url: newAvatarUrl,
        is_creator: isCreator
      });
      
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setAvatarUrl(updatedProfile.avatar_url);
        setAvatarFile(null);
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle subscription plan creation
  const handleCreatePlan = async () => {
    if (!user?.id) return;
    
    try {
      if (!newPlanName || !newPlanDescription || !newPlanPrice) {
        toast({
          title: "Missing information",
          description: "Please fill in all fields for your subscription plan.",
          variant: "destructive",
        });
        return;
      }
      
      const price = Number(newPlanPrice);
      if (isNaN(price) || price <= 0) {
        toast({
          title: "Invalid price",
          description: "Please enter a valid price.",
          variant: "destructive",
        });
        return;
      }
      
      const newPlan = await createSubscriptionPlan({
        creator_id: user.id,
        name: newPlanName,
        description: newPlanDescription,
        price: price,
        stripe_price_id: null  // This would be set after creating a price in Stripe
      });
      
      if (newPlan) {
        setSubscriptionPlans([...subscriptionPlans, newPlan]);
        setNewPlanName("");
        setNewPlanDescription("");
        setNewPlanPrice("");
        setShowNewPlanForm(false);
        toast({
          title: "Plan created",
          description: "Your subscription plan has been created. Note: Stripe integration is not complete yet.",
        });
      }
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      toast({
        title: "Error",
        description: "Failed to create subscription plan. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle subscription to a creator
  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user?.id) {
      toast({
        title: "Login required",
        description: "Please log in to subscribe to this creator.",
        variant: "destructive",
      });
      return;
    }
    
    // This is a placeholder for Stripe integration
    toast({
      title: "Stripe Integration",
      description: "Stripe payment processing would be triggered here.",
    });
    
    // In a real implementation, we would redirect to a Stripe checkout session
    // const checkoutUrl = await createCheckoutSession(
    //   plan.stripe_price_id!,
    //   'subscription',
    //   undefined,
    //   plan.creator_id
    // );
    // 
    // if (checkoutUrl) {
    //   window.location.href = checkoutUrl;
    // }
  };
  
  // Handle adding a comment
  const handleAddComment = async () => {
    if (!user?.id || !userProfile?.id) return;
    
    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const comment = await addProfileComment({
        profile_id: userProfile.id,
        commenter_id: user.id,
        content: newComment
      });
      
      if (comment) {
        // Add user info to comment for display
        const commentWithUser = {
          ...comment,
          commenter: {
            id: user.id,
            display_name: userProfile.display_name || user.email?.split('@')[0] || "User",
            avatar_url: userProfile.avatar_url
          }
        };
        
        setComments([commentWithUser, ...comments]);
        setNewComment("");
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
    }
  };
  
  // Toggle creator mode
  const toggleCreatorMode = async () => {
    if (!user?.id || !userProfile) return;
    
    try {
      const updatedProfile = await updateUserProfile({
        id: user.id,
        is_creator: !isCreator
      });
      
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setIsCreator(!isCreator);
        toast({
          title: isCreator ? "Creator mode disabled" : "Creator mode enabled",
          description: isCreator 
            ? "You are no longer in creator mode." 
            : "You are now in creator mode and can create subscription plans.",
        });
      }
    } catch (error) {
      console.error("Error toggling creator mode:", error);
      toast({
        title: "Error",
        description: "Failed to update creator status. Please try again.",
        variant: "destructive",
      });
    }
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
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 mb-2">
                        <AvatarImage src={avatarUrl || ""} alt={displayName} />
                        <AvatarFallback className="text-lg">
                          {displayName ? displayName.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label 
                          htmlFor="avatar-upload" 
                          className="bg-primary/80 text-primary-foreground w-full h-full rounded-full flex items-center justify-center cursor-pointer"
                        >
                          <Upload className="h-6 w-6" />
                          <span className="sr-only">Upload Avatar</span>
                        </label>
                        <input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleAvatarChange}
                        />
                      </div>
                    </div>
                    {avatarUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRemoveAvatar}
                        className="mt-2"
                      >
                        <X className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Click the avatar to upload a new image</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Display Name</label>
                    <Input 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Bio</label>
                    <Textarea 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell others about yourself"
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center mb-4">
                    <Avatar className="h-24 w-24 mb-2">
                      <AvatarImage src={avatarUrl || ""} alt={userProfile?.display_name || "User"} />
                      <AvatarFallback className="text-lg">
                        {userProfile?.display_name ? userProfile.display_name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-medium">
                      {userProfile?.display_name || user?.email?.split('@')[0] || "User"}
                    </h3>
                    {isCreator && (
                      <span className="inline-flex items-center bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs mt-1">
                        Creator
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{user?.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Shield className={`h-5 w-5 ${isEmailVerified ? "text-green-500" : "text-amber-500"}`} />
                    <span>
                      {isEmailVerified 
                        ? "Email verified" 
                        : "Email not verified"}
                    </span>
                  </div>
                  
                  {userProfile?.bio && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-1">About me:</h4>
                      <p className="text-muted-foreground">{userProfile.bio}</p>
                    </div>
                  )}
                  
                  {!isEmailVerified && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your email is not verified. Some features will be limited until you verify your email.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    Account created: {formatCreatedDate()}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              {isEditing ? (
                <div className="flex space-x-2 w-full">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      // Reset avatar if it was changed but not saved
                      if (avatarFile) {
                        setAvatarUrl(userProfile?.avatar_url || null);
                        setAvatarFile(null);
                      }
                      // Reset other fields
                      setDisplayName(userProfile?.display_name || "");
                      setBio(userProfile?.bio || "");
                    }}
                    className="flex-1"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveProfile}
                    className="flex-1"
                    disabled={isSaving || uploadingAvatar}
                  >
                    {isSaving ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="w-full"
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
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Monetization Tab */}
        <TabsContent value="monetization">
          <Card>
            <CardHeader>
              <CardTitle>Monetization</CardTitle>
              <CardDescription>Earn money by sharing your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Creator Mode</h3>
                  <p className="text-sm text-muted-foreground">Enable creator features to monetize your content</p>
                </div>
                <Button
                  variant={isCreator ? "default" : "outline"}
                  onClick={toggleCreatorMode}
                >
                  {isCreator ? "Enabled" : "Become a Creator"}
                </Button>
              </div>
              
              {isCreator && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Your Subscription Plans</h3>
                    
                    {subscriptionPlans.length === 0 ? (
                      <p className="text-sm text-muted-foreground">You haven't created any subscription plans yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {subscriptionPlans.map((plan) => (
                          <div key={plan.id} className="border rounded-md p-4">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{plan.name}</h4>
                              <p className="font-semibold">${plan.price}/month</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!showNewPlanForm ? (
                      <Button 
                        className="mt-4"
                        onClick={() => setShowNewPlanForm(true)}
                      >
                        Add Subscription Plan
                      </Button>
                    ) : (
                      <div className="mt-4 space-y-3 border p-4 rounded-md">
                        <h4 className="font-medium">New Subscription Plan</h4>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Plan Name</label>
                          <Input 
                            value={newPlanName} 
                            onChange={(e) => setNewPlanName(e.target.value)}
                            placeholder="e.g. Basic, Premium, etc."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Description</label>
                          <Textarea 
                            value={newPlanDescription} 
                            onChange={(e) => setNewPlanDescription(e.target.value)}
                            placeholder="Describe what subscribers will get"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Price per month ($)</label>
                          <Input 
                            value={newPlanPrice} 
                            onChange={(e) => setNewPlanPrice(e.target.value)}
                            placeholder="5.99"
                            type="number"
                            min="0.99"
                            step="0.01"
                          />
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowNewPlanForm(false);
                              setNewPlanName("");
                              setNewPlanDescription("");
                              setNewPlanPrice("");
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreatePlan}
                            className="flex-1"
                          >
                            Create Plan
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Your Subscribers</h3>
                    
                    {subscribers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">You don't have any subscribers yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {subscribers.map((sub) => (
                          <div key={sub.id} className="border rounded-md p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{sub.subscriber_id}</p>
                              <p className="text-sm text-muted-foreground">{sub.plan?.name || "Unknown plan"}</p>
                            </div>
                            <p className="font-semibold">${sub.plan?.price || "0"}/month</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Premium Campsites</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Monetize your favorite campsites by making them premium content for your subscribers.
                    </p>
                    
                    <Button>Add Premium Campsite</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Your Subscriptions</CardTitle>
              <CardDescription>Manage your active subscriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Subscriptions Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Support your favorite creators by subscribing to their content for exclusive access to premium campsites and more.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{sub.plan?.name || "Subscription"}</h4>
                          <p className="text-sm text-muted-foreground">{sub.plan?.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Renews on {new Date(sub.current_period_end).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${sub.plan?.price}/month</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Comments Tab */}
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Profile Comments</CardTitle>
              <CardDescription>Interact with your community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  disabled={!newComment.trim()}
                >
                  Post Comment
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">All Comments</h3>
                
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border rounded-md p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
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
                            <p className="text-sm mt-1">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
