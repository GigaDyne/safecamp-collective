
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createHelpRequest } from "@/lib/community/api";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, LifeBuoy } from "lucide-react";

interface CreateHelpRequestFormProps {
  onSuccess?: () => void;
}

export default function CreateHelpRequestForm({ onSuccess }: CreateHelpRequestFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [amountRequested, setAmountRequested] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to create a help request.",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const helpRequest = await createHelpRequest({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || null,
        amount_requested: amountRequested ? parseFloat(amountRequested) : null,
      });
      
      if (helpRequest) {
        toast({
          title: "Help request created",
          description: "Your help request has been posted successfully.",
        });
        
        // Reset form
        setTitle("");
        setDescription("");
        setLocation("");
        setAmountRequested("");
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error("Failed to create help request");
      }
    } catch (error) {
      console.error("Error creating help request:", error);
      toast({
        title: "Error",
        description: "There was an error creating your help request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <Card>
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please login to create a help request.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <LifeBuoy className="h-5 w-5 text-amber-500" />
          <CardTitle>Request Assistance</CardTitle>
        </div>
        <CardDescription>
          Create a request for help from the SafeCamp community.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              placeholder="Brief description of your situation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              placeholder="Provide more details about your situation and what kind of help you need"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              placeholder="City, State or general area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount Needed (optional)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                value={amountRequested}
                onChange={(e) => setAmountRequested(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Help Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
