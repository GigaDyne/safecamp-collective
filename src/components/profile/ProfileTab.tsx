
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/providers/AuthProvider";
import { AlertTriangle, Edit, Save, Upload, User, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/lib/community/types";
import { updateUserProfile } from "@/lib/community/api";
import { supabase } from "@/integrations/supabase/client";

interface ProfileTabProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  isCreator: boolean;
}

export default function ProfileTab({ 
  userProfile, 
  isEditing, 
  setIsEditing, 
  isCreator 
}: ProfileTabProps) {
  const { user, isEmailVerified } = useAuth();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState(userProfile?.display_name || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userProfile?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const formatCreatedDate = () => {
    if (!user?.created_at) {
      return "Unknown";
    }
    
    return new Date(user.created_at).toLocaleDateString();
  };

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
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user?.id) return avatarUrl;
    
    setUploadingAvatar(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Validate file size and type
      if (avatarFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 5MB",
          variant: "destructive",
        });
        setUploadingAvatar(false);
        return null;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(avatarFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, GIF, or WebP image",
          variant: "destructive",
        });
        setUploadingAvatar(false);
        return null;
      }
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        toast({
          title: "Upload failed",
          description: uploadError.message || "There was an error uploading your avatar",
          variant: "destructive",
        });
        return null;
      }
      
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);
      
      if (urlError) {
        console.error("Public URL error:", urlError);
        toast({
          title: "URL Generation Failed",
          description: "Could not generate a public URL for your avatar",
          variant: "destructive",
        });
        return null;
      }
      
      return publicUrl;
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred while uploading your avatar",
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
  
  const saveProfile = async () => {
    if (!user?.id || !userProfile) {
      toast({
        title: "Error",
        description: "User not authenticated or profile not loaded.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Save button clicked - Starting profile save process");
    setIsSaving(true);
    setSaveError(null);
    
    try {
      let newAvatarUrl = avatarUrl;
      
      // Only upload if a new file is selected
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar();
        
        // If upload fails, stop profile save
        if (!newAvatarUrl) {
          toast({
            title: "Avatar Upload Failed",
            description: "Please try uploading your avatar again",
            variant: "destructive",
          });
          return;
        }
      }
      
      const profileData = {
        id: user.id,
        display_name: displayName,
        bio: bio,
        avatar_url: newAvatarUrl,
        is_creator: isCreator
      };
      
      console.log('Sending profile update with data:', profileData);
      
      const updatedProfile = await updateUserProfile(profileData);
      
      if (updatedProfile) {
        setAvatarUrl(updatedProfile.avatar_url);
        setAvatarFile(null);
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
        console.log('Profile updated successfully:', updatedProfile);
      } else {
        throw new Error("Failed to update profile: No data returned");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error?.message || "Failed to update profile. Please try again.";
      setSaveError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
            
            {saveError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}
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
              <User className="h-5 w-5 text-muted-foreground" />
              <span>{user?.email}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`h-5 w-5 ${isEmailVerified ? "text-green-500" : "text-amber-500"}`} />
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
      <CardFooter>
        {isEditing ? (
          <div className="flex space-x-2 w-full">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                if (avatarFile) {
                  setAvatarUrl(userProfile?.avatar_url || null);
                  setAvatarFile(null);
                }
                setDisplayName(userProfile?.display_name || "");
                setBio(userProfile?.bio || "");
                setSaveError(null);
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
      </CardFooter>
    </Card>
  );
}
