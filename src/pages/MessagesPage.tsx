
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, User, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Conversation, UserProfile, Message } from "@/lib/community/types";
import { useToast } from "@/hooks/use-toast";
import NewConversationDialog from "@/components/messages/NewConversationDialog";

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
            user1:user1_id(id, display_name, avatar_url),
            user2:user2_id(id, display_name, avatar_url)
          `)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('last_message_at', { ascending: false });

        if (error) throw error;

        // Process the conversations data to determine the "other user"
        const formattedConversations = conversationsData.map((conv) => {
          const otherUser = conv.user1_id === user.id ? conv.user2[0] : conv.user1[0];
          return {
            ...conv,
            other_user: otherUser
          };
        });

        // Now get the last message for each conversation
        for (const conv of formattedConversations) {
          const { data: lastMessage, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${user.id}.and.recipient_id.eq.${conv.other_user.id},sender_id.eq.${conv.other_user.id}.and.recipient_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(1);

          if (!msgError && lastMessage && lastMessage.length > 0) {
            conv.last_message = lastMessage[0];
          }
        }

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
  }, [user?.id, toast]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !user?.id) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id}.and.recipient_id.eq.${selectedConversation.other_user.id},sender_id.eq.${selectedConversation.other_user.id}.and.recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);

        // Mark messages as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .match({ recipient_id: user.id, sender_id: selectedConversation.other_user.id, is_read: false });
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

    // Scroll to the bottom when messages change
    scrollToBottom();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        if (selectedConversation && 
            (newMessage.sender_id === selectedConversation.other_user.id || 
             newMessage.recipient_id === selectedConversation.other_user.id)) {
          setMessages((prev) => [...prev, newMessage]);
          
          // Mark as read immediately if it's from the current conversation
          if (newMessage.sender_id === selectedConversation.other_user.id) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMessage.id);
          }
          
          // Scroll to bottom when new message arrives
          setTimeout(scrollToBottom, 100);
        }
        
        // Refresh conversations list to show the latest message
        refreshConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, user?.id, toast]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Refresh conversations list (for showing latest messages)
  const refreshConversations = async () => {
    if (!user?.id) return;
    
    try {
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:user1_id(id, display_name, avatar_url),
          user2:user2_id(id, display_name, avatar_url)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Process the conversations data
      const formattedConversations = conversationsData.map((conv) => {
        const otherUser = conv.user1_id === user.id ? conv.user2[0] : conv.user1[0];
        return {
          ...conv,
          other_user: otherUser
        };
      });

      // Get last message for each conversation
      for (const conv of formattedConversations) {
        const { data: lastMessage, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id}.and.recipient_id.eq.${conv.other_user.id},sender_id.eq.${conv.other_user.id}.and.recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!msgError && lastMessage && lastMessage.length > 0) {
          conv.last_message = lastMessage[0];
        }
      }

      setConversations(formattedConversations);
      
      // If there's a selected conversation, update it
      if (selectedConversation) {
        const updated = formattedConversations.find(c => c.id === selectedConversation.id);
        if (updated) {
          setSelectedConversation(updated);
        }
      }
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user?.id) return;

    try {
      // Insert the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedConversation.other_user.id,
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
      
      // Refresh the conversation list
      refreshConversations();
      
      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="mb-4 text-center">Please log in to view your messages</p>
        <Button onClick={() => navigate("/auth/login")}>Log In</Button>
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
              <AvatarFallback>
                {selectedConversation.other_user?.display_name?.charAt(0) || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{selectedConversation.other_user?.display_name || 'User'}</div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold">Messages</h1>
            <NewConversationDialog>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                New
              </Button>
            </NewConversationDialog>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {selectedConversation ? (
          // Message view
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" id="message-container">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground p-4">
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation by sending a message</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg relative group ${
                        message.sender_id === user.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary'
                      }`}
                    >
                      {message.content}
                      <div className="text-xs opacity-70 mt-1 text-right">
                        {formatDate(message.created_at)}
                        {message.sender_id === user.id && (
                          <span className="ml-2">
                            {message.is_read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
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
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
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
                        <AvatarFallback>
                          {conversation.other_user?.display_name?.charAt(0) || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium truncate">
                            {conversation.other_user?.display_name || 'Unknown User'}
                          </h3>
                          {conversation.last_message && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(conversation.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        {conversation.last_message ? (
                          <div className="flex items-center">
                            <p className="text-sm text-muted-foreground truncate flex-1">
                              {conversation.last_message.sender_id === user.id && (
                                <span className="text-xs mr-1 opacity-70">You: </span>
                              )}
                              {conversation.last_message.content}
                            </p>
                            {!conversation.last_message.is_read && 
                              conversation.last_message.recipient_id === user.id && (
                                <div className="w-2 h-2 rounded-full bg-primary ml-2 flex-shrink-0"></div>
                              )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No messages yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
                <div className="text-center text-muted-foreground">
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new conversation to connect with other users</p>
                </div>
                <NewConversationDialog>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Conversation
                  </Button>
                </NewConversationDialog>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
