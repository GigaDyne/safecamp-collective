
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Conversation, UserProfile, Message } from "@/lib/community/types";
import { toast } from "@/hooks/use-toast";

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch conversations
  useEffect(() => {
    if (!user?.id) return;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        // Get conversations where the current user is either user1 or user2
        const { data: conversationsData, error } = await supabase
          .from('conversations')
          .select(`
            *,
            other_user:user_profiles!conversations_user2_id_fkey(
              id, display_name, avatar_url
            ),
            last_message:messages(
              id, content, created_at
            )
          `)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('last_message_at', { ascending: false });

        if (error) throw error;

        // Process the conversations data
        const formattedConversations = conversationsData.map((conv) => ({
          ...conv,
          other_user: conv.other_user[0],
          last_message: conv.last_message[0]
        }));

        setConversations(formattedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Failed to load conversations",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user?.id]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user?.id}.and.recipient_id.eq.${selectedConversation.other_user?.id},sender_id.eq.${selectedConversation.other_user?.id}.and.recipient_id.eq.${user?.id}`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data);

        // Mark messages as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .match({ recipient_id: user?.id, sender_id: selectedConversation.other_user?.id, is_read: false });
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Failed to load messages",
          description: "Please try again later",
          variant: "destructive"
        });
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation.id}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages((prev) => [...prev, newMessage]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversation, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user?.id) return;

    try {
      // Insert the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedConversation.other_user?.id,
          content: newMessage,
          is_read: false
        })
        .select();

      if (error) throw error;

      // Update the conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="mb-4 text-center">Please log in to view your messages</p>
        <Button onClick={() => navigate("/login")}>Log In</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-border p-4 flex items-center">
        {selectedConversation ? (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedConversation(null)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8 mr-3">
              <AvatarImage src={selectedConversation.other_user?.avatar_url || undefined} />
              <AvatarFallback>{selectedConversation.other_user?.display_name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{selectedConversation.other_user?.display_name || 'User'}</div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold">Messages</h1>
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {selectedConversation ? (
          // Message view
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" id="message-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender_id === user.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          // Conversations list
          <div className="h-full overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">Loading conversations...</div>
            ) : conversations.length > 0 ? (
              <div className="divide-y divide-border">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-4 hover:bg-muted cursor-pointer"
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={conversation.other_user?.avatar_url || undefined} />
                        <AvatarFallback>{conversation.other_user?.display_name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium truncate">
                            {conversation.other_user?.display_name || 'Unknown User'}
                          </h3>
                          {conversation.last_message && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(conversation.last_message.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {conversation.last_message && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <p>No conversations yet</p>
                <p className="text-sm">Messages from other users will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
