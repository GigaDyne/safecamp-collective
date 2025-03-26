
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/AuthProvider";
import { PremiumCampsite } from "@/lib/types/premium-campsite";
import { CampSite } from "@/lib/supabase";

// Form schema
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.coerce.number().min(0.5, {
    message: "Price must be at least 0.5",
  }).max(1000, {
    message: "Price cannot exceed 1000",
  }),
});

interface PremiumCampsiteFormProps {
  campsite: CampSite;
  existingPremiumCampsite?: PremiumCampsite;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function PremiumCampsiteForm({
  campsite,
  existingPremiumCampsite,
  onSubmit,
  onCancel,
  isSubmitting,
}: PremiumCampsiteFormProps) {
  const { user } = useAuth();
  
  // Initialize form with default values or existing premium campsite data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: existingPremiumCampsite?.title || campsite.name,
      description: existingPremiumCampsite?.description || campsite.description,
      price: existingPremiumCampsite?.price || 5.99,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    onSubmit(values);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          {existingPremiumCampsite ? "Edit Premium Listing" : "Create Premium Listing"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Share your exclusive campsite details with subscribers.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Amazing Hidden Campsite" {...field} />
                </FormControl>
                <FormDescription>
                  A catchy title for your premium campsite.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Detailed description with secret access information, best camping spots, and insider tips..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Provide detailed information that will be valuable to subscribers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="9.99" 
                    min="0.5"
                    step="0.01"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Set a fair price for your premium information.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : existingPremiumCampsite ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
