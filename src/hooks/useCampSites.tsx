import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CampSite, Review } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { fetchCampSites, saveCampSite } from "@/lib/campsites";
import { fetchSiteReviews, saveReview } from "@/lib/reviews";
import { ensureAuthenticated } from "@/lib/auth";

// Re-export ensureAuthenticated from auth.ts for backward compatibility
export { ensureAuthenticated } from "@/lib/auth";

// Re-export types from Supabase lib to make them available to components
export type { CampSite, Review } from "@/lib/supabase";

export function useCampSites() {
  const { toast } = useToast();
  
  // Use React Query to handle data fetching, caching, and loading states
  const { data: campSites, isLoading, error } = useQuery({
    queryKey: ['campSites'],
    queryFn: fetchCampSites,
    staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    retry: 1, // Only retry once
    meta: { // Use meta for custom error handling in tanstack v5
      onError: (error: any) => {
        toast({
          title: "Error loading campsites",
          description: "Failed to load campsites. Using offline data instead.",
          variant: "destructive",
        });
        console.error('Error in useCampSites query:', error);
      }
    }
  });

  return { campSites, isLoading, error };
}

// Custom hook to get reviews for a specific site
export function useCampSiteReviews(siteId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Query to fetch reviews from Supabase
  const { 
    data: reviews = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['campSiteReviews', siteId],
    queryFn: () => fetchSiteReviews(siteId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Mutation for adding a new review
  const addReviewMutation = useMutation({
    mutationFn: (newReview: Omit<Review, 'id' | 'date'>) => saveReview(newReview),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['campSiteReviews', siteId] });
      
      toast({
        title: "Review submitted!",
        description: "Thank you for sharing your experience at this campsite.",
      });
    },
    onError: (error) => {
      console.error('Error in mutation:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  return { 
    reviews, 
    isLoading, 
    error,
    addReview: addReviewMutation.mutate,
    isAddingReview: addReviewMutation.isPending
  };
}

// Hook to add a new campsite
export function useAddCampSite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const addCampSiteMutation = useMutation({
    mutationFn: (newCampSite: Omit<CampSite, 'id'>) => saveCampSite(newCampSite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campSites'] });
      
      toast({
        title: "Campsite added!",
        description: "Your campsite has been added to the map.",
      });
    },
    onError: (error) => {
      console.error('Error adding campsite:', error);
      toast({
        title: "Error",
        description: "There was an error adding your campsite. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  return {
    addCampSite: addCampSiteMutation.mutate,
    isAdding: addCampSiteMutation.isPending
  };
}
