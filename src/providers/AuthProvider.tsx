
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for active session on initial load
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (data?.session) {
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData.user) {
            // Check if email is verified
            const isVerified = userData.user.email_confirmed_at !== null;
            setIsEmailVerified(isVerified);
            
            // Set user data
            setUser({
              id: userData.user.id,
              email: userData.user.email || '',
              createdAt: new Date(userData.user.created_at || Date.now()).toLocaleDateString()
            });
            
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        toast({
          title: "Authentication Error",
          description: "There was a problem checking your session. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session) {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
              // Check if email is verified
              const isVerified = data.user.email_confirmed_at !== null;
              setIsEmailVerified(isVerified);
              
              // Set user data
              setUser({
                id: data.user.id,
                email: data.user.email || '',
                createdAt: new Date(data.user.created_at || Date.now()).toLocaleDateString()
              });
              
              setIsAuthenticated(true);
            }
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsAuthenticated(false);
          setIsEmailVerified(false);
          navigate("/login");
        } else if (event === "USER_UPDATED") {
          // Refresh user data when updated
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            // Check if email is verified
            const isVerified = data.user.email_confirmed_at !== null;
            setIsEmailVerified(isVerified);
            
            if (isVerified && !isEmailVerified) {
              toast({
                title: "Email Verified",
                description: "Your email has been successfully verified."
              });
            }
            
            // Set user data
            setUser({
              id: data.user.id,
              email: data.user.email || '',
              createdAt: new Date(data.user.created_at || Date.now()).toLocaleDateString()
            });
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, toast, isEmailVerified]);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Sign Up Successful",
        description: "Please check your email for a confirmation link."
      });
      
      navigate("/verify-email", { state: { email } });
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "There was a problem signing up. Please try again.",
        variant: "destructive"
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      const isVerified = data.user.email_confirmed_at !== null;
      setIsEmailVerified(isVerified);
      
      if (!isVerified) {
        toast({
          title: "Email Not Verified",
          description: "Please check your email and verify your account before logging in.",
          variant: "destructive"
        });
        
        // Send another verification email
        await supabase.auth.resend({
          type: 'signup',
          email
        });
        
        navigate("/verify-email", { state: { email } });
        return;
      }
      
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        createdAt: new Date(data.user.created_at || Date.now()).toLocaleDateString()
      });
      
      setIsAuthenticated(true);
      
      toast({
        title: "Sign In Successful",
        description: "Welcome back!"
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAuthenticated(false);
      setIsEmailVerified(false);
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
      
      navigate("/login");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign Out Failed",
        description: error.message || "There was a problem signing out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isEmailVerified,
        signUp,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
