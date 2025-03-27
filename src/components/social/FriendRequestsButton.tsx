
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePendingFriendRequests, useRespondToFriendRequest } from "@/hooks/useFriends";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const FriendRequestsButton = () => {
  const { data: requests, isLoading } = usePendingFriendRequests();
  const respondToRequestMutation = useRespondToFriendRequest();
  const [open, setOpen] = useState(false);
  
  const handleRespondToRequest = (requestId: string, accept: boolean) => {
    respondToRequestMutation.mutate({ requestId, accept });
  };
  
  const pendingCount = requests?.length || 0;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <h3 className="font-medium text-sm mb-3">Friend Requests</h3>
          
          {isLoading ? (
            <div className="text-center py-2 text-sm text-muted-foreground">Loading...</div>
          ) : requests && requests.length > 0 ? (
            requests.map(request => (
              <div key={request.id} className="flex gap-3 items-center border-b border-border pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                <Link to={`/creator/${request.friend?.id}`}>
                  <Avatar>
                    <AvatarImage src={request.friend?.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Link>
                
                <div className="flex-1">
                  <Link to={`/creator/${request.friend?.id}`} className="font-medium hover:underline">
                    {request.friend?.display_name || "User"}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleRespondToRequest(request.id, true)}
                    disabled={respondToRequestMutation.isPending}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleRespondToRequest(request.id, false)}
                    disabled={respondToRequestMutation.isPending}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-2 text-sm text-muted-foreground">No friend requests</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FriendRequestsButton;
