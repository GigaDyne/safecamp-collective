
import React from "react";
import { Button } from "@/components/ui/button";
import { useCheckFriendship, useSendFriendRequest } from "@/hooks/useFriends";
import { UserPlus, UserCheck, UserX, UserClock } from "lucide-react";

interface FriendRequestButtonProps {
  userId: string;
}

const FriendRequestButton = ({ userId }: FriendRequestButtonProps) => {
  const { data: friendshipStatus, isLoading } = useCheckFriendship(userId);
  const sendRequestMutation = useSendFriendRequest();
  
  const handleSendRequest = () => {
    sendRequestMutation.mutate(userId);
  };
  
  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <UserPlus className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }
  
  if (friendshipStatus === "accepted") {
    return (
      <Button variant="outline" disabled>
        <UserCheck className="mr-2 h-4 w-4" />
        Friends
      </Button>
    );
  }
  
  if (friendshipStatus === "pending") {
    return (
      <Button variant="outline" disabled>
        <UserClock className="mr-2 h-4 w-4" />
        Request Pending
      </Button>
    );
  }
  
  if (friendshipStatus === "rejected") {
    return (
      <Button variant="outline" disabled>
        <UserX className="mr-2 h-4 w-4" />
        Request Rejected
      </Button>
    );
  }
  
  return (
    <Button 
      onClick={handleSendRequest} 
      disabled={sendRequestMutation.isPending}
    >
      <UserPlus className="mr-2 h-4 w-4" />
      Add Friend
    </Button>
  );
};

export default FriendRequestButton;
