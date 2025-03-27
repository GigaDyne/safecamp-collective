
import React from "react";
import { Helmet } from "react-helmet";
import { useFriends } from "@/hooks/useFriends";
import { useAuth } from "@/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, MessageSquare, ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const FriendsPage = () => {
  const { user } = useAuth();
  const { data: friends, isLoading } = useFriends();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState("");
  
  if (!user) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Friends</h1>
          <p className="mb-6">Please log in to view and manage your friends.</p>
          <Link to="/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const filteredFriends = friends?.filter(friend => 
    friend.friend?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <>
      <Helmet>
        <title>Friends | SafeCamp</title>
      </Helmet>
      
      <div className="container max-w-md mx-auto py-4 px-4 pb-24">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Friends</h1>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="all" className="flex-1">All Friends</TabsTrigger>
            <TabsTrigger value="suggestions" className="flex-1">Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="mb-6">
              <Input
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                <FriendSkeleton />
                <FriendSkeleton />
                <FriendSkeleton />
              </div>
            ) : filteredFriends && filteredFriends.length > 0 ? (
              <div className="space-y-4">
                {filteredFriends.map(friendship => (
                  <div key={friendship.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/creator/${friendship.friend?.id}`}>
                        <Avatar>
                          <AvatarImage src={friendship.friend?.avatar_url || undefined} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      
                      <div>
                        <Link to={`/creator/${friendship.friend?.id}`} className="font-medium hover:underline">
                          {friendship.friend?.display_name || "User"}
                        </Link>
                        {friendship.friend?.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {friendship.friend.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/messages?user=${friendship.friend?.id}`}>
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground mb-4">No friends yet</p>
                <p className="text-sm text-muted-foreground">
                  Start exploring SafeCamp to connect with other campers
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="suggestions">
            <div className="text-center py-8 border rounded-md">
              <p className="text-muted-foreground mb-4">Coming soon!</p>
              <p className="text-sm text-muted-foreground">
                We're working on friend suggestions based on your camping interests
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

const FriendSkeleton = () => (
  <div className="flex items-center justify-between border-b pb-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div>
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
    <Skeleton className="h-8 w-8 rounded-md" />
  </div>
);

export default FriendsPage;
