
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PremiumCampsite } from "@/lib/types/premium-campsite";
import { 
  fetchPremiumCampsites, 
  fetchUserPremiumCampsites, 
  fetchPremiumCampsite,
  createPremiumCampsite,
  updatePremiumCampsite,
  deletePremiumCampsite,
  canAccessPremiumCampsite
} from "@/lib/premium-campsites";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

// Hook to fetch all premium campsites
export function usePremiumCampsites() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['premiumCampsites'],
    queryFn: fetchPremiumCampsites,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error loading premium campsites",
          description: "Could not load premium campsites. Please try again.",
          variant: "destructive",
        });
        console.error('Error in usePremiumCampsites query:', error);
      }
    }
  });
}

// Hook to fetch premium campsites for the current user
export function useUserPremiumCampsites() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['userPremiumCampsites', user?.id],
    queryFn: () => fetchUserPremiumCampsites(user?.id || ''),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error loading your premium campsites",
          description: "Could not load your premium campsites. Please try again.",
          variant: "destructive",
        });
        console.error('Error in useUserPremiumCampsites query:', error);
      }
    }
  });
}

// Hook to fetch a single premium campsite by ID
export function usePremiumCampsite(id: string | undefined) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['premiumCampsite', id],
    queryFn: () => fetchPremiumCampsite(id || ''),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error loading premium campsite",
          description: "Could not load the premium campsite details. Please try again.",
          variant: "destructive",
        });
        console.error('Error in usePremiumCampsite query:', error);
      }
    }
  });
}

// Hook to check if user can access a premium campsite
export function useCanAccessPremiumCampsite(id: string | undefined) {
  return useQuery({
    queryKey: ['premiumCampsiteAccess', id],
    queryFn: () => canAccessPremiumCampsite(id || ''),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for creating a premium campsite
export function useCreatePremiumCampsite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (newCampsite: Omit<PremiumCampsite, 'id' | 'created_at' | 'updated_at'>) => 
      createPremiumCampsite({ ...newCampsite, user_id: user?.id || '' }),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['premiumCampsites'] });
      queryClient.invalidateQueries({ queryKey: ['userPremiumCampsites'] });
      
      toast({
        title: "Premium campsite created",
        description: "Your premium campsite has been successfully created.",
      });
    },
    onError: (error) => {
      console.error('Error creating premium campsite:', error);
      toast({
        title: "Error creating premium campsite",
        description: "There was an error creating your premium campsite. Please try again.",
        variant: "destructive",
      });
    }
  });
}

// Hook for updating a premium campsite
export function useUpdatePremiumCampsite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<PremiumCampsite> }) => 
      updatePremiumCampsite(id, updates),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['premiumCampsites'] });
      queryClient.invalidateQueries({ queryKey: ['userPremiumCampsites'] });
      queryClient.invalidateQueries({ queryKey: ['premiumCampsite', variables.id] });
      
      toast({
        title: "Premium campsite updated",
        description: "Your premium campsite has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating premium campsite:', error);
      toast({
        title: "Error updating premium campsite",
        description: "There was an error updating your premium campsite. Please try again.",
        variant: "destructive",
      });
    }
  });
}

// Hook for deleting a premium campsite
export function useDeletePremiumCampsite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: string) => deletePremiumCampsite(id),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['premiumCampsites'] });
      queryClient.invalidateQueries({ queryKey: ['userPremiumCampsites'] });
      
      toast({
        title: "Premium campsite deleted",
        description: "Your premium campsite has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error('Error deleting premium campsite:', error);
      toast({
        title: "Error deleting premium campsite",
        description: "There was an error deleting your premium campsite. Please try again.",
        variant: "destructive",
      });
    }
  });
}
