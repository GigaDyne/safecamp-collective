
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Search, MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/lib/community/types";
import { useToast } from "@/hooks/use-toast";

export default function NewConversationDialog({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isStartingConversation, setIsStartingConversation] = useState(false);

  // Search for users whenever search term changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim() || searchTerm.length < 3) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .neq('id', user?.id || '')
          .or(`display_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
          .limit(10);

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
        toast({
          title: "Search failed",
          description: "Could not search for users",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, user?.id, toast]);

  const handleUserSelect = (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
  };

  const startConversation = async () => {
    if (!selectedUser || !user) return;

    setIsStartingConversation(true);
    try {
      // Check if a conversation already exists
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user.id}.and.user2_id.eq.${selectedUser.id},user1_id.eq.${selectedUser.id}.and.user2_id.eq.${user.id}`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingConversation) {
        // Navigate to existing conversation
        navigate('/messages');
        setOpen(false);
        setSelectedUser(null);
        setSearchTerm("");
        return;
      }

      // Create a new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: selectedUser.id
        })
        .select();

      if (createError) throw createError;

      // Navigate to messages page
      navigate('/messages');
      toast({
        title: "Conversation started",
        description: `You can now message ${selectedUser.display_name || 'this user'}`,
      });
      
      setOpen(false);
      setSelectedUser(null);
      setSearchTerm("");
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Failed to start conversation",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsStartingConversation(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Search for users to start a conversation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {selectedUser ? (
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback>{selectedUser.display_name?.charAt(0) || <User />}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedUser.display_name || 'User'}</h3>
                  {selectedUser.bio && (
                    <p className="text-sm text-muted-foreground truncate">{selectedUser.bio}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedUser(null)}
                >
                  Back to search
                </Button>
                <Button 
                  onClick={startConversation} 
                  disabled={isStartingConversation}
                >
                  {isStartingConversation ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Start conversation
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg">
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : users.length > 0 ? (
                <div className="divide-y">
                  {users.map((userProfile) => (
                    <div 
                      key={userProfile.id}
                      className="flex items-center p-3 hover:bg-muted cursor-pointer"
                      onClick={() => handleUserSelect(userProfile)}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={userProfile.avatar_url || undefined} />
                        <AvatarFallback>{userProfile.display_name?.charAt(0) || <User />}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{userProfile.display_name || 'User'}</h3>
                        {userProfile.bio && (
                          <p className="text-sm text-muted-foreground truncate">{userProfile.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm.length >= 3 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Type at least 3 characters to search
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogClose asChild>
          <Button variant="outline" className={selectedUser ? 'hidden' : ''}>Cancel</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
