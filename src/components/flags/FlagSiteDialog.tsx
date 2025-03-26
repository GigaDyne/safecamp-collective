
import React, { useState } from "react";
import { Flag } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase, FlagReason, formatFlagForSupabase } from "@/lib/supabase";

interface FlagSiteDialogProps {
  siteId: string;
  siteName: string;
}

const FlagSiteDialog: React.FC<FlagSiteDialogProps> = ({ siteId, siteName }) => {
  const [reason, setReason] = useState<FlagReason | "">("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for flagging this site.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create flag object
      const flag = {
        siteId,
        userId: "user-" + Date.now(), // In a real app, get the real user ID
        reason: reason as FlagReason,
        details: details.trim() || undefined,
      };

      // Format for Supabase
      const supabaseFlag = formatFlagForSupabase(flag);

      // Insert into Supabase
      const { error } = await supabase.from("flags").insert(supabaseFlag);

      if (error) throw error;

      toast({
        title: "Site Flagged",
        description: "Thank you for helping keep SafeCamp accurate and safe.",
      });

      // Reset form and close dialog
      setReason("");
      setDetails("");
      setOpen(false);
    } catch (error) {
      console.error("Error flagging site:", error);
      toast({
        title: "Error",
        description: "There was an error flagging this site. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-2 border-border/50 text-muted-foreground"
        >
          <Flag className="h-4 w-4" />
          Flag this site
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Flag {siteName}</DialogTitle>
          <DialogDescription>
            Report issues with this campsite to help keep the community safe.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="flag-reason">Reason for flagging</Label>
            <Select value={reason} onValueChange={(value) => setReason(value as FlagReason)}>
              <SelectTrigger id="flag-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unsafe">This site is unsafe</SelectItem>
                <SelectItem value="closed">This site is closed/inaccessible</SelectItem>
                <SelectItem value="fake">This site doesn't exist</SelectItem>
                <SelectItem value="inaccurate">Information is inaccurate</SelectItem>
                <SelectItem value="other">Other reason</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="flag-details">Additional details (optional)</Label>
            <Textarea
              id="flag-details"
              placeholder="Please provide any specific details about the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Flag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlagSiteDialog;
