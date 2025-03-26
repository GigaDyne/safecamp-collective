
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HelpRequestsList from "@/components/community/HelpRequestsList";
import CreateHelpRequestForm from "@/components/community/CreateHelpRequestForm";
import { useAuth } from "@/providers/AuthProvider";
import { getUserHelpRequests } from "@/lib/community/api";
import { HelpRequest } from "@/lib/community/types";
import HelpRequestCard from "@/components/community/HelpRequestCard";

export default function CommunityHelpPage() {
  const { user } = useAuth();
  const [userRequests, setUserRequests] = React.useState<HelpRequest[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      fetchUserRequests();
    }
  }, [user, refreshKey]);

  const fetchUserRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const requests = await getUserHelpRequests(user.id);
      setUserRequests(requests);
    } catch (error) {
      console.error("Error fetching user help requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCreated = () => {
    // Refresh both lists
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Community Help</h1>
      
      <Tabs defaultValue="feed" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">Help Feed</TabsTrigger>
          <TabsTrigger value="create">Create Request</TabsTrigger>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed" className="mt-6">
          <HelpRequestsList key={`feed-${refreshKey}`} limit={20} showTabs={true} />
        </TabsContent>
        
        <TabsContent value="create" className="mt-6">
          <CreateHelpRequestForm onSuccess={handleRequestCreated} />
        </TabsContent>
        
        <TabsContent value="my-requests" className="mt-6">
          {user ? (
            loading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your help requests...</p>
              </div>
            ) : userRequests.length > 0 ? (
              <div className="space-y-6">
                {userRequests.map((request) => (
                  <HelpRequestCard 
                    key={request.id} 
                    helpRequest={request} 
                    onUpdate={handleRequestCreated}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">You haven't created any help requests yet.</p>
              </div>
            )
          ) : (
            <div className="py-8 text-center border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">Please log in to view your help requests.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
