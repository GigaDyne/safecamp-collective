
import React, { useState, useEffect } from "react";
import { getHelpRequests } from "@/lib/community/api";
import { HelpRequest } from "@/lib/community/types";
import HelpRequestCard from "./HelpRequestCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";

interface HelpRequestsListProps {
  limit?: number;
  showTabs?: boolean;
}

export default function HelpRequestsList({ limit = 10, showTabs = true }: HelpRequestsListProps) {
  const [activeRequests, setActiveRequests] = useState<HelpRequest[]>([]);
  const [resolvedRequests, setResolvedRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const active = await getHelpRequests(limit, true);
      setActiveRequests(active);
      
      if (showTabs) {
        const resolved = await getHelpRequests(limit, false);
        setResolvedRequests(resolved);
      }
    } catch (error) {
      console.error("Error fetching help requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [limit, showTabs]);

  const handleRefresh = () => {
    fetchRequests();
  };

  if (loading && activeRequests.length === 0 && resolvedRequests.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading help requests...</p>
      </div>
    );
  }

  const renderRequestsList = (requests: HelpRequest[], isEmpty: JSX.Element) => {
    if (requests.length === 0) {
      return isEmpty;
    }

    return (
      <div className="space-y-6">
        {requests.map((request) => (
          <HelpRequestCard 
            key={request.id} 
            helpRequest={request} 
            onUpdate={handleRefresh}
          />
        ))}
      </div>
    );
  };

  const emptyActiveState = (
    <div className="py-8 text-center border rounded-lg bg-muted/20">
      <p className="text-muted-foreground">No active help requests at the moment.</p>
    </div>
  );

  const emptyResolvedState = (
    <div className="py-8 text-center border rounded-lg bg-muted/20">
      <p className="text-muted-foreground">No resolved help requests to display.</p>
    </div>
  );

  if (!showTabs) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Help Requests</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        {renderRequestsList(activeRequests, emptyActiveState)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Help Requests</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Requests</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="pt-4">
          {renderRequestsList(activeRequests, emptyActiveState)}
        </TabsContent>
        
        <TabsContent value="resolved" className="pt-4">
          {renderRequestsList(resolvedRequests, emptyResolvedState)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
