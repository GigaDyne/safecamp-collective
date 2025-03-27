
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { VisibilityType } from "@/lib/social/types";
import { createCheckin } from "@/lib/social/api";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, User2, Users, Globe } from "lucide-react";

interface CheckinButtonProps {
  campsiteId: string;
  campsiteName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const CheckinButton = ({ 
  campsiteId,
  campsiteName,
  variant = "default",
  size = "default"
}: CheckinButtonProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<VisibilityType>("friends");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCheckin = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const result = await createCheckin(campsiteId, content, visibility);
      
      if (result) {
        toast({
          title: "Check-in successful",
          description: `You've checked in at ${campsiteName}`,
        });
        setOpen(false);
        setContent("");
      } else {
        toast({
          title: "Check-in failed",
          description: "Could not create check-in. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating checkin:", error);
      toast({
        title: "Check-in failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
      >
        <MapPin className="mr-2 h-4 w-4" />
        Check In
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check in at {campsiteName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Share your experience..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Who can see this?</div>
              
              <Select
                value={visibility}
                onValueChange={(value) => setVisibility(value as VisibilityType)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
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
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCheckin} 
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? "Checking in..." : "Check In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckinButton;
