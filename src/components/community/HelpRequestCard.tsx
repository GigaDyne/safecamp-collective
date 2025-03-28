
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpRequest, UserProfile } from "@/lib/community/types";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { updateHelpRequest, getUserProfile } from "@/lib/community/api";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, MapPin, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DonationButton from "./DonationButton";

interface HelpRequestCardProps {
  helpRequest: HelpRequest;
  userProfile?: UserProfile;
  onUpdate?: () => void;
}

export default function HelpRequestCard({ helpRequest, userProfile, onUpdate }: HelpRequestCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [requesterProfile, setRequesterProfile] = React.useState<UserProfile | null>(null);

  // Fetch the profile of the user who created the help request
  React.useEffect(() => {
    if (!userProfile && helpRequest.user_id) {
      getUserProfile(helpRequest.user_id).then(profile => {
        if (profile) {
          setRequesterProfile(profile);
        }
      });
    }
  }, [helpRequest.user_id, userProfile]);

  const profile = userProfile || requesterProfile;
  const displayName = profile?.display_name || 'Anonymous User';
  const avatarUrl = profile?.avatar_url;

  // Calculate progress percentage if amount is requested
  const progress = helpRequest.amount_requested 
    ? Math.min(100, (helpRequest.amount_received / helpRequest.amount_requested) * 100) 
    : 0;

  const handleToggleStatus = async () => {
    if (!user || user.id !== helpRequest.user_id) return;
    
    setLoading(true);
    try {
      const updated = await updateHelpRequest(helpRequest.id, {
        is_active: !helpRequest.is_active
      });
      
      if (updated) {
        toast({
          title: `Request ${updated.is_active ? 'reopened' : 'marked as resolved'}`,
          description: `Your help request has been ${updated.is_active ? 'reopened' : 'marked as resolved'}.`,
        });
        
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error("Error updating help request:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your help request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden border shadow-sm">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{helpRequest.title}</CardTitle>
              <CardDescription>
                {displayName} • {formatDistanceToNow(new Date(helpRequest.created_at), { addSuffix: true })}
              </CardDescription>
            </div>
          </div>
          <Badge variant={helpRequest.is_active ? "default" : "secondary"}>
            {helpRequest.is_active ? "Active" : "Resolved"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <p className="text-sm">{helpRequest.description}</p>
        
        {helpRequest.location && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{helpRequest.location}</span>
          </div>
        )}
        
        {helpRequest.amount_requested > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Requested: ${helpRequest.amount_requested.toFixed(2)}</span>
              <span>Received: ${helpRequest.amount_received.toFixed(2)}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-4 bg-muted/10">
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-amber-600" />
              <span className="text-sm font-medium">Need assistance</span>
            </div>
            
            {user?.id === helpRequest.user_id && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToggleStatus}
                disabled={loading}
              >
                <Check className="h-4 w-4 mr-1" />
                {helpRequest.is_active ? "Mark as Resolved" : "Reopen Request"}
              </Button>
            )}
          </div>
          
          {helpRequest.is_active && user?.id !== helpRequest.user_id && (
            <div className="flex flex-wrap gap-2 justify-end">
              <DonationButton 
                amount={5} 
                recipientId={helpRequest.user_id} 
                helpRequestId={helpRequest.id} 
                variant="outline" 
                size="sm" 
              />
              <DonationButton 
                amount={10} 
                recipientId={helpRequest.user_id} 
                helpRequestId={helpRequest.id} 
                variant="outline" 
                size="sm" 
              />
              <DonationButton 
                amount={20} 
                recipientId={helpRequest.user_id} 
                helpRequestId={helpRequest.id} 
                size="sm" 
              />
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
